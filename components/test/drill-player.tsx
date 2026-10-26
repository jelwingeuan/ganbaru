"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tally } from "@/components/desk/bits";
import { loadProgress, saveProgress } from "@/lib/progress";
import type { Question } from "@/lib/questions";
import { Stem } from "./stem";

export type PlayerQuestion = Pick<Question, "id" | "stem" | "options" | "answer" | "explanation" | "translation">;

type Props = {
  level: string;
  setId: string;
  title: string;
  instruction: string;
  questions: PlayerQuestion[];
  hubHref: string;
  nextSetHref?: string;
};

export function DrillPlayer({ level, setId, title, instruction, questions, hubHref, nextSetHref }: Props) {
  const empty = () => questions.map(() => null as number | null);
  const [answers, setAnswers] = useState(empty);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<number | undefined>();
  const [furigana, setFurigana] = useState(true);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Resume where the learner left off.
  useEffect(() => {
    const saved = loadProgress(level, setId);
    if (!saved || saved.answers.length !== questions.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage
    setAnswers(saved.answers);
    setBest(saved.best);
    setFinished(saved.finished);
    const firstOpen = saved.answers.indexOf(null);
    setIndex(firstOpen === -1 ? 0 : firstOpen);
  }, [level, setId, questions.length]);

  const q = questions[index];
  const chosen = answers[index];
  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const allAnswered = answers.every((a) => a !== null);

  const choose = useCallback(
    (option: number) => {
      if (finished || answers[index] !== null) return;
      const next = answers.map((a, i) => (i === index ? option : a));
      setAnswers(next);
      saveProgress(level, setId, { answers: next, finished: false, best });
      requestAnimationFrame(() => nextRef.current?.focus());
    },
    [answers, index, finished, level, setId, best],
  );

  const finish = useCallback(() => {
    const newBest = Math.max(best ?? 0, score);
    setBest(newBest);
    setFinished(true);
    saveProgress(level, setId, { answers, finished: true, best: newBest });
  }, [best, score, level, setId, answers]);

  const goNext = useCallback(() => {
    if (index < questions.length - 1) setIndex(index + 1);
    else if (allAnswered) finish();
    else setIndex(answers.indexOf(null));
  }, [index, questions.length, allAnswered, finish, answers]);

  function restart() {
    setAnswers(empty());
    setIndex(0);
    setFinished(false);
    saveProgress(level, setId, { answers: empty(), finished: false, best });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (["1", "2", "3", "4"].includes(e.key)) choose(Number(e.key) - 1);
      else if ((e.key === "ArrowRight" || e.key === "Enter") && answers[index] !== null && t.tagName !== "BUTTON" && t.tagName !== "A") goNext();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, questions.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, choose, goNext, answers, index, questions.length]);

  if (finished)
    return (
      <section aria-labelledby="result-title">
        <h1 id="result-title" className="text-2xl font-medium">
          {title}
        </h1>
        <p className="mt-6 text-6xl font-medium tabular-nums">
          <Tally to={score} />
          <span className="text-2xl text-ink-2"> of {questions.length}</span>
        </p>
        <p className="mt-2 text-ink-2">
          {score === questions.length ? "Every answer right." : `Best so far: ${best ?? score} of ${questions.length}.`}
        </p>
        <ol className="mt-8 divide-y divide-edge border-y border-edge">
          {questions.map((item, i) => {
            const right = answers[i] === item.answer;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFinished(false);
                    setIndex(i);
                  }}
                  className="flex w-full items-baseline gap-3 px-1 py-3 text-left hover:bg-grid"
                >
                  <span aria-hidden="true" className={`w-5 shrink-0 text-lg ${right ? "text-ink" : "text-redpen"}`}>
                    {right ? "○" : "×"}
                  </span>
                  <span className="sr-only">{right ? "Correct" : "Wrong"}:</span>
                  <span lang="ja" className="font-jp min-w-0 flex-1 truncate">
                    <Stem text={item.stem} furigana={false} />
                  </span>
                  <span lang="ja" className="font-jp shrink-0 text-sm text-ink-2">
                    {item.options[item.answer]}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          {nextSetHref && (
            <Link href={nextSetHref} className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-paper hover:opacity-90">
              Next set
            </Link>
          )}
          <button type="button" onClick={restart} className="h-11 rounded-lg border border-ink bg-paper-raised px-5 hover:bg-grid">
            Try again
          </button>
          <Link href={hubHref} className="inline-flex h-11 items-center px-2 underline underline-offset-4">
            All drills
          </Link>
        </div>
      </section>
    );

  const answered = chosen !== null;
  const right = chosen === q.answer;

  return (
    <section aria-labelledby="drill-title">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 id="drill-title" className="text-xl font-medium">
          {title}
        </h1>
        <button
          type="button"
          aria-pressed={furigana}
          onClick={() => setFurigana((f) => !f)}
          className="h-9 rounded-lg border border-edge bg-paper-raised px-3 text-sm hover:bg-grid aria-pressed:border-ink"
        >
          Furigana {furigana ? "on" : "off"}
        </button>
      </div>

      <nav aria-label="Questions" className="mt-4">
        <ol className="flex flex-wrap gap-1.5">
          {questions.map((item, i) => {
            const a = answers[i];
            const state = a === null ? "unanswered" : a === item.answer ? "correct" : "wrong";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "step" : undefined}
                  aria-label={`Question ${i + 1}, ${state}`}
                  className={[
                    "size-9 rounded-lg border text-sm tabular-nums",
                    i === index ? "border-ink border-2 font-medium" : "border-edge",
                    state === "unanswered" ? "bg-paper-raised" : "bg-grid",
                    state === "wrong" ? "text-redpen-ink" : "",
                  ].join(" ")}
                >
                  {state === "correct" ? "○" : state === "wrong" ? "×" : i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="paper-grid mt-5 rounded-[var(--radius-paper)] border border-edge px-5 py-6 sm:px-8">
        <p className="text-sm text-ink-2">
          Question {index + 1} of {questions.length}. {instruction}
        </p>
        <p lang="ja" className="font-jp mt-4 text-2xl leading-[2.4]">
          <Stem text={q.stem} furigana={furigana} />
        </p>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Options">
        {q.options.map((option, i) => {
          const isAnswer = i === q.answer;
          const isChosen = i === chosen;
          return (
            <li key={option}>
              <button
                type="button"
                disabled={answered}
                onClick={() => choose(i)}
                className={[
                  "flex min-h-14 w-full items-center gap-3 rounded-lg border px-4 py-2 text-left disabled:cursor-default",
                  !answered ? "border-edge bg-paper-raised hover:border-ink hover:bg-grid" : "",
                  answered && isAnswer ? "border-2 border-ink bg-paper-raised" : "",
                  answered && !isAnswer ? "border-edge bg-paper text-ink-2" : "",
                ].join(" ")}
              >
                <kbd className="rounded border border-edge px-1.5 text-xs text-ink-2">{i + 1}</kbd>
                <span lang="ja" className="font-jp flex-1 text-lg">
                  <Stem text={option} furigana={furigana} />
                </span>
                {answered && isAnswer && (
                  <span className="text-sm font-medium" aria-label="Correct answer">
                    ○ <span aria-hidden="true">Answer</span>
                  </span>
                )}
                {answered && isChosen && !isAnswer && (
                  <span className="text-sm font-medium text-redpen-ink" aria-label="Your answer, wrong">
                    × <span aria-hidden="true">Yours</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite">
        {answered && (
          <div className="mt-5 border-l-4 border-ink pl-4">
            <p className="font-medium">{right ? "Correct." : `Not quite. The answer is ${q.answer + 1}.`}</p>
            <p className="mt-1">{q.explanation}</p>
            {q.translation && <p className="mt-2 text-sm text-ink-2">Sentence: {q.translation}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          ref={nextRef}
          type="button"
          onClick={goNext}
          disabled={!answered}
          className="h-11 rounded-lg bg-ink px-5 text-paper hover:opacity-90 disabled:opacity-40"
        >
          {index === questions.length - 1 && allAnswered ? "See results" : "Next question"}
        </button>
        <p className="text-sm text-ink-2">
          Keys: <kbd className="rounded border border-edge px-1">1</kbd>–<kbd className="rounded border border-edge px-1">4</kbd> to
          answer, <kbd className="rounded border border-edge px-1">Enter</kbd> for next.
        </p>
      </div>
    </section>
  );
}
