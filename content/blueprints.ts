// Official JLPT test structure per level: timed sections, question types and item counts, scoring sections.
// Source: jlpt.jp test sections and "Composition of Test Sections and Items" (current N4/N5 counts since Dec 2020,
// N1 listening since Dec 2022), via research_notes/JLPT tests and study methods/jlpt_format_scoring_changes.md §A, §D.
import type { Level } from "../lib/openjlpt.ts";

export type Area = "vocab" | "grammar" | "reading" | "listening";

export const QUESTION_TYPES = {
  "kanji-reading": { ja: "漢字読み", en: "Kanji reading", area: "vocab" },
  orthography: { ja: "表記", en: "Orthography", area: "vocab" },
  "word-formation": { ja: "語形成", en: "Word formation", area: "vocab" },
  context: { ja: "文脈規定", en: "Word in context", area: "vocab" },
  paraphrase: { ja: "言い換え類義", en: "Paraphrase", area: "vocab" },
  usage: { ja: "用法", en: "Usage", area: "vocab" },
  "grammar-form": { ja: "文の文法1", en: "Grammar form", area: "grammar" },
  "sentence-order": { ja: "文の文法2", en: "Sentence order", area: "grammar" },
  "text-grammar": { ja: "文章の文法", en: "Grammar in a text", area: "grammar" },
  "reading-short": { ja: "内容理解（短文）", en: "Short passages", area: "reading" },
  "reading-mid": { ja: "内容理解（中文）", en: "Mid-length passages", area: "reading" },
  "reading-long": { ja: "内容理解（長文）", en: "Long passage", area: "reading" },
  "integrated-reading": { ja: "統合理解", en: "Integrated reading", area: "reading" },
  "thematic-reading": { ja: "主張理解（長文）", en: "Author's argument", area: "reading" },
  "info-search": { ja: "情報検索", en: "Information retrieval", area: "reading" },
  task: { ja: "課題理解", en: "Task-based listening", area: "listening" },
  point: { ja: "ポイント理解", en: "Key points", area: "listening" },
  summary: { ja: "概要理解", en: "Summary", area: "listening" },
  utterance: { ja: "発話表現", en: "Verbal expressions", area: "listening" },
  "quick-response": { ja: "即時応答", en: "Quick response", area: "listening" },
  "integrated-listening": { ja: "統合理解", en: "Integrated listening", area: "listening" },
} as const satisfies Record<string, { ja: string; en: string; area: Area }>;

export type QuestionType = keyof typeof QUESTION_TYPES;

/** One-line task shown above each question, in Ganbaru's own words. */
export const INSTRUCTIONS: Partial<Record<QuestionType, string>> = {
  "kanji-reading": "Choose the reading of the underlined word.",
  orthography: "Choose how the underlined word is written in kanji.",
  context: "Choose the word that fits the blank.",
};
export type Part = { type: QuestionType; count: number };
export type Section = { id: string; title: string; minutes: number; parts: Part[] };
export type ScoringSection = { id: string; title: string; max: number; min: number; areas: Area[] };
export type Blueprint = { level: Level; passMark: number; sections: Section[]; scoring: ScoringSection[] };

const p = (type: QuestionType, count: number): Part => ({ type, count });

// N1–N3 score three sections out of 60; N4/N5 combine language knowledge and reading into one out of 120.
const SCORING_N1_N3: ScoringSection[] = [
  { id: "knowledge", title: "Language knowledge (vocabulary, grammar)", max: 60, min: 19, areas: ["vocab", "grammar"] },
  { id: "reading", title: "Reading", max: 60, min: 19, areas: ["reading"] },
  { id: "listening", title: "Listening", max: 60, min: 19, areas: ["listening"] },
];
const SCORING_N4_N5: ScoringSection[] = [
  { id: "knowledge", title: "Language knowledge (vocabulary, grammar) and reading", max: 120, min: 38, areas: ["vocab", "grammar", "reading"] },
  { id: "listening", title: "Listening", max: 60, min: 19, areas: ["listening"] },
];

const LISTENING = "聴解 Listening";

