// In-memory dictionary over OpenJLPT. 7.8k words is small enough to scan on every query.
import { isJapanese, isKana, toHiragana } from "wanakana";
import { LEVELS, load, type Kanji, type Level, type Vocab } from "./openjlpt.ts";

const data = load();

export const words = data.vocab;
export const kanjiList = data.kanji;
export const wordById = new Map(words.map((w) => [w.id, w]));
export const kanjiByChar = new Map(kanjiList.map((k) => [k.character, k]));
// Files load N5 first, so a spelling shared by several entries resolves to the easiest one.
const wordByText = new Map<string, Vocab>();
for (const w of words) if (!wordByText.has(w.word)) wordByText.set(w.word, w);
export const wordFor = (text: string) => wordByText.get(text);

export const MODES = ["exact", "starts", "contains", "ends"] as const;
export type Mode = (typeof MODES)[number];
const MATCH: Record<Mode, (key: string, q: string) => boolean> = {
  exact: (k, q) => k === q,
  starts: (k, q) => k.startsWith(q),
  contains: (k, q) => k.includes(q),
  ends: (k, q) => k.endsWith(q),
};

const POS_TAGS: Record<string, (pos: string) => boolean> = {
  verb: (p) => /^(v1|v5|vk|vz|vs-)/.test(p),
  noun: (p) => p === "n" || p === "pn" || p.startsWith("n-"),
  adj: (p) => p.startsWith("adj-i") || p === "adj-na",
  adv: (p) => p.startsWith("adv"),
};
export const TAGS = [...LEVELS.map((l) => l.toLowerCase()), ...Object.keys(POS_TAGS)];

// Katakana shifted to hiragana with ー kept (コーヒー → こーひー), plus wanakana's form that spells ー out (こおひい)
// so both typed kana and romaji ("koohii") match.
const kataToHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const kanaForms = (s: string) => [...new Set([kataToHira(s), toHiragana(s)])];

// Keys are precomputed once: hiragana for Japanese, lowercase glosses without a leading "to " for English.
const index = words.map((w) => ({
  w,
  ja: [w.word, ...(w.other_forms ?? []), w.reading, ...(w.other_readings ?? [])].flatMap(kanaForms),
  en: [w.romaji, ...w.meanings.map((m) => m.toLowerCase().replace(/^to /, ""))],
}));

export type SearchResult = { words: Vocab[]; total: number; kanji: Kanji[]; unknownTags: string[] };

export function search(raw: string, mode: Mode = "starts", limit = 50): SearchResult {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const tags = tokens.filter((t) => t.startsWith("#")).map((t) => t.slice(1).toLowerCase());
  const text = tokens.filter((t) => !t.startsWith("#")).join(" ");
  const levels = tags.filter((t) => /^n[1-5]$/.test(t)).map((t) => t.toUpperCase() as Level);
  const posTags = tags.filter((t) => t in POS_TAGS);
  const unknownTags = tags.filter((t) => !TAGS.includes(t));
  if (!text && !levels.length && !posTags.length) return { words: [], total: 0, kanji: [], unknownTags };

  // Latin input is tried as English, as OpenJLPT romaji, and as romaji turned into kana ("taberu" finds たべる).
  const japanese = isJapanese(text.replace(/\s/g, ""));
  const romajiKana = toHiragana(text);
  const jaQueries = japanese ? kanaForms(text) : text && isKana(romajiKana) ? [romajiKana] : [];
  const enQuery = japanese ? "" : text.toLowerCase();
  const match = MATCH[mode];

  const hits: { w: Vocab; exact: boolean }[] = [];
  for (const { w, ja, en } of index) {
    if (levels.length && !levels.includes(w.level)) continue;
    if (posTags.length && !posTags.every((t) => w.pos?.some(POS_TAGS[t]))) continue;
    const jaHit = jaQueries.some((q) => ja.some((k) => match(k, q)));
    if (text && !jaHit && !(enQuery && en.some((k) => match(k, enQuery)))) continue;
    hits.push({ w, exact: !text || jaQueries.some((q) => ja.includes(q)) || en.includes(enQuery) });
  }
  const rank = (h: (typeof hits)[number]) => (h.exact ? 0 : 10) + LEVELS.indexOf(h.w.level);
  hits.sort((a, b) => rank(a) - rank(b) || a.w.word.length - b.w.word.length);

  const kanji = japanese ? [...new Set(text)].flatMap((c) => kanjiByChar.get(c) ?? []).slice(0, 6) : [];
  return { words: hits.slice(0, limit).map((h) => h.w), total: hits.length, kanji, unknownTags };
}

const POS_LABELS: Record<string, string> = {
  n: "noun", pn: "pronoun", "n-suf": "noun suffix", "n-pref": "noun prefix", num: "number", ctr: "counter",
  v1: "ichidan verb", vk: "irregular verb (来る)", vz: "ichidan verb (-ずる)", "vs-i": "する verb", "vs-s": "する verb",
  vs: "takes する", vt: "transitive", vi: "intransitive",
  "adj-i": "い-adjective", "adj-ix": "い-adjective (いい/よい)", "adj-na": "な-adjective", "adj-no": "takes の",
  "adj-pn": "pre-noun adjective", "adj-t": "たる adjective", "adj-f": "prenominal",
  adv: "adverb", "adv-to": "adverb (takes と)", exp: "expression", conj: "conjunction", int: "interjection",
  prt: "particle", pref: "prefix", suf: "suffix", aux: "auxiliary", "aux-v": "auxiliary verb",
};
export const posLabel = (code: string) => POS_LABELS[code] ?? (code.startsWith("v5") ? "godan verb" : code);

/** Splits OpenJLPT's {漢字|かんじ} notation into plain and ruby segments. */
export function furiganaParts(furigana: string): { text: string; ruby?: string }[] {
  return furigana.split(/(\{[^|{}]+\|[^{}]+\})/).filter(Boolean).map((part) => {
    const m = part.match(/^\{([^|]+)\|(.+)\}$/);
    return m ? { text: m[1], ruby: m[2] } : { text: part };
  });
}
