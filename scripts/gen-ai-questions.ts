// Writes original JLPT-format questions with Claude, then has a second model solve each one blind.
// A question ships only if the solver reaches the same answer and finds exactly one correct option,
// natural Japanese and a level-appropriate difficulty. Data-built questions fill the vocabulary types.
//
//   npm run content:ai -- --test 1            all levels (listening comes later, with audio)
//   npm run content:ai -- --test 1 --level N5
//   npm run content:ai -- --test 1 --dry-run  shows the plan and prompt sizes without calling the API
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ApiError, GoogleGenAI } from "@google/genai";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { BLUEPRINTS, QUESTION_TYPES, type QuestionType } from "../content/blueprints.ts";
import { grammarPoints, kanjiList, words } from "../lib/dictionary.ts";
import { LEVELS, type Level } from "../lib/openjlpt.ts";
import { checkQuestion, type Passage, type Question, type Test } from "../lib/questions.ts";

// Gemini's free tier when a Gemini key is set, otherwise Claude. Writer and checker are different models,
// so the blind solve doesn't share the writer's blind spots.
const GEMINI = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
const GEN_MODEL = GEMINI ? "gemini-3.8-flash" : "claude-opus-5-5";
const CHECK_MODEL = GEMINI ? "gemini-3.6-flash" : "claude-sonnet-5-5";
// $ per million tokens (first-party API, 2026-10). Cache writes are 1.25x input. Gemini free tier costs nothing.
const PRICES: Record<string, { in: number; out: number; cacheRead: number; cacheWrite: number }> = {
  "claude-opus-5-5": { in: 4, out: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-sonnet-5-5": { in: 2, out: 10, cacheRead: 0.2, cacheWrite: 2.5 },
};

const DATA_TYPES: QuestionType[] = ["kanji-reading", "orthography"];
const DRAFT_TYPES: QuestionType[] = ["context"];
const PASSAGE_TYPES: QuestionType[] = [
  "text-grammar", "reading-short", "reading-mid", "reading-long", "integrated-reading", "thematic-reading", "info-search",
];

// What each type asks for, in Ganbaru's words. Lengths are rough targets in Japanese characters per passage.
const SPECS: Partial<Record<QuestionType, string>> = {
  paraphrase:
    "A sentence with one word or phrase marked [[like this]]. The four options are expressions; the answer is the one closest in meaning to the marked part in this sentence. Wrong options are plausible words of the same kind that change the meaning.",
  usage:
    "The stem is only the target word, written plainly. The four options are sentences that each use the word; exactly one uses it correctly and naturally. The others misuse it (wrong meaning or collocation) while looking grammatical.",
  "word-formation":
    "A sentence with a blank （　） directly before or after a word, filled by a prefix or suffix (for example 無, 不, 非, 的, 化, 感). The four options are prefixes or suffixes; exactly one forms a real, fitting word.",
  "grammar-form":
    "A sentence with one blank （　）. The four options are grammar forms (particles, conjugations, grammar patterns); exactly one fits grammatically and in meaning. Test a different grammar point from the list in each question.",
  "sentence-order":
    "A sentence with four slots, written as ＿＿＿ with the third slot written ＿★＿, for example わたしは ＿＿＿ ＿＿＿ ＿★＿ ＿＿＿ です。 The four options are the four pieces that fill the slots; the answer is the piece in the ★ slot when the sentence is put in the only correct order. The explanation must give the whole correct sentence.",
  "text-grammar":
    "One passage (a short essay, letter or blog post) with numbered blanks written （1）, （2） and so on. Each question's stem is just its blank number, like （1）. Options can be words, phrases, conjunctions or sentence endings, judged by the flow of the whole text.",
  "reading-short": "Short texts (a notice, email, memo or short essay), each followed by one question about its content or purpose.",
  "reading-mid": "Mid-length texts (an essay or explanation), each followed by two or three questions on reasons, what a phrase refers to, or the writer's view.",
  "reading-long": "One long text followed by questions on its overall point, the writer's reasoning and details.",
  "integrated-reading":
    "One passage containing two short texts headed A and B that discuss the same topic from different angles. Questions ask what both say, or how they differ.",
  "thematic-reading": "One long argumentative essay. Questions ask about the writer's claim and how it is supported.",
  "info-search":
    "One information sheet (a notice, timetable, price list or set of rules) laid out with line breaks. Questions ask the reader to find what meets given conditions.",
};
const LENGTHS: Record<Level, Partial<Record<QuestionType, string>>> = {
  N5: { "reading-short": "80-150", "reading-mid": "250-350", "info-search": "150-250", "text-grammar": "200-300" },
  N4: { "reading-short": "100-200", "reading-mid": "350-450", "info-search": "200-300", "text-grammar": "250-350" },
  N3: { "reading-short": "150-250", "reading-mid": "350-450", "reading-long": "550-700", "info-search": "300-450", "text-grammar": "350-450" },
  N2: { "reading-short": "200-250", "reading-mid": "450-550", "integrated-reading": "500-650 for both texts", "thematic-reading": "800-950", "info-search": "400-600", "text-grammar": "450-600" },
  N1: { "reading-short": "200-300", "reading-mid": "500-600", "reading-long": "900-1100", "integrated-reading": "550-700 for both texts", "thematic-reading": "900-1100", "info-search": "500-700", "text-grammar": "550-700" },
};

const QuestionSchema = z.object({
  stem: z.string(),
  options: z.array(z.string()),
  answer: z.number().describe("1-4"),
  explanation: z.string(),
  translation: z.string(),
  passage: z.number().nullable().describe("0-based index into passages, or null"),
});
const UnitSchema = z.object({
  passages: z.array(z.object({ text: z.string(), translation: z.string() })),
  questions: z.array(QuestionSchema),
});
const VerdictSchema = z.object({
  verdicts: z.array(
    z.object({
      id: z.string(),
      answer: z.number().describe("1-4"),
      exactlyOneCorrect: z.boolean(),
      naturalJapanese: z.boolean(),
      levelAppropriate: z.boolean(),
      problem: z.string(),
    }),
  ),
});
type Verdict = z.infer<typeof VerdictSchema>["verdicts"][number];

// ── cost tracking ────────────────────────────────────────────────────────────
const spend = new Map<string, { calls: number; in: number; out: number; cacheRead: number; cacheWrite: number }>();
function track(model: string, u: { in: number; out: number; cacheRead?: number; cacheWrite?: number }) {
  const s = spend.get(model) ?? { calls: 0, in: 0, out: 0, cacheRead: 0, cacheWrite: 0 };
  s.calls++;
  s.in += u.in;
  s.out += u.out;
  s.cacheRead += u.cacheRead ?? 0;
  s.cacheWrite += u.cacheWrite ?? 0;
  spend.set(model, s);
}
const dollars = (model: string) => {
  const s = spend.get(model);
  const p = PRICES[model];
  if (!s || !p) return 0;
  return (s.in * p.in + s.out * p.out + s.cacheRead * p.cacheRead + s.cacheWrite * p.cacheWrite) / 1e6;
};

let anthropic: Anthropic | undefined;
let gemini: GoogleGenAI | undefined;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ask<T extends z.ZodType>(model: string, system: string, user: string, schema: T, effort: "medium" | "high") {
  return GEMINI ? askGemini(model, system, user, schema, effort) : askClaude(model, system, user, schema, effort);
}

async function askGemini<T extends z.ZodType>(model: string, system: string, user: string, schema: T, effort: "medium" | "high") {
  gemini ??= new GoogleGenAI({});
  // The free tier allows only a few requests a minute, so rate-limit and overload errors wait and retry.
  for (let attempt = 1; ; attempt++) {
    try {
      const interaction = await gemini.interactions.create({
        model,
        system_instruction: system,
        input: user,
        response_format: { type: "text", mime_type: "application/json", schema: z.toJSONSchema(schema) },
        generation_config: { thinking_level: effort },
      });
      track(model, { in: interaction.usage?.total_input_tokens ?? 0, out: (interaction.usage?.total_output_tokens ?? 0) + (interaction.usage?.total_thought_tokens ?? 0) });
      if (!interaction.output_text) throw new Error(`${model} returned no text (status ${interaction.status})`);
      return schema.parse(JSON.parse(interaction.output_text)) as z.infer<T>;
    } catch (err) {
      const retryable = err instanceof ApiError && (err.status === 429 || err.status >= 500);
      if (!retryable || attempt >= 8) throw err;
      const wait = Math.min(120, 15 * attempt);
      console.log(`  ${model}: HTTP ${(err as ApiError).status}, waiting ${wait}s (try ${attempt}/8)`);
      await sleep(wait * 1000);
    }
  }
}

async function askClaude<T extends z.ZodType>(model: string, system: string, user: string, schema: T, effort: "medium" | "high") {
  const client = (anthropic ??= new Anthropic());
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 64000,
    // Refusals are unlikely for exam content; if one happens the API retries on a fallback model instead of failing.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: user }],
    output_config: { effort, format: betaZodOutputFormat(schema) },
  });
  const message = await stream.finalMessage();
  const u = message.usage;
  track(message.model, { in: u.input_tokens, out: u.output_tokens, cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0 });
  if (message.stop_reason === "refusal") throw new Error(`${model} declined: ${message.stop_details?.explanation ?? "no reason given"}`);
  if (message.stop_reason === "max_tokens") throw new Error(`${model} hit max_tokens`);
  if (!message.parsed_output) throw new Error(`${model} returned no parseable output`);
  return message.parsed_output as z.infer<T>;
}