export const BLUEPRINTS: Record<Level, Blueprint> = {
  N1: {
    level: "N1",
    passMark: 100,
    scoring: SCORING_N1_N3,
    sections: [
      {
        id: "knowledge-reading",
        title: "言語知識（文字・語彙・文法）・読解 Language knowledge and reading",
        minutes: 110,
        parts: [
          p("kanji-reading", 6), p("context", 7), p("paraphrase", 6), p("usage", 6),
          p("grammar-form", 10), p("sentence-order", 5), p("text-grammar", 5),
          p("reading-short", 4), p("reading-mid", 9), p("reading-long", 4), p("integrated-reading", 3),
          p("thematic-reading", 4), p("info-search", 2),
        ],
      },
      {
        id: "listening",
        title: LISTENING,
        minutes: 55,
        parts: [p("task", 5), p("point", 6), p("summary", 5), p("quick-response", 11), p("integrated-listening", 3)],
      },
    ],
  },
  N2: {
    level: "N2",
    passMark: 90,
    scoring: SCORING_N1_N3,
    sections: [
      {
        id: "knowledge-reading",
        title: "言語知識（文字・語彙・文法）・読解 Language knowledge and reading",
        minutes: 105,
        parts: [
          p("kanji-reading", 5), p("orthography", 5), p("word-formation", 5), p("context", 7), p("paraphrase", 5), p("usage", 5),
          p("grammar-form", 12), p("sentence-order", 5), p("text-grammar", 5),
          p("reading-short", 5), p("reading-mid", 9), p("integrated-reading", 2), p("thematic-reading", 3), p("info-search", 2),
        ],
      },
      {
        id: "listening",
        title: LISTENING,
        minutes: 50,
        parts: [p("task", 5), p("point", 6), p("summary", 5), p("quick-response", 12), p("integrated-listening", 4)],
      },
    ],
  },
  N3: {
    level: "N3",
    passMark: 95,
    scoring: SCORING_N1_N3,
    sections: [
      {
        id: "vocab",
        title: "言語知識（文字・語彙）Vocabulary",
        minutes: 30,
        parts: [p("kanji-reading", 8), p("orthography", 6), p("context", 11), p("paraphrase", 5), p("usage", 5)],
      },
      {
        id: "grammar-reading",
        title: "言語知識（文法）・読解 Grammar and reading",
        minutes: 70,
        parts: [
          p("grammar-form", 13), p("sentence-order", 5), p("text-grammar", 5),
          p("reading-short", 4), p("reading-mid", 6), p("reading-long", 4), p("info-search", 2),
        ],
      },
      {
        id: "listening",
        title: LISTENING,
        minutes: 40,
        parts: [p("task", 6), p("point", 6), p("summary", 3), p("utterance", 4), p("quick-response", 9)],
      },
    ],
  },
  N4: {
    level: "N4",
    passMark: 90,
    scoring: SCORING_N4_N5,
    sections: [
      {
        id: "vocab",
        title: "言語知識（文字・語彙）Vocabulary",
        minutes: 25,
        parts: [p("kanji-reading", 7), p("orthography", 5), p("context", 8), p("paraphrase", 4), p("usage", 4)],
      },
      {
        id: "grammar-reading",
        title: "言語知識（文法）・読解 Grammar and reading",
        minutes: 55,
        parts: [
          p("grammar-form", 13), p("sentence-order", 4), p("text-grammar", 4),
          p("reading-short", 3), p("reading-mid", 3), p("info-search", 2),
        ],
      },
      {
        id: "listening",
        title: LISTENING,
        minutes: 35,
        parts: [p("task", 8), p("point", 7), p("utterance", 5), p("quick-response", 8)],
      },
    ],
  },
  N5: {
    level: "N5",
    passMark: 80,
    scoring: SCORING_N4_N5,
    sections: [
      {
        id: "vocab",
        title: "言語知識（文字・語彙）Vocabulary",
        minutes: 20,
        parts: [p("kanji-reading", 7), p("orthography", 5), p("context", 6), p("paraphrase", 3)],
      },
      {
        id: "grammar-reading",
        title: "言語知識（文法）・読解 Grammar and reading",
        minutes: 40,
        parts: [
          p("grammar-form", 9), p("sentence-order", 4), p("text-grammar", 4),
          p("reading-short", 2), p("reading-mid", 2), p("info-search", 1),
        ],
      },
      {
        id: "listening",
        title: LISTENING,
        minutes: 30,
        parts: [p("task", 7), p("point", 6), p("utterance", 5), p("quick-response", 6)],
      },
    ],
  },
};

/** CEFR reference level shown to passers since December 2025, by total score. */
export const CEFR: Record<Level, { from: number; cefr: string }[]> = {
  N5: [{ from: 80, cefr: "A1" }],
  N4: [{ from: 90, cefr: "A2" }],
  N3: [{ from: 95, cefr: "A2" }, { from: 104, cefr: "B1" }],
  N2: [{ from: 90, cefr: "B1" }, { from: 112, cefr: "B2" }],
  N1: [{ from: 100, cefr: "B2" }, { from: 142, cefr: "C1" }],
};
