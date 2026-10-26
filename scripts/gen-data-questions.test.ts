import assert from "node:assert/strict";
import { test } from "node:test";
import { nearMissReadings, replaceSpan, spellingVariants } from "./gen-data-questions.ts";

test("replaceSpan swaps the word and keeps the other furigana", () => {
  const s = "{毎日|まいにち}{学校|がっこう}へ{行|い}きます。";
  assert.equal(replaceSpan(s, "学校", "がっこう", "[[学校]]"), "{毎日|まいにち}[[学校]]へ{行|い}きます。");
  assert.equal(replaceSpan(s, "学校", "がっこう", "（　）"), "{毎日|まいにち}（　）へ{行|い}きます。");
});

test("replaceSpan handles okurigana and rejects other readings or split ruby", () => {
  assert.equal(replaceSpan("パンを{食|た}べる。", "食べる", "たべる", "（　）"), "パンを（　）。");
  assert.equal(replaceSpan("{今日|こんにち}は。", "今日", "きょう", "x"), null);
  assert.equal(replaceSpan("{学校|がっこう}です。", "学", "がく", "x"), null);
  assert.equal(replaceSpan("{本|ほん}です。", "学校", "がっこう", "x"), null);
});

test("near-miss readings change one sound and never return the real reading", () => {
  const v = nearMissReadings("がっこう");
  assert.ok(v.includes("がこう") && v.includes("がっこ") && v.includes("かっこう"));
  assert.ok(!v.includes("がっこう"));
});

test("near-miss readings never put っ after ん or a long vowel", () => {
  assert.ok(!nearMissReadings("せんせい").includes("せんっせい"));
  assert.ok(!nearMissReadings("いもうと").includes("いもうっと"));
});

test("spelling variants share the sound the word uses and stay near its level", () => {
  const v = spellingVariants("赤い", "あかい", "N5");
  assert.ok(v.every((w) => w.endsWith("い") && w !== "赤い"));
  assert.ok(!v.includes("爵い") && !v.includes("斥い"));
  const school = spellingVariants("学校", "がっこう", "N5");
  assert.ok(school.length >= 1 && school.every((w) => w.length === 2));
});
