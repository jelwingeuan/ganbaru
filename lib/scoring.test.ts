import assert from "node:assert/strict";
import { test } from "node:test";
import { BLUEPRINTS, type QuestionType } from "../content/blueprints.ts";
import { checkQuestion, type Question } from "./questions.ts";
import { estimate, type Answered } from "./scoring.ts";

const count = (level: keyof typeof BLUEPRINTS) =>
  BLUEPRINTS[level].sections.map((s) => [s.minutes, s.parts.reduce((n, p) => n + p.count, 0)]);

test("blueprints match the official times and item counts", () => {
  assert.deepEqual(count("N1"), [[110, 71], [55, 30]]);
  assert.deepEqual(count("N2"), [[105, 75], [50, 32]]);
  assert.deepEqual(count("N3"), [[30, 35], [70, 39], [40, 28]]);
  assert.deepEqual(count("N4"), [[25, 28], [55, 29], [35, 28]]);
  assert.deepEqual(count("N5"), [[20, 21], [40, 22], [30, 24]]);
});

const answers = (type: QuestionType, right: number, wrong: number): Answered[] => [
  ...Array.from({ length: right }, () => ({ type, correct: true })),
  ...Array.from({ length: wrong }, () => ({ type, correct: false })),
];

test("a full N3 test passes with a high total and every section above its minimum", () => {
  const e = estimate("N3", [...answers("context", 8, 2), ...answers("reading-mid", 7, 3), ...answers("point", 6, 4)]);
  assert.deepEqual(e.sections.map((s) => s.score), [48, 42, 36]);
  assert.equal(e.total, 126);
  assert.equal(e.passed, true);
  assert.equal(e.cefr, "B1");
});

test("a total over the pass mark still fails when one section is under its minimum", () => {
  const e = estimate("N2", [...answers("kanji-reading", 10, 0), ...answers("reading-short", 10, 0), ...answers("task", 3, 7)]);
  assert.deepEqual(e.sections.map((s) => s.score), [60, 60, 18]);
  assert.equal(e.total, 138);
  assert.equal(e.passed, false);
  assert.equal(e.cefr, undefined);
});

test("N5 combines vocabulary, grammar and reading into one section out of 120", () => {
  const e = estimate("N5", [...answers("kanji-reading", 5, 5), ...answers("info-search", 5, 5), ...answers("task", 5, 5)]);
  assert.deepEqual(e.sections.map((s) => [s.id, s.score, s.max]), [["knowledge", 60, 120], ["listening", 30, 60]]);
  assert.equal(e.total, 90);
  assert.equal(e.passed, true);
  assert.equal(e.cefr, "A1");
});

test("a drill covering one section gives a section score but no pass estimate", () => {
  const e = estimate("N4", answers("grammar-form", 4, 1));
  assert.equal(e.sections.length, 1);
  assert.equal(e.total, undefined);
  assert.equal(e.passed, undefined);
});

const good: Question = {
  id: "n5-kr-1",
  level: "N5",
  type: "kanji-reading",
  stem: "[[{学校|がっこう}]]に行きます。",
  options: ["がっこう", "がこう", "がっこ", "かっこう"],
  answer: 0,
  explanation: "学校 is read がっこう.",
  source: "data",
  status: "verified",
};

test("checkQuestion accepts a well-formed question", () => {
  assert.deepEqual(checkQuestion(good), []);
});

test("checkQuestion rejects broken questions", () => {
  const problems = checkQuestion({
    ...good,
    stem: "{学校|gakkou}に行きます。",
    options: ["がっこう", "がっこう", ""],
    answer: 3,
    explanation: " ",
  });
  assert.deepEqual(problems, [
    "n5-kr-1: 3 options, need 4",
    "n5-kr-1: empty option",
    "n5-kr-1: duplicate options",
    "n5-kr-1: bad answer index 3",
    "n5-kr-1: empty explanation",
    'n5-kr-1: broken furigana in "{学校|gakkou}に行きます。"',
    "n5-kr-1: missing [[underline]]",
  ]);
});