// ── level context ────────────────────────────────────────────────────────────
const KANJI = /[一-鿿々]/g;
const rank = (l: Level) => LEVELS.indexOf(l);
const allowedKanji = (level: Level) => new Set(kanjiList.filter((k) => rank(k.level) <= rank(level)).map((k) => k.character));

/** Kanji outside the level's list that appear without furigana. The real test glosses those, so we require it too. */
export function unglossedKanji(text: string, level: Level): string[] {
  const allowed = allowedKanji(level);
  const bare = text.replace(/\{[^|{}]+\|[^{}]+\}/g, "");
  return [...new Set(bare.match(KANJI) ?? [])].filter((c) => !allowed.has(c));
}

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return h >>> 0;
}

function systemPrompt(level: Level, testNo: number) {
  const kanji = level === "N1" ? "Any jōyō kanji may be used without furigana." : `Kanji allowed without furigana at ${level}: ${[...allowedKanji(level)].join("")}`;
  const grammar = grammarPoints.filter((g) => g.level === level).map((g) => `- ${g.pattern}: ${g.meaning}`).join("\n");
  const vocab = words
    .filter((w) => w.level === level)
    .sort((a, b) => hash(`${testNo}${a.id}`) - hash(`${testNo}${b.id}`))
    .slice(0, 120)
    .map((w) => `${w.word}（${w.reading}）${w.meanings[0]}`)
    .join("、");

  return `You write original practice questions for the Japanese-Language Proficiency Test (JLPT), level ${level}, for Ganbaru, a study app. Your questions must follow the official question formats and difficulty, but every sentence, passage and option is your own: never reproduce questions from real JLPT papers, the official practice workbooks, or published textbooks and mock-test books.

Quality rules, all required:
- Exactly one option is correct. A proficient reader must be able to rule out each wrong option with confidence; no option may be arguably correct.
- Wrong options are plausible to a learner: same kind of word or form, similar length, nothing silly.
- Japanese is natural, standard and error-free. Topics are everyday, study, work and society; avoid anything upsetting, political or about real named people or companies.
- Difficulty, vocabulary and grammar match ${level}. Lower-level words and grammar are fine; avoid anything clearly above ${level}.
- Kanji: ${kanji} Write any other kanji with furigana in the notation {漢字|かんじ} (whole word in braces, then its kana reading). Don't add furigana to allowed kanji.
- Vary the answer position: across a set, the correct option should land on 1, 2, 3 and 4 about equally often.
- explanation: English, two or three sentences. Say why the answer is right and, briefly, why each other option is wrong.
- translation: English translation of the question's sentence (for passage questions, of the question itself).

Grammar points at ${level}:
${grammar}

Sample ${level} vocabulary to draw on:
${vocab}`;
}

