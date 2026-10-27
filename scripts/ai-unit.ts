// File-based steps for writing questions inside Claude Code (no API key): writer agents produce raw JSON,
// this script runs the same checks as gen-ai-questions.ts, writes a blind copy for solver agents, grades
// their verdicts against the hidden answer key, and collects what passed so the generator can assemble tests offline.
//
//   node scripts/ai-unit.ts jobs <test>                         write prompts, print jobs still to do
//   node scripts/ai-unit.ts check <level> <type> <test> <try>   validate content/.ai-cache/raw/<…>.json
//   node scripts/ai-unit.ts grade <level> <type> <test> <try>   grade content/.ai-cache/verdicts/<…>.json
//   node scripts/ai-unit.ts context-blind <level> <test>        blind copy of draft word-in-context questions
//   node scripts/ai-unit.ts context-grade <level> <test>        mark the ones that passed as verified
//   node scripts/ai-unit.ts collect <test>                      merge passed questions into the generator cache
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { BLUEPRINTS, QUESTION_TYPES, type QuestionType } from "../content/blueprints.ts";
import { LEVELS, type Level } from "../lib/openjlpt.ts";
import type { Passage, Question, Test } from "../lib/questions.ts";
import {
  DATA_TYPES, DRAFT_TYPES, VerdictSchema, UnitSchema, hash, judge, passagesFor, systemPrompt, toUnit, unitPrompt, verifyPrompt,
} from "./gen-ai-questions.ts";

const C = join(process.cwd(), "content", ".ai-cache");
const name = (level: Level, test: number, type: string) => `${level.toLowerCase()}-t${test}-${type}`;
const paths = (level: Level, test: number, type: string, attempt: number | string) => ({
  raw: join(C, "raw", `${name(level, test, type)}-a${attempt}.json`),
  unit: join(C, "units", `${name(level, test, type)}-a${attempt}.json`),
  blind: join(C, "blind", `${name(level, test, type)}-a${attempt}.txt`),
  verdicts: join(C, "verdicts", `${name(level, test, type)}-a${attempt}.json`),
  accepted: join(C, "accepted", `${name(level, test, type)}.json`),
});
const read = async <T>(file: string, fallback: T): Promise<T> => JSON.parse(await readFile(file, "utf8").catch(() => JSON.stringify(fallback)));
const write = async (file: string, data: unknown) => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, typeof data === "string" ? data : JSON.stringify(data, null, 1));
};
const out = (data: unknown) => console.log(JSON.stringify(data, null, 1));

type Accepted = { questions: Question[]; passages: Passage[]; firstPass: number; firstFail: number; failures: string[] };
const countFor = (level: Level, type: QuestionType) =>
  BLUEPRINTS[level].sections.flatMap((s) => s.parts).find((p) => p.type === type)?.count ?? 0;
const writtenTypes = (level: Level) =>
  BLUEPRINTS[level].sections
    .flatMap((s) => s.parts)
    .filter((p) => QUESTION_TYPES[p.type].area !== "listening" && !DATA_TYPES.includes(p.type));

async function usedInTests(level: Level) {
  const { readdir } = await import("node:fs/promises");
  const dir = join(process.cwd(), "content", "tests");
  const ids = new Set<string>();
  for (const f of (await readdir(dir).catch(() => [] as string[])).filter((f) => f.startsWith(level.toLowerCase()) && f.includes("-test-")))
    for (const s of (JSON.parse(await readFile(join(dir, f), "utf8")) as Test).sections) s.questionIds.forEach((id) => ids.add(id));
  return ids;
}
const contextFile = (level: Level) => join(process.cwd(), "content", "questions", level.toLowerCase(), "context.json");

