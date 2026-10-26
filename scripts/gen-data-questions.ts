// Builds vocabulary questions straight from OpenJLPT words and their Tatoeba examples, with no AI:
// 漢字読み (kanji reading), 表記 (orthography) and 文脈規定 (word in context). Output: content/questions/<level>/<type>.json.
// Deterministic, so re-running only changes files when the data or these rules change.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { QuestionType } from "../content/blueprints.ts";
import { furiganaParts, kanjiByChar, kanjiList, wordFor, words } from "../lib/dictionary.ts";
import { LEVELS, type Level, type Vocab } from "../lib/openjlpt.ts";
import { checkQuestion, type Question } from "../lib/questions.ts";

const KANJI = /[一-鿿々]/;
const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Stable pseudo-random order so the same data always gives the same questions. */
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return h >>> 0;
}
const pick = <T>(items: T[], n: number, seed: string, key: (item: T) => string = String) =>
  [...items].sort((a, b) => hash(seed + key(a)) - hash(seed + key(b))).slice(0, n);

/**
 * Finds `word` in a furigana sentence and replaces it with `replacement`, keeping the other furigana.
 * Returns null when the word is missing, cuts through a ruby group, or is read differently from `reading`.
 */
export function replaceSpan(furigana: string, word: string, reading: string, replacement: string): string | null {
  const parts = furiganaParts(furigana);
  const plain = parts.map((p) => p.text).join("");
  const start = plain.indexOf(word);
  if (start < 0) return null;
  const end = start + word.length;
  let out = "";
  let spanReading = "";
  let at = 0;
  for (const p of parts) {
    const from = at;
    const to = at + p.text.length;
    at = to;
    if (to <= start || from >= end) {
      out += p.ruby ? `{${p.text}|${p.ruby}}` : p.text;
      continue;
    }
    if (p.ruby) {
      if (from < start || to > end) return null;
      spanReading += p.ruby;
    } else {
      if (from < start) out += p.text.slice(0, start - from);
      spanReading += p.text.slice(Math.max(start, from) - from, Math.min(end, to) - from);
    }
    if (from <= start) out += replacement;
    if (!p.ruby && to > end) out += p.text.slice(end - from);
  }
  return toHira(spanReading) === toHira(reading) ? out : null;
}

const DAKUTEN: Record<string, string> = Object.fromEntries(
  ["かが", "きぎ", "くぐ", "けげ", "こご", "さざ", "しじ", "すず", "せぜ", "そぞ", "ただ", "てで", "とど", "はば", "ひび", "ふぶ", "へべ", "ほぼ"].flatMap(
    ([a, b]) => [[a, b], [b, a]],
  ),
);
const SMALL: Record<string, string> = { ゃ: "や", ゅ: "ゆ", ょ: "よ", や: "ゃ", ゆ: "ゅ", よ: "ょ" };
const O_ROW = "こそとのほもよろごぞどぼぽょ";
const U_ROW = "くすつぬふむゆるぐずづぶぷゅ";

/** Readings a learner might confuse with the real one: long or short vowels, small っ, voicing, small ゃゅょ. */
export function nearMissReadings(reading: string): string[] {
  const r = toHira(reading);
  const out = new Set<string>();
  for (let i = 0; i < r.length; i++) {
    const c = r[i];
    if (c === "っ") out.add(r.slice(0, i) + r.slice(i + 1));
    if (c === "う" && i > 0 && (O_ROW + U_ROW).includes(r[i - 1])) out.add(r.slice(0, i) + r.slice(i + 1));
    if (c === "い" && i > 0 && "けせてねへめれげぜでべぺ".includes(r[i - 1])) out.add(r.slice(0, i) + r.slice(i + 1));
    if (DAKUTEN[c]) out.add(r.slice(0, i) + DAKUTEN[c] + r.slice(i + 1));
    if (SMALL[c] && i > 0) out.add(r.slice(0, i) + SMALL[c] + r.slice(i + 1));
    if (O_ROW.includes(c) && r[i + 1] !== "う") out.add(r.slice(0, i + 1) + "う" + r.slice(i + 1));
    // っ can only follow a short vowel: never ん, a long-vowel う/い, ー, つ or another small kana.
    if (i < r.length - 2 && "かきくけこさしすせそたちつてとぱぴぷぺぽ".includes(r[i + 1]) && !"んういーっつゃゅょ".includes(c))
      out.add(r.slice(0, i + 1) + "っ" + r.slice(i + 1));
  }
  out.delete(r);
  return [...out].filter((v) => v.length >= 2 && !/^[ゃゅょっー]/.test(v));
}

// Kanji grouped by every reading (on'yomi as hiragana, kun'yomi stem before the okurigana dot).
const kanjiReadings = (char: string) => {
  const k = kanjiByChar.get(char);
  return k ? [...k.onyomi.map(toHira), ...k.kunyomi.map((r) => r.replace(/^-|-$/g, "").split(".")[0])] : [];
};
const byReading = new Map<string, string[]>();
for (const k of kanjiList)
  for (const r of kanjiReadings(k.character)) byReading.set(r, [...(byReading.get(r) ?? []), k.character]);