function unitPrompt(level: Level, type: QuestionType, count: number, passages: number, avoid: string[]) {
  const t = QUESTION_TYPES[type];
  const length = LENGTHS[level][type];
  return `Write ${count} question${count > 1 ? "s" : ""} of type ${t.ja} (${t.en}) for ${level}.

Format: ${SPECS[type]}
${PASSAGE_TYPES.includes(type) ? `Write ${passages} passage${passages > 1 ? "s" : ""}${length ? ` of about ${length} characters each` : ""}, and set each question's passage field to the 0-based index of its passage. Put the passage's English translation in its translation field. Give every question exactly four options.` : "Set passage to null and leave passages empty. Give every question exactly four options."}
Number the answer 1-4.${avoid.length ? `\n\nAlready used in this test, so don't repeat these sentences or targets:\n${avoid.slice(0, 40).map((s) => `- ${s}`).join("\n")}` : ""}`;
}

function verifyPrompt(level: Level, questions: Question[], passages: Passage[]) {
  const usedPassages = passages.filter((p) => questions.some((q) => q.passageId === p.id));
  return `Check these JLPT ${level} practice questions. For each one, solve it yourself and pick the single best option (1-4). Then judge strictly:
- exactlyOneCorrect: false if no option is correct or if a second option is also acceptable.
- naturalJapanese: false if any sentence, passage or option has an error or sounds unnatural.
- levelAppropriate: false if the vocabulary, grammar or difficulty is clearly too hard or too easy for ${level}.
- problem: one sentence naming any issue, or an empty string.
Furigana is written {漢字|かな}; [[ ]] marks an underlined part; （　） is a blank; ＿★＿ is the slot being asked about.
${usedPassages.map((p) => `\nPassage ${p.id}:\n${p.text}`).join("\n")}

Questions:
${questions.map((q) => `\nid: ${q.id}${q.passageId ? ` (passage ${q.passageId})` : ""}\n${q.stem}\n${q.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}`).join("\n")}

Return one verdict per question, using the ids above.`;
}

