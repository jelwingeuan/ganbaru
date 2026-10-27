// One format for every question, whether built from data or written by AI.
// Text fields use OpenJLPT's {漢字|かな} furigana notation; [[...]] marks the underlined part and （　） a blank.
import { QUESTION_TYPES, THREE_OPTIONS, type QuestionType } from "../content/blueprints.ts";
export { SPOKEN_OPTIONS, THREE_OPTIONS } from "../content/blueprints.ts";
import { LEVELS, type Level } from "./openjlpt.ts";

export type Question = {
  id: string;
  level: Level;
  type: QuestionType;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  translation?: string;
  passageId?: string;
  /** Listening: the spoken lines in order. Speaker N is the narrator; F, M, F2, M2 are the people talking. */
  script?: { speaker: string; text: string }[];
  audio?: string;
  source: "data" | "ai";
  /** draft: passed the code checks only; verified: also blind-solved or unambiguous by construction; reviewed: a person checked it. */
  status: "draft" | "verified" | "reviewed";
  refs?: string[];
};

/** A reading text shared by several questions (reading passages, the 文章の文法 text, an information sheet). */
export type Passage = { id: string; level: Level; type: QuestionType; text: string; translation: string };

/** A full mock test: the questions for each official timed section, in order. */
export type Test = { id: string; level: Level; title: string; note?: string; sections: { id: string; questionIds: string[] }[] };

/** Types whose stem must underline the part being asked about. */
const UNDERLINED: QuestionType[] = ["kanji-reading", "orthography", "paraphrase"];
const BLANKED: QuestionType[] = ["context", "grammar-form"];

const stripFurigana = (s: string) => s.replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1");
const furiganaOk = (s: string) => !/[{}|]/.test(s.replace(/\{[^|{}]+\|[ぁ-ゖァ-ヺー]+\}/g, ""));

/** Problems that make a question unusable. Empty means it can ship. */
export function checkQuestion(q: Question): string[] {
  const problems: string[] = [];
  if (!q.id) problems.push("missing id");
  if (!LEVELS.includes(q.level)) problems.push(`bad level ${q.level}`);
  if (!(q.type in QUESTION_TYPES)) problems.push(`bad type ${q.type}`);
  if (!q.stem.trim()) problems.push("empty stem");
  const want = THREE_OPTIONS.includes(q.type) ? 3 : 4;
  if (q.options.length !== want) problems.push(`${q.options.length} options, need ${want}`);
  if (QUESTION_TYPES[q.type]?.area === "listening" && !q.script?.length) problems.push("listening question without a script");
  const plain = q.options.map((o) => stripFurigana(o).trim());
  if (plain.some((o) => !o)) problems.push("empty option");
  if (new Set(plain).size !== plain.length) problems.push("duplicate options");
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) problems.push(`bad answer index ${q.answer}`);
  if (!q.explanation.trim()) problems.push("empty explanation");
  for (const text of [q.stem, ...q.options]) if (!furiganaOk(text)) problems.push(`broken furigana in "${text}"`);
  if (UNDERLINED.includes(q.type) && !/\[\[.+?\]\]/.test(q.stem)) problems.push("missing [[underline]]");
  if (BLANKED.includes(q.type) && !q.stem.includes("（　）")) problems.push("missing （　） blank");
  if (q.type === "sentence-order" && (q.stem.split("★").length !== 2 || (q.stem.match(/＿★＿|＿＿＿/g) ?? []).length !== 4))
    problems.push("sentence order needs four slots: three ＿＿＿ and one ＿★＿");
  return problems.map((p) => `${q.id}: ${p}`);
}
