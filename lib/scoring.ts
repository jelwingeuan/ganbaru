// Estimates JLPT scaled scores from raw answers. The real test equates scores statistically and doesn't
// publish the tables, so this is a straight proportion per scoring section: always shown as an estimate.
import { BLUEPRINTS, CEFR, QUESTION_TYPES, type QuestionType } from "../content/blueprints.ts";
import type { Level } from "./openjlpt.ts";

export type Answered = { type: QuestionType; correct: boolean };

export type SectionEstimate = { id: string; title: string; score: number; max: number; min: number; metMinimum: boolean; answered: number };

export type Estimate = {
  sections: SectionEstimate[];
  /** Only set when every scoring section has answers, as in a full test. */
  total?: number;
  passMark: number;
  passed?: boolean;
  cefr?: string;
};

export function estimate(level: Level, answers: Answered[]): Estimate {
  const bp = BLUEPRINTS[level];
  const sections = bp.scoring.flatMap((s) => {
    const inSection = answers.filter((a) => (s.areas as string[]).includes(QUESTION_TYPES[a.type].area));
    if (!inSection.length) return [];
    const score = Math.round((inSection.filter((a) => a.correct).length / inSection.length) * s.max);
    return [{ id: s.id, title: s.title, score, max: s.max, min: s.min, metMinimum: score >= s.min, answered: inSection.length }];
  });
  if (sections.length < bp.scoring.length) return { sections, passMark: bp.passMark };

  const total = sections.reduce((sum, s) => sum + s.score, 0);
  const passed = total >= bp.passMark && sections.every((s) => s.metMinimum);
  const cefr = passed ? CEFR[level].filter((c) => total >= c.from).at(-1)?.cefr : undefined;
  return { sections, total, passMark: bp.passMark, passed, cefr };
}