async function jobs(test: number) {
  const todo = [];
  for (const level of LEVELS) {
    await write(join(C, "prompts", `${name(level, test, "system")}.txt`), systemPrompt(level, test));
    for (const p of writtenTypes(level)) {
      if (DRAFT_TYPES.includes(p.type)) {
        const used = await usedInTests(level);
        const ready = (await read<Question[]>(contextFile(level), [])).filter((q) => q.status === "verified" && !used.has(q.id)).length;
        if (ready < p.count) todo.push({ id: name(level, test, p.type), level, type: p.type, count: p.count, kind: "context", need: p.count - ready });
        continue;
      }
      const acc = await read<Accepted | null>(paths(level, test, p.type, 0).accepted, null);
      const need = p.count - (acc?.questions.length ?? 0);
      if (need <= 0) continue;
      await write(join(C, "prompts", `${name(level, test, p.type)}.txt`), unitPrompt(level, p.type, p.count, passagesFor(p.type, p.count), []));
      todo.push({ id: name(level, test, p.type), level, type: p.type, count: p.count, kind: "ai", need });
    }
  }
  out(todo);
}

async function check(level: Level, type: QuestionType, test: number, attempt: number) {
  const p = paths(level, test, type, attempt);
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(p.raw, "utf8"));
  } catch (e) {
    return out({ ok: false, problems: [`cannot read ${p.raw} as JSON: ${(e as Error).message}`] });
  }
  const parsed = UnitSchema.safeParse(raw);
  if (!parsed.success) return out({ ok: false, problems: parsed.error.issues.slice(0, 12).map((i) => `${i.path.join(".")}: ${i.message}`) });
  const abbrev = type.split("-").map((w) => w[0]).join("");
  const { unit, problems } = toUnit(level, type, `${level.toLowerCase()}-t${test}-${abbrev}a${attempt}`, parsed.data);
  const want = attempt === 1 ? countFor(level, type) : undefined;
  if (want && unit.questions.length !== want) problems.set("count", `${unit.questions.length} questions, the task asks for ${want}`);
  await write(p.unit, { ...unit, problems: Object.fromEntries(problems) });
  const clean = unit.questions.filter((q) => !problems.has(q.id));
  await write(p.blind, verifyPrompt(level, clean, unit.passages));
  out({ ok: problems.size === 0, questions: unit.questions.length, problems: [...problems.values()], blind: p.blind });
}

async function grade(level: Level, type: QuestionType, test: number, attempt: number) {
  const p = paths(level, test, type, attempt);
  const unit = await read<{ questions: Question[]; passages: Passage[]; problems: Record<string, string> }>(p.unit, { questions: [], passages: [], problems: {} });
  const verdicts = VerdictSchema.parse(await read(p.verdicts, { verdicts: [] })).verdicts;
  const byId = new Map(verdicts.map((v) => [v.id, v]));
  const failures = new Map<string, string>(Object.entries(unit.problems).filter(([id]) => id !== "count"));
  for (const q of unit.questions) {
    if (failures.has(q.id)) continue;
    const why = judge(q, byId.get(q.id));
    if (why) failures.set(q.id, why);
  }
  // A passage ships only with all of its questions, so reading sets stay whole.
  const okPassages = unit.passages.filter((ps) => unit.questions.filter((q) => q.passageId === ps.id).every((q) => !failures.has(q.id)));
  const ok = unit.questions.filter((q) => !failures.has(q.id) && (!q.passageId || okPassages.some((ps) => ps.id === q.passageId)));

  const count = countFor(level, type);
  const acc = await read<Accepted>(p.accepted, { questions: [], passages: [], firstPass: 0, firstFail: 0, failures: [] });
  if (attempt === 1) {
    acc.firstPass = unit.questions.length - failures.size;
    acc.firstFail = failures.size;
  }
  const take = ok.slice(0, count - acc.questions.length).map((q) => ({ ...q, status: "verified" as const }));
  acc.questions.push(...take);
  acc.passages.push(...okPassages.filter((ps) => take.some((q) => q.passageId === ps.id)));
  acc.failures.push(...[...failures].map(([id, why]) => `${id}: ${why}`));
  await write(p.accepted, acc);
  out({ passed: ok.length, of: unit.questions.length, accepted: acc.questions.length, count, remaining: count - acc.questions.length, failures: [...failures].map(([id, why]) => `${id}: ${why}`) });
}