/**
 * Misspellings that swap one kanji for another the learner could confuse by sound: they share a reading that this
 * word actually uses, and the swapped-in kanji is no more than one level harder. Real words are skipped.
 */
export function spellingVariants(word: string, reading: string, level: Level): string[] {
  const sound = toHira(reading);
  const maxLevel = Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1);
  const out = new Set<string>();
  [...word].forEach((c, i) => {
    if (!KANJI.test(c)) return;
    for (const r of kanjiReadings(c)) {
      if (r.length < 1 || !sound.includes(r)) continue;
      for (const other of byReading.get(r) ?? []) {
        const k = kanjiByChar.get(other);
        if (other !== c && k && LEVELS.indexOf(k.level) <= maxLevel) out.add(word.slice(0, i) + other + word.slice(i + 1));
      }
    }
  });
  return [...out].filter((v) => !wordFor(v));
}

const mainPos = (w: Vocab) => w.pos?.find((p) => p !== "vt" && p !== "vi");
const meaning = (w: Vocab) => w.meanings.slice(0, 2).join("; ");

function build(level: Level): Record<"kanji-reading" | "orthography" | "context", Question[]> {
  const pool = words.filter((w) => w.level === level);
  const out = { "kanji-reading": [] as Question[], orthography: [] as Question[], context: [] as Question[] };
  for (const w of pool) {
    const ex = w.examples?.find((e) => e.furigana && replaceSpan(e.furigana, w.word, w.reading, "") !== null);
    if (!ex?.furigana) continue;
    const base = { level, source: "data" as const, translation: ex.en, refs: [w.id] };
    const hasKanji = KANJI.test(w.word);

    if (hasKanji) {
      const wrong = pick(nearMissReadings(w.reading).filter((r) => !w.other_readings?.map(toHira).includes(r)), 3, w.id);
      if (wrong.length === 3) {
        const options = pick([toHira(w.reading), ...wrong], 4, `${w.id}-kr`);
        out["kanji-reading"].push({
          ...base,
          id: `${level.toLowerCase()}-kr-${w.id}`,
          type: "kanji-reading",
          stem: replaceSpan(ex.furigana, w.word, w.reading, `[[${w.word}]]`)!,
          options,
          answer: options.indexOf(toHira(w.reading)),
          explanation: `${w.word} is read ${w.reading} (${meaning(w)}). The other options change a long vowel, a small っ or a voiced sound.`,
          status: "verified",
        });
      }
      const misspelt = pick(spellingVariants(w.word, w.reading, level), 3, w.id);
      if (misspelt.length === 3) {
        const options = pick([w.word, ...misspelt], 4, `${w.id}-or`);
        out.orthography.push({
          ...base,
          id: `${level.toLowerCase()}-or-${w.id}`,
          type: "orthography",
          stem: replaceSpan(ex.furigana, w.word, w.reading, `[[${w.reading}]]`)!,
          options,
          answer: options.indexOf(w.word),
          explanation: `${w.reading} is written ${w.word} (${meaning(w)}). The other options swap in a kanji with a similar reading.`,
          status: "verified",
        });
      }
    }

    const pos = mainPos(w);
    const sentence = ex.ja;
    const rivals = pool.filter(
      (o) => o.id !== w.id && o.word !== w.word && mainPos(o) === pos && !sentence.includes(o.word) && Math.abs(o.word.length - w.word.length) <= 1,
    );
    const wrong = pick(rivals, 3, `${w.id}-cx`, (o) => o.id);
    if (pos && wrong.length === 3) {
      const options = pick([w.word, ...wrong.map((o) => o.word)], 4, `${w.id}-cx`);
      out.context.push({
        ...base,
        id: `${level.toLowerCase()}-cx-${w.id}`,
        type: "context",
        stem: replaceSpan(ex.furigana, w.word, w.reading, "（　）")!,
        options,
        answer: options.indexOf(w.word),
        explanation: `${w.word} (${w.reading}) means "${meaning(w)}", which fits the sentence: ${ex.en}`,
        refs: [w.id, ...wrong.map((o) => o.id)],
        // Another option could also fit the sentence, so these wait for a blind solve before going into mock tests.
        status: "draft",
      });
    }
  }
  return out;
}

if (import.meta.main) {
  const root = join(process.cwd(), "content", "questions");
  let failed = 0;
  for (const level of LEVELS) {
    const built = build(level);
    await mkdir(join(root, level.toLowerCase()), { recursive: true });
    for (const [type, questions] of Object.entries(built) as [QuestionType, Question[]][]) {
      const problems = questions.flatMap(checkQuestion);
      failed += problems.length;
      if (problems.length) console.error(problems.slice(0, 10).join("\n"));
      await writeFile(join(root, level.toLowerCase(), `${type}.json`), JSON.stringify(questions, null, 1) + "\n");
    }
    console.log(`${level}: ${Object.entries(built).map(([t, q]) => `${q.length} ${t}`).join(", ")}`);
  }
  if (failed) throw new Error(`${failed} generated questions failed the checks`);
}