// ── generate and verify one question type ────────────────────────────────────
type Unit = { questions: Question[]; passages: Passage[] };
type TypeReport = { level: Level; type: QuestionType; wanted: number; firstPass: number; firstFail: number; shipped: number; failures: string[] };

async function verify(level: Level, unit: Unit, system: string) {
  if (!unit.questions.length) return new Map<string, string>();
  const out = await ask(CHECK_MODEL, system, verifyPrompt(level, unit.questions, unit.passages), VerdictSchema, "high");
  const byId = new Map(out.verdicts.map((v) => [v.id, v]));
  const failures = new Map<string, string>();
  for (const q of unit.questions) {
    const v: Verdict | undefined = byId.get(q.id);
    if (!v) failures.set(q.id, "no verdict returned");
    else if (v.answer - 1 !== q.answer) failures.set(q.id, `solver chose ${v.answer}, key says ${q.answer + 1}. ${v.problem}`);
    else if (!v.exactlyOneCorrect) failures.set(q.id, `more or less than one correct option. ${v.problem}`);
    else if (!v.naturalJapanese) failures.set(q.id, `unnatural Japanese. ${v.problem}`);
    else if (!v.levelAppropriate) failures.set(q.id, `wrong level. ${v.problem}`);
  }
  return failures;
}

