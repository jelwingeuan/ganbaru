// OpenJLPT (CC BY-SA 4.0): JLPT words and kanji, N5 to N1. Fetched by scripts/openjlpt.ts into data/openjlpt.
// Content stays in these files rather than Postgres; user progress keys on Vocab.id, which OpenJLPT never changes.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type Level = (typeof LEVELS)[number];

export type Example = { ja: string; furigana?: string; en: string; tatoeba_id?: number };

export type Vocab = {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meanings: string[];
  level: Level;
  pos?: string[];
  jmdict_id?: number;
  other_forms?: string[];
  other_readings?: string[];
  examples?: Example[];
};

export type Kanji = {
  character: string;
  level: Level;
  strokes: number | null;
  grade: number | null;
  freq: number | null;
  radical: string | null;
  radical_number: number | null;
  onyomi: string[];
  kunyomi: string[];
  nanori?: string[];
  meanings: string[];
  words?: string[];
  supplementary?: true;
};

type Counts = Record<Level | "total", number>;
export type Meta = { version: string; counts: { vocab: Counts; kanji: Counts } };
export type Dataset = { meta: Meta; vocab: Vocab[]; kanji: Kanji[] };

export const DATA_DIR = join(process.cwd(), "data", "openjlpt");

const read = <T>(dir: string, file: string): T => JSON.parse(readFileSync(join(dir, file), "utf8"));

export function load(dir = DATA_DIR): Dataset {
  const files = LEVELS.map((l) => `${l.toLowerCase()}.json`);
  return {
    meta: read<Meta>(dir, "meta.json"),
    vocab: files.flatMap((f) => read<Vocab[]>(dir, `vocab/${f}`)),
    kanji: files.flatMap((f) => read<Kanji[]>(dir, `kanji/${f}`)),
  };
}

const KANA = /^[ぁ-ゖゝゞァ-ヺーヽヾ]+$/;
const ID = /^[0-9a-f]{10}$/;

/** Problems that would break the app: wrong counts, duplicate or malformed ids, non-kana readings. Empty means usable. */
export function validate({ meta, vocab, kanji }: Dataset): string[] {
  const problems: string[] = [];
  for (const level of LEVELS) {
    const v = vocab.filter((w) => w.level === level).length;
    const k = kanji.filter((c) => c.level === level).length;
    if (v !== meta.counts.vocab[level]) problems.push(`${level} vocab: ${v} entries, meta says ${meta.counts.vocab[level]}`);
    if (k !== meta.counts.kanji[level]) problems.push(`${level} kanji: ${k} entries, meta says ${meta.counts.kanji[level]}`);
  }
  const ids = new Set<string>();
  for (const w of vocab) {
    if (!ID.test(w.id)) problems.push(`bad id ${w.id} (${w.word})`);
    if (ids.has(w.id)) problems.push(`duplicate id ${w.id} (${w.word})`);
    ids.add(w.id);
    if (!KANA.test(w.reading)) problems.push(`non-kana reading ${w.reading} (${w.id})`);
    if (!w.meanings?.length) problems.push(`no meanings (${w.id})`);
  }
  const chars = new Set<string>();
  for (const c of kanji) {
    if (chars.has(c.character)) problems.push(`duplicate kanji ${c.character}`);
    chars.add(c.character);
  }
  return problems;
}