async function contextBlind(level: Level, test: number) {
  const used = await usedInTests(level);
  const all = await read<Question[]>(contextFile(level), []);
  const ready = all.filter((q) => q.status === "verified" && !used.has(q.id)).length;
  const need = countFor(level, "context") - ready;
  const candidates = all.filter((q) => q.status === "draft" && !used.has(q.id)).sort((a, b) => hash(a.id) - hash(b.id)).slice(0, Math.max(0, need) * 3);
  const p = paths(level, test, "context", "x");
  await write(p.unit, { questions: candidates, passages: [], problems: {} });
  await write(p.blind, verifyPrompt(level, candidates, []));
  out({ need, candidates: candidates.length, blind: p.blind });
}

async function contextGrade(level: Level, test: number) {
  const p = paths(level, test, "context", "x");
  const unit = await read<{ questions: Question[] }>(p.unit, { questions: [] });
  const byId = new Map(VerdictSchema.parse(await read(p.verdicts, { verdicts: [] })).verdicts.map((v) => [v.id, v]));
  const failures = unit.questions.map((q) => [q.id, judge(q, byId.get(q.id))] as const).filter(([, why]) => why);
  const passed = new Set(unit.questions.map((q) => q.id).filter((id) => !failures.some(([f]) => f === id)));
  const all = await read<Question[]>(contextFile(level), []);
  await write(contextFile(level), JSON.stringify(all.map((q) => (passed.has(q.id) ? { ...q, status: "verified" } : q)), null, 1) + "\n");
  out({ passed: passed.size, of: unit.questions.length, failures: failures.map(([id, why]) => `${id}: ${why}`) });
}

async function collect(test: number) {
  const summary = [];
  for (const level of LEVELS) {
    const cacheFile = join(C, `${level.toLowerCase()}-t${test}.json`);
    const cache = await read<Record<string, unknown>>(cacheFile, {});
    for (const p of writtenTypes(level).filter((p) => !DRAFT_TYPES.includes(p.type))) {
      const file = paths(level, test, p.type, 0).accepted;
      if (!existsSync(file)) continue;
      const acc = await read<Accepted>(file, { questions: [], passages: [], firstPass: 0, firstFail: 0, failures: [] });
      const report = { level, type: p.type, wanted: p.count, firstPass: acc.firstPass, firstFail: acc.firstFail, shipped: acc.questions.length, failures: acc.failures };
      cache[p.type] = { ids: acc.questions.map((q) => q.id), questions: acc.questions, passages: acc.passages, report };
      summary.push({ level, type: p.type, shipped: `${acc.questions.length}/${p.count}`, firstPass: acc.firstPass, firstFail: acc.firstFail });
    }
    await write(cacheFile, cache);
  }
  out(summary);
}

const [cmd, ...a] = process.argv.slice(2);
const lvl = (s: string) => {
  const l = LEVELS.find((x) => x.toLowerCase() === s?.toLowerCase());
  if (!l) throw new Error(`unknown level ${s}`);
  return l;
};
if (cmd === "jobs") await jobs(Number(a[0]));
else if (cmd === "check") await check(lvl(a[0]), a[1] as QuestionType, Number(a[2]), Number(a[3]));
else if (cmd === "grade") await grade(lvl(a[0]), a[1] as QuestionType, Number(a[2]), Number(a[3]));
else if (cmd === "context-blind") await contextBlind(lvl(a[0]), Number(a[1]));
else if (cmd === "context-grade") await contextGrade(lvl(a[0]), Number(a[1]));
else if (cmd === "collect") await collect(Number(a[0]));
else throw new Error("usage: jobs | check | grade | context-blind | context-grade | collect (see the comment at the top)");
