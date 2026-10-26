import assert from "node:assert/strict";
import { test } from "node:test";
import { load, validate, type Dataset } from "./openjlpt.ts";

test("the committed OpenJLPT data validates", () => {
  assert.deepEqual(validate(load()), []);
});

test("validate catches broken entries", () => {
  const counts = { N5: 2, N4: 0, N3: 0, N2: 0, N1: 0, total: 2 };
  const word = { id: "ada066edfd", word: "会う", reading: "あう", romaji: "au", meanings: ["to meet"], level: "N5" as const };
  const broken: Dataset = {
    meta: { version: "test", counts: { vocab: counts, kanji: { ...counts, N5: 0, total: 0 } } },
    vocab: [word, { ...word, reading: "au", meanings: [] }],
    kanji: [],
  };
  assert.deepEqual(validate(broken), ["duplicate id ada066edfd (会う)", "non-kana reading au (ada066edfd)", "no meanings (ada066edfd)"]);
});