function toUnit(level: Level, type: QuestionType, prefix: string, raw: z.infer<typeof UnitSchema>): { unit: Unit; problems: Map<string, string> } {
  const passages: Passage[] = raw.passages.map((p, i) => ({ id: `${prefix}-p${i + 1}`, level, type, text: p.text, translation: p.translation }));
  const problems = new Map<string, string>();
  const questions: Question[] = raw.questions.map((r, i) => {
    const q: Question = {
      id: `${prefix}-${i + 1}`,
      level,
      type,
      stem: r.stem,
      options: r.options,
      answer: r.answer - 1,
      explanation: r.explanation,
      translation: r.translation,
      ...(r.passage !== null && passages[r.passage] ? { passageId: passages[r.passage].id } : {}),
      source: "ai",
      status: "draft",
    };
    const issues = [...checkQuestion(q)];
    if (PASSAGE_TYPES.includes(type) && !q.passageId) issues.push(`${q.id}: no passage`);
    const text = [q.stem, ...q.options].join(" ");
    const unglossed = unglossedKanji(text, level);
    if (unglossed.length) issues.push(`${q.id}: kanji above ${level} without furigana: ${unglossed.join("")}`);
    if (issues.length) problems.set(q.id, issues.join("; "));
    return q;
  });
  for (const p of passages) {
    const unglossed = unglossedKanji(p.text, level);
    if (unglossed.length)
      for (const q of questions.filter((q) => q.passageId === p.id))
        problems.set(q.id, `${problems.get(q.id) ?? ""} passage kanji above ${level} without furigana: ${unglossed.join("")}`.trim());
  }
  return { unit: { questions, passages }, problems };
}

async function aiType(level: Level, testNo: number, type: QuestionType, count: number, system: string, avoid: string[]) {
  const report: TypeReport = { level, type, wanted: count, firstPass: 0, firstFail: 0, shipped: 0, failures: [] };
  const passageCount = !PASSAGE_TYPES.includes(type)
    ? 0
    : ["reading-short"].includes(type)
      ? count
      : type === "reading-mid"
        ? Math.ceil(count / 3)
        : 1;
  const shipped: Unit = { questions: [], passages: [] };
  const abbrev = type.split("-").map((w) => w[0]).join("");

  for (let attempt = 1; attempt <= 3 && shipped.questions.length < count; attempt++) {
    const need = count - shipped.questions.length;
    // Passage types regenerate whole passages, so a retry asks for the passages still missing.
    const needPassages = passageCount ? Math.max(1, Math.round((passageCount * need) / count)) : 0;
    const prefix = `${level.toLowerCase()}-t${testNo}-${abbrev}${attempt > 1 ? `r${attempt}` : ""}`;
    const raw = await ask(GEN_MODEL, system, unitPrompt(level, type, need, needPassages, avoid), UnitSchema, "high");
    const { unit, problems } = toUnit(level, type, prefix, raw);
    const verdicts = await verify(level, { questions: unit.questions.filter((q) => !problems.has(q.id)), passages: unit.passages }, system);
    for (const [id, why] of verdicts) problems.set(id, why);

    if (attempt === 1) {
      report.firstPass = unit.questions.length - problems.size;
      report.firstFail = problems.size;
    }
    for (const [id, why] of problems) report.failures.push(`${id}: ${why}`);

    // A passage ships only with all of its questions, so a reading set stays whole.
    const okPassages = unit.passages.filter((p) => unit.questions.filter((q) => q.passageId === p.id).every((q) => !problems.has(q.id)));
    const ok = unit.questions.filter((q) => !problems.has(q.id) && (!q.passageId || okPassages.some((p) => p.id === q.passageId)));
    shipped.passages.push(...okPassages);
    shipped.questions.push(...ok.slice(0, need).map((q) => ({ ...q, status: "verified" as const })));
    avoid.push(...ok.map((q) => q.stem.slice(0, 60)));
    console.log(`  ${level} ${type}: attempt ${attempt}, ${ok.length}/${unit.questions.length} passed`);
  }
  report.shipped = shipped.questions.length;
  return { shipped, report };
}

