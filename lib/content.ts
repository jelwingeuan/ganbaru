// Loads the question bank from content/questions and groups it into drill sets of 10.
// Draft questions (not yet blind-solved) are never shown to learners.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { QUESTION_TYPES, type QuestionType } from "../content/blueprints.ts";
import { LEVELS, type Level } from "./openjlpt.ts";
import type { Question } from "./questions.ts";

const DIR = join(process.cwd(), "content", "questions");
const SET_SIZE = 10;

const all: Question[] = LEVELS.flatMap((level) => {
  const dir = join(DIR, level.toLowerCase());
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Question[]);
}).filter((q) => q.status !== "draft");

export const questionById = new Map(all.map((q) => [q.id, q]));

export const levelFromParam = (param: string) => LEVELS.find((l) => l.toLowerCase() === param.toLowerCase());

export type DrillSet = { id: string; level: Level; type: QuestionType; number: number; questionIds: string[] };

// Shuffle once by a stable hash so each set mixes words from across the level instead of one stretch of the list.
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return h >>> 0;
}

const setsByLevel = new Map<Level, DrillSet[]>(
  LEVELS.map((level) => {
    const sets: DrillSet[] = [];
    for (const type of Object.keys(QUESTION_TYPES) as QuestionType[]) {
      const pool = all.filter((q) => q.level === level && q.type === type).sort((a, b) => hash(a.id) - hash(b.id));
      for (let i = 0; i + SET_SIZE <= pool.length; i += SET_SIZE)
        sets.push({
          id: `${type}-${i / SET_SIZE + 1}`,
          level,
          type,
          number: i / SET_SIZE + 1,
          questionIds: pool.slice(i, i + SET_SIZE).map((q) => q.id),
        });
    }
    return [level, sets];
  }),
);

export const drillSets = (level: Level) => setsByLevel.get(level) ?? [];
export const drillSet = (level: Level, id: string) => drillSets(level).find((s) => s.id === id);
