// Turns listening scripts into MP3s with the local VOICEVOX engine (keep the VOICEVOX app open) and ffmpeg.
// Writes public/audio/<level>/<question id>.mp3 and sets each question's audio field in content/questions/<level>/ai.json.
//
//   npm run content:audio            only questions without audio yet
//   npm run content:audio -- --force redo every file
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { QUESTION_TYPES } from "../content/blueprints.ts";
import { LEVELS, type Level } from "../lib/openjlpt.ts";
import type { Question } from "../lib/questions.ts";

const ENGINE = process.env.VOICEVOX_URL ?? "http://127.0.0.1:50021";
// VOICEVOX style ids: 九州そら (narrator), 四国めたん, 玄野武宏, 青山龍星. Credit them on the licenses page.
const VOICES: Record<string, number> = { N: 16, F: 2, M: 11, M2: 13, F2: 15 };
// Slower speech at the lower levels, as on the real test.
const SPEED: Record<Level, number> = { N5: 0.9, N4: 0.95, N3: 1, N2: 1, N1: 1.05 };

/** Kanji with furigana is spoken by its reading; underline and blank markers are dropped. */
export const speakable = (text: string) => text.replace(/\{[^|{}]+\|([^{}]+)\}/g, "$1").replace(/\[\[|\]\]|（　）/g, "");

async function synthesize(text: string, speaker: number, speed: number, file: string) {
  const query = await fetch(`${ENGINE}/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`, { method: "POST" });
  if (!query.ok) throw new Error(`audio_query ${query.status} for "${text}"`);
  const body = { ...(await query.json()), speedScale: speed };
  const wav = await fetch(`${ENGINE}/synthesis?speaker=${speaker}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!wav.ok) throw new Error(`synthesis ${wav.status} for "${text}"`);
  await writeFile(file, Buffer.from(await wav.arrayBuffer()));
}

const ffmpeg = (...args: string[]) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);

async function render(q: Question, level: Level, out: string) {
  const dir = await mkdtemp(join(tmpdir(), "ganbaru-audio-"));
  try {
    // VOICEVOX returns 24 kHz mono 16-bit WAV, so silences are made in the same format for the concat list.
    const silence = async (seconds: number) => {
      const f = join(dir, `silence-${seconds}.wav`);
      if (!existsSync(f)) ffmpeg("-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", String(seconds), "-c:a", "pcm_s16le", f);
      return f;
    };
    const list: string[] = [];
    const lines = q.script ?? [];
    for (const [i, line] of lines.entries()) {
      const f = join(dir, `${i}.wav`);
      await synthesize(speakable(line.text), VOICES[line.speaker] ?? VOICES.N, SPEED[level], f);
      list.push(f);
      const next = lines[i + 1];
      // Longer gaps around the narrator, a short one between turns, and room to answer at the end.
      list.push(await silence(!next ? 2 : line.speaker === "N" || next.speaker === "N" ? 1.2 : 0.5));
    }
    const listFile = join(dir, "list.txt");
    await writeFile(listFile, list.map((f) => `file '${f}'`).join("\n"));
    await mkdir(join(out, ".."), { recursive: true });
    ffmpeg("-f", "concat", "-safe", "0", "-i", listFile, "-ac", "1", "-b:a", "64k", out);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const force = process.argv.includes("--force");
  const version = await fetch(`${ENGINE}/version`).catch(() => null);
  if (!version?.ok) throw new Error(`No VOICEVOX engine at ${ENGINE}. Open the VOICEVOX app and try again.`);
  for (const level of LEVELS) {
    const file = join(process.cwd(), "content", "questions", level.toLowerCase(), "ai.json");
    if (!existsSync(file)) continue;
    const questions: Question[] = JSON.parse(await readFile(file, "utf8"));
    let made = 0;
    for (const q of questions) {
      if (QUESTION_TYPES[q.type].area !== "listening" || !q.script?.length) continue;
      const rel = `/audio/${level.toLowerCase()}/${q.id}.mp3`;
      const out = join(process.cwd(), "public", rel);
      if (!force && q.audio && existsSync(out)) continue;
      await render(q, level, out);
      q.audio = rel;
      made++;
    }
    await writeFile(file, JSON.stringify(questions, null, 1) + "\n");
    console.log(`${level}: ${made} audio files`);
  }
}