/** Blind-solves draft data questions (word in context) and keeps those that pass. */
async function draftType(level: Level, type: QuestionType, count: number, system: string, exclude: Set<string>) {
  const file = join(process.cwd(), "content", "questions", level.toLowerCase(), `${type}.json`);
  const all: Question[] = JSON.parse(await readFile(file, "utf8"));
  const candidates = all.filter((q) => q.status === "draft" && !exclude.has(q.id)).sort((a, b) => hash(a.id) - hash(b.id)).slice(0, count * 2);
  const failures = await verify(level, { questions: candidates, passages: [] }, system);
  const passed = candidates.filter((q) => !failures.has(q.id));
  const verifiedIds = new Set(passed.map((q) => q.id));
  await writeFile(file, JSON.stringify(all.map((q) => (verifiedIds.has(q.id) ? { ...q, status: "verified" } : q)), null, 1) + "\n");
  const report: TypeReport = {
    level, type, wanted: count, firstPass: passed.length, firstFail: failures.size, shipped: Math.min(count, passed.length),
    failures: [...failures].map(([id, why]) => `${id}: ${why}`),
  };
  return { ids: passed.slice(0, count).map((q) => q.id), report };
}

// ── assemble a test ──────────────────────────────────────────────────────────
async function buildTest(level: Level, testNo: number, dryRun: boolean) {
  const bp = BLUEPRINTS[level];
  const system = systemPrompt(level, testNo);
  const parts = bp.sections.flatMap((s) => s.parts.filter((p) => QUESTION_TYPES[p.type].area !== "listening").map((p) => ({ section: s.id, ...p })));
  if (dryRun) {
    console.log(`\n${level} test ${testNo}: system prompt ${system.length} chars`);
    for (const p of parts)
      console.log(`  ${p.section} ${p.type} x${p.count} from ${DATA_TYPES.includes(p.type) ? "data" : DRAFT_TYPES.includes(p.type) ? "data + blind solve" : "AI + blind solve"}`);
    return { reports: [] as TypeReport[] };
  }

  const dir = join(process.cwd(), "content");
  const used = await usedInTests(level);
  const avoid: string[] = [];
  const picked = new Map<QuestionType, string[]>();
  const aiQuestions: Question[] = [];
  const aiPassages: Passage[] = [];
  const reports: TypeReport[] = [];

  for (const p of parts) {
    if (DATA_TYPES.includes(p.type)) {
      const pool: Question[] = JSON.parse(await readFile(join(dir, "questions", level.toLowerCase(), `${p.type}.json`), "utf8"));
      const ids = pool
        .filter((q) => q.status !== "draft" && !used.has(q.id))
        .sort((a, b) => hash(`${testNo}${a.id}`) - hash(`${testNo}${b.id}`))
        .slice(0, p.count)
        .map((q) => q.id);
      picked.set(p.type, ids);
    } else if (DRAFT_TYPES.includes(p.type)) {
      const { ids, report } = await draftType(level, p.type, p.count, system, used);
      picked.set(p.type, ids);
      reports.push(report);
    } else {
      const { shipped, report } = await aiType(level, testNo, p.type, p.count, system, avoid);
      picked.set(p.type, shipped.questions.map((q) => q.id));
      aiQuestions.push(...shipped.questions);
      aiPassages.push(...shipped.passages);
      reports.push(report);
    }
  }

  await saveMerged(join(dir, "questions", level.toLowerCase(), "ai.json"), aiQuestions, `${level.toLowerCase()}-t${testNo}-`);
  await saveMerged(join(dir, "passages", `${level.toLowerCase()}.json`), aiPassages, `${level.toLowerCase()}-t${testNo}-`);
  const missing = parts.filter((p) => (picked.get(p.type)?.length ?? 0) < p.count);
  const test: Test = {
    id: `${level.toLowerCase()}-test-${testNo}`,
    level,
    title: `${level} mock test ${testNo}`,
    note: `Listening is not included yet.${missing.length ? ` Short: ${missing.map((p) => `${p.type} ${picked.get(p.type)?.length ?? 0}/${p.count}`).join(", ")}.` : ""}`,
    sections: bp.sections
      .map((s) => ({ id: s.id, questionIds: s.parts.flatMap((p) => picked.get(p.type) ?? []) }))
      .filter((s) => s.questionIds.length),
  };
  await mkdir(join(dir, "tests"), { recursive: true });
  await writeFile(join(dir, "tests", `${test.id}.json`), JSON.stringify(test, null, 1) + "\n");
  return { reports };
}

