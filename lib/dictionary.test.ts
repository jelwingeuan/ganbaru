import assert from "node:assert/strict";
import { test } from "node:test";
import { furiganaParts, search } from "./dictionary.ts";

const top = (q: string, mode?: Parameters<typeof search>[1]) => search(q, mode).words[0]?.word;

test("finds a word by kanji, kana, romaji and English", () => {
  assert.equal(top("食べる"), "食べる");
  assert.equal(top("たべる"), "食べる");
  assert.equal(top("taberu"), "食べる");
  assert.equal(top("eat", "exact"), "食べる");
});

test("katakana, hiragana and romaji with long vowels match each other", () => {
  assert.equal(top("こーひー"), "コーヒー");
  assert.equal(top("コーヒー"), "コーヒー");
  assert.equal(top("koohii"), "コーヒー");
});

test("modes narrow or widen the match", () => {
  assert.ok(search("食べ", "exact").total === 0);
  assert.ok(search("食べ", "starts").words.some((w) => w.word === "食べ物"));
  assert.ok(search("物", "ends").words.every((w) => w.word.endsWith("物") || w.other_forms?.some((f) => f.endsWith("物"))));
});

test("tags filter by level and part of speech", () => {
  const { words, total } = search("#n5 #verb", "starts", 1000);
  assert.ok(total > 50 && words.every((w) => w.level === "N5"));
  assert.ok(words.some((w) => w.word === "食べる"));
  assert.ok(!words.some((w) => w.word === "勉強"), "a noun that takes する is not a #verb");
  assert.deepEqual(search("#n9 eat").unknownTags, ["n9"]);
});

test("a kanji query also returns the kanji", () => {
  assert.deepEqual(search("日本").kanji.map((k) => k.character), ["日", "本"]);
});

test("empty input returns nothing", () => {
  assert.equal(search("   ").total, 0);
});

test("furigana notation splits into ruby parts", () => {
  assert.deepEqual(furiganaParts("{彼|かれ}は本を{読|よ}む。"), [
    { text: "彼", ruby: "かれ" },
    { text: "は本を" },
    { text: "読", ruby: "よ" },
    { text: "む。" },
  ]);
  assert.deepEqual(furiganaParts("{前|#1392580}に"), [{ text: "前" }, { text: "に" }]);
});
