// Fetches a pinned OpenJLPT commit into data/openjlpt and refuses to keep it unless it validates.
// To update: change SHA to a newer commit, run `npm run data:openjlpt`, review the diff.
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DATA_DIR, LEVELS, load, validate } from "../lib/openjlpt.ts";

const SHA = "0d1d3410bec90bd4098a7c72de820543cb4f707c"; // OpenJLPT v0.3.0, JMdict/KANJIDIC2 of 2026-09-29
const BASE = `https://raw.githubusercontent.com/evanclan/OpenJLPT/${SHA}/`;

const files = new Map<string, string>([
  ["LICENSE", "LICENSE"],
  ["NOTICE.md", "NOTICE.md"],
  ["data/json/meta.json", "meta.json"],
  ...LEVELS.flatMap((l) => {
    const f = `${l.toLowerCase()}.json`;
    return [
      [`data/json/vocab/${f}`, `vocab/${f}`],
      [`data/json/kanji/${f}`, `kanji/${f}`],
      [`data/json/grammar/${f}`, `grammar/${f}`],
    ] as [string, string][];
  }),
]);

const tmp = `${DATA_DIR}.tmp`;
await rm(tmp, { recursive: true, force: true });
for (const [src, dest] of files) {
  const res = await fetch(BASE + src);
  if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
  await mkdir(dirname(join(tmp, dest)), { recursive: true });
  await writeFile(join(tmp, dest), await res.text());
}

const data = load(tmp);
const problems = validate(data);
if (problems.length) {
  console.error(problems.slice(0, 20).join("\n"));
  throw new Error(`OpenJLPT ${SHA.slice(0, 7)} failed validation (${problems.length} problems); data/openjlpt left unchanged.`);
}

await rm(DATA_DIR, { recursive: true, force: true });
await rename(tmp, DATA_DIR);

const withExamples = data.vocab.filter((w) => w.examples?.length).length;
console.log(`OpenJLPT ${data.meta.version} (${SHA.slice(0, 7)}): ${data.vocab.length} words, ${data.kanji.length} kanji, ${data.grammar.length} grammar points, ${withExamples} words with examples.`);
for (const l of LEVELS) console.log(`  ${l}: ${data.meta.counts.vocab[l]} words, ${data.meta.counts.kanji[l]} kanji`);