async function usedInTests(level: Level) {
  const { readdir } = await import("node:fs/promises");
  const dir = join(process.cwd(), "content", "tests");
  const files = await readdir(dir).catch(() => [] as string[]);
  const ids = new Set<string>();
  for (const f of files.filter((f) => f.startsWith(level.toLowerCase())))
    for (const s of (JSON.parse(await readFile(join(dir, f), "utf8")) as Test).sections) s.questionIds.forEach((id) => ids.add(id));
  return ids;
}

/** Replaces this test's entries in a JSON array file and keeps everything else. */
async function saveMerged<T extends { id: string }>(file: string, items: T[], prefix: string) {
  const existing: T[] = JSON.parse(await readFile(file, "utf8").catch(() => "[]"));
  await mkdir(join(file, ".."), { recursive: true });
  await writeFile(file, JSON.stringify([...existing.filter((x) => !x.id.startsWith(prefix)), ...items], null, 1) + "\n");
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const arg = (name: string) => args[args.indexOf(name) + 1];
  const testNo = Number(arg("--test") ?? 1);
  const dryRun = args.includes("--dry-run");
  const levels = args.includes("--level") ? [arg("--level") as Level] : [...LEVELS];
  if (!dryRun && !GEMINI && !process.env.ANTHROPIC_API_KEY) throw new Error("No API key. Put GEMINI_API_KEY (free) or ANTHROPIC_API_KEY in .env.local.");
  console.log(`Writer ${GEN_MODEL}, checker ${CHECK_MODEL}`);

  const started = Date.now();
  // Types within a level run in order so later types avoid earlier sentences. Claude runs levels in parallel;
  // Gemini's free tier runs them one at a time, and each finished level is saved before the next starts.
  const results: PromiseSettledResult<{ reports: TypeReport[] }>[] = [];
  if (GEMINI) {
    for (const level of levels) results.push(...(await Promise.allSettled([buildTest(level, testNo, dryRun)])));
  } else results.push(...(await Promise.allSettled(levels.map((level) => buildTest(level, testNo, dryRun)))));
  const reports = results.flatMap((r) => (r.status === "fulfilled" ? r.value.reports : []));
  results.forEach((r, i) => r.status === "rejected" && console.error(`${levels[i]} failed: ${r.reason}`));
  if (dryRun) process.exit(0);

  const total = reports.reduce((n, r) => n + r.firstPass + r.firstFail, 0);
  const failed = reports.reduce((n, r) => n + r.firstFail, 0);
  const cost = [...spend.keys()].reduce((sum, m) => sum + dollars(m), 0); // 0 on the Gemini free tier
  const summary = {
    testNo,
    minutes: Math.round((Date.now() - started) / 60000),
    firstPassErrorRate: total ? failed / total : 0,
    checked: total,
    failedFirstPass: failed,
    costUSD: Math.round(cost * 100) / 100,
    byModel: Object.fromEntries([...spend].map(([m, s]) => [m, { ...s, usd: Math.round(dollars(m) * 100) / 100 }])),
    byType: reports.map((r) => ({ level: r.level, type: r.type, wanted: r.wanted, firstPass: r.firstPass, firstFail: r.firstFail, shipped: r.shipped })),
    failures: reports.flatMap((r) => r.failures),
  };
  await writeFile(join(process.cwd(), "content", "tests", `pilot-report-${testNo}.json`), JSON.stringify(summary, null, 1) + "\n");
  console.log(JSON.stringify({ ...summary, failures: summary.failures.length }, null, 1));
}
