"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExamTicket, HoldToConfirm } from "@/components/desk/bits";
import { QUESTION_TYPES, type QuestionType } from "@/content/blueprints";
import type { Level } from "@/lib/openjlpt";
import { estimate } from "@/lib/scoring";
import { Stem } from "./stem";

export type ExamQuestion = {
  id: string;
  type: QuestionType;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  translation?: string;
  passageId?: string;
  source: "data" | "ai";
};
export type ExamSection = { id: string; title: string; minutes: number; questions: ExamQuestion[] };

type Props = {
  level: Level;
  testId: string;
  title: string;
  note?: string;
  sections: ExamSection[];
  passages: Record<string, { text: string; translation: string }>;
  hubHref: string;
};

type Saved = {
  phase: "ticket" | "exam" | "done";
  section: number;
  startedAt: number;
  answers: Record<string, number>;
  flagged: string[];
  best?: number;
};
const fresh = (): Saved => ({ phase: "ticket", section: 0, startedAt: 0, answers: {}, flagged: [] });
const storageKey = (testId: string) => `ganbaru:v1:test:${testId}`;

function load(testId: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey(testId));
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function persist(testId: string, s: Saved) {
  try {
    localStorage.setItem(storageKey(testId), JSON.stringify(s));
  } catch {}
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Passage text: line breaks kept, furigana glosses shown (the real test glosses kanji above the level too). */
function PassageText({ text }: { text: string }) {
  return (
    <div lang="ja" className="font-jp text-lg leading-[2.2] whitespace-pre-line">
      <Stem text={text} furigana />
    </div>
  );
}

export function ExamPlayer({ level, testId, title, note, sections, passages, hubHref }: Props) {
  const [s, setS] = useState<Saved>(fresh);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage
    setS(load(testId) ?? fresh());
    setNow(Date.now());
  }, [testId]);

  const update = useCallback(
    (next: Saved) => {
      setS(next);
      persist(testId, next);
    },
    [testId],
  );

  const section = sections[s.section];
  const remaining = section && s.phase === "exam" ? Math.max(0, Math.round((s.startedAt + section.minutes * 60_000 - now) / 1000)) : 0;

  const finishSection = useCallback(() => {
    setIndex(0);
    if (s.section + 1 < sections.length) update({ ...s, section: s.section + 1, startedAt: Date.now() });
    else {
      const correct = sections.flatMap((x) => x.questions).filter((q) => s.answers[q.id] === q.answer).length;
      update({ ...s, phase: "done", best: Math.max(s.best ?? 0, correct) });
    }
  }, [s, sections, update]);

  // The section clock keeps running while the tab is closed, as it would in the exam room.
  useEffect(() => {
    if (s.phase !== "exam") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [s.phase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock ran out
    if (s.phase === "exam" && now > 0 && remaining === 0) finishSection();
  }, [s.phase, now, remaining, finishSection]);

  const q = section?.questions[index];
  const choose = useCallback(
    (option: number) => q && update({ ...s, answers: { ...s.answers, [q.id]: option } }),
    [q, s, update],
  );
  const toggleFlag = useCallback(
    () => q && update({ ...s, flagged: s.flagged.includes(q.id) ? s.flagged.filter((f) => f !== q.id) : [...s.flagged, q.id] }),
    [q, s, update],
  );

  useEffect(() => {
    if (s.phase !== "exam" || !section) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (["1", "2", "3", "4"].includes(e.key)) choose(Number(e.key) - 1);
      else if (e.key === "f" || e.key === "F") toggleFlag();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, section.questions.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.phase, section, choose, toggleFlag]);

  const total = sections.reduce((n, x) => n + x.questions.length, 0);
  const minutes = sections.reduce((n, x) => n + x.minutes, 0);

  if (s.phase === "ticket")
    return (
      <section aria-labelledby="ticket-title" className="space-y-6">
        <h1 id="ticket-title" className="text-2xl font-medium">
          {title}
        </h1>
        <p className="max-w-[60ch] text-ink-2">
          {sections.length} timed {sections.length === 1 ? "section" : "sections"}, {total} questions, {minutes} minutes. Answers are
          shown at the end, not after each question. Each section ends when its time runs out, even if you leave the page.
          {note ? ` ${note}` : ""}
        </p>
        <ExamTicket
          onTear={() => update({ ...fresh(), best: s.best, phase: "exam", startedAt: Date.now() })}
          stub={
            <div className="flex h-full items-center justify-center text-center text-xs text-ink-2">
              Tear
              <br />
              to start
            </div>
          }
        >
          <div className="flex h-full flex-col justify-center gap-1 px-5">
            <p lang="ja" className="font-study text-2xl">
              受験票
            </p>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-ink-2">
              {total} questions, {minutes} minutes
            </p>
          </div>
        </ExamTicket>
        <p className="text-sm text-ink-2">
          Drag the stub off, or{" "}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => update({ ...fresh(), best: s.best, phase: "exam", startedAt: Date.now() })}
          >
            start without tearing
          </button>
          .
        </p>
      </section>
    );

  if (s.phase === "done") return <ExamResults {...{ level, title, note, sections, passages, hubHref }} saved={s} onRetake={() => update({ ...fresh(), best: s.best })} />;

  if (!section || !q) return null;
  const passage = q.passageId ? passages[q.passageId] : undefined;
  const flagged = s.flagged.includes(q.id);

  return (
    <section aria-labelledby="section-title">
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-edge bg-paper px-4 py-3 sm:-mx-8 sm:px-8">
        <div>
          <p className="text-xs text-ink-2">
            Section {s.section + 1} of {sections.length}
          </p>
          <h1 id="section-title" lang="ja" className="font-jp text-base font-medium">
            {section.title}
          </h1>
        </div>
        <p
          role="timer"
          aria-label={`${Math.ceil(remaining / 60)} minutes left in this section`}
          className={`font-medium tabular-nums ${remaining <= 300 ? "text-redpen-ink" : ""}`}
        >
          {clock(remaining)}
        </p>
      </div>

      <nav aria-label="Questions in this section" className="mt-4">
        {/* One scrolling row on phones so a 71-question section doesn't push the question off screen. */}
        <ol className="flex gap-1.5 overflow-x-auto pt-1.5 pb-2 sm:flex-wrap sm:overflow-visible">
          {section.questions.map((item, i) => {
            const answered = s.answers[item.id] !== undefined;
            const isFlagged = s.flagged.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "step" : undefined}
                  aria-label={`Question ${i + 1}, ${answered ? "answered" : "unanswered"}${isFlagged ? ", flagged" : ""}`}
                  ref={i === index ? (el) => el?.scrollIntoView({ block: "nearest", inline: "nearest" }) : undefined}
                  className={[
                    "relative size-9 shrink-0 rounded-lg border text-sm tabular-nums",
                    i === index ? "border-2 border-ink font-medium" : "border-edge",
                    answered ? "bg-grid" : "bg-paper-raised",
                  ].join(" ")}
                >
                  {i + 1}
                  {isFlagged && <span aria-hidden="true" className="absolute -top-1 -right-1 size-2.5 rounded-full bg-redpen" />}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {passage && (
        <div className="paper-grid mt-5 max-h-[60vh] overflow-y-auto rounded-[var(--radius-paper)] border border-edge px-5 py-4 sm:px-7" tabIndex={0} aria-label="Reading passage">
          <PassageText text={passage.text} />
        </div>
      )}

      <div className="mt-5">
        <p className="text-sm text-ink-2">
          Question {index + 1} of {section.questions.length} ·{" "}
          <span lang="ja" className="font-jp">
            {QUESTION_TYPES[q.type].ja}
          </span>{" "}
          {QUESTION_TYPES[q.type].en}
        </p>
        <p lang="ja" className="font-jp mt-3 text-2xl leading-[2.2]">
          <Stem text={q.stem} furigana={q.source === "ai"} />
        </p>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Options">
        {q.options.map((option, i) => {
          const chosen = s.answers[q.id] === i;
          return (
            <li key={option}>
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => choose(i)}
                className={[
                  "flex min-h-14 w-full items-center gap-3 rounded-lg border px-4 py-2 text-left",
                  chosen ? "border-2 border-ink bg-grid" : "border-edge bg-paper-raised hover:border-ink",
                ].join(" ")}
              >
                <kbd className="rounded border border-edge px-1.5 text-xs text-ink-2">{i + 1}</kbd>
                <span lang="ja" className="font-jp flex-1 text-lg">
                  <Stem text={option} furigana={q.source === "ai"} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="h-11 rounded-lg border border-edge bg-paper-raised px-4 hover:bg-grid disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(i + 1, section.questions.length - 1))}
          disabled={index === section.questions.length - 1}
          className="h-11 rounded-lg bg-ink px-5 text-paper hover:opacity-90 disabled:opacity-40"
        >
          Next
        </button>
        <button
          type="button"
          aria-pressed={flagged}
          onClick={toggleFlag}
          className="h-11 rounded-lg border border-edge bg-paper-raised px-4 hover:bg-grid aria-pressed:border-redpen aria-pressed:text-redpen-ink"
        >
          {flagged ? "Flagged" : "Flag for review"}
        </button>
        <div className="ml-auto">
          <HoldToConfirm doneLabel="Section finished" onHold={finishSection}>
            {s.section + 1 < sections.length ? "Hold to finish section" : "Hold to finish test"}
          </HoldToConfirm>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-2">
        {Object.keys(s.answers).filter((id) => section.questions.some((x) => x.id === id)).length} of {section.questions.length}{" "}
        answered. Keys: 1–4 answer, F flag, arrows move.
      </p>
    </section>
  );
}

function ExamResults({
  level,
  title,
  sections,
  passages,
  hubHref,
  saved,
  onRetake,
}: Omit<Props, "testId"> & { saved: Saved; onRetake: () => void }) {
  const [reviewing, setReviewing] = useState(false);
  const all = sections.flatMap((x) => x.questions);
  const correct = all.filter((q) => saved.answers[q.id] === q.answer).length;
  const est = useMemo(() => estimate(level, all.map((q) => ({ type: q.type, correct: saved.answers[q.id] === q.answer }))), [level, all, saved.answers]);
  const byType = useMemo(() => {
    const m = new Map<QuestionType, { right: number; total: number }>();
    for (const q of all) {
      const t = m.get(q.type) ?? { right: 0, total: 0 };
      t.total++;
      if (saved.answers[q.id] === q.answer) t.right++;
      m.set(q.type, t);
    }
    return [...m];
  }, [all, saved.answers]);
  const weakest = [...byType].sort((a, b) => a[1].right / a[1].total - b[1].right / b[1].total)[0];

  return (
    <section aria-labelledby="results-title">
      <h1 id="results-title" className="text-2xl font-medium">
        {title}: results
      </h1>
      <p className="mt-4 text-5xl font-medium tabular-nums">
        {correct}
        <span className="text-2xl text-ink-2"> of {all.length} right</span>
      </p>

      <h2 className="mt-10 text-lg font-medium">Estimated scores</h2>
      <p className="mt-1 max-w-[62ch] text-sm text-ink-2">
        Estimates only. The real JLPT scales scores statistically and doesn&apos;t publish how, so these assume each question counts equally.
      </p>
      <ul className="mt-4 space-y-4">
        {est.sections.map((x) => (
          <li key={x.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span>{x.title}</span>
              <span className="tabular-nums">
                <span className="font-medium">{x.score}</span> / {x.max}{" "}
                <span className={x.metMinimum ? "text-ink-2" : "text-redpen-ink"}>
                  {x.metMinimum ? `above the ${x.min} minimum` : `below the ${x.min} minimum`}
                </span>
              </span>
            </div>
            <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-grid" aria-hidden="true">
              <div className={`h-full ${x.metMinimum ? "bg-ink" : "bg-redpen"}`} style={{ width: `${(x.score / x.max) * 100}%` }} />
              <div className="absolute top-0 h-full w-0.5 bg-ink-2" style={{ left: `${(x.min / x.max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-[62ch]">
        {est.total !== undefined
          ? est.passed
            ? `Estimated total ${est.total} of 180, above the ${est.passMark} pass mark${est.cefr ? ` (CEFR ${est.cefr})` : ""}.`
            : `Estimated total ${est.total} of 180. Passing needs ${est.passMark} and the minimum in every section.`
          : `No overall pass estimate yet: this test has no listening section, and passing needs ${est.passMark} of 180 with a minimum in every section, listening included.`}
      </p>

      <h2 className="mt-10 text-lg font-medium">By question type</h2>
      <table className="mt-2 w-full text-sm">
        <tbody className="divide-y divide-edge">
          {byType.map(([type, t]) => (
            <tr key={type}>
              <td className="py-2">
                <span lang="ja" className="font-jp">
                  {QUESTION_TYPES[type].ja}
                </span>{" "}
                <span className="text-ink-2">{QUESTION_TYPES[type].en}</span>
              </td>
              <td className="py-2 text-right tabular-nums">
                {t.right} / {t.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {weakest && weakest[1].right < weakest[1].total && (
        <p className="mt-3 text-sm text-ink-2">
          Weakest: {QUESTION_TYPES[weakest[0]].en}. Drill it from the{" "}
          <Link href={hubHref} className="text-ink underline underline-offset-4">
            skill drills
          </Link>
          .
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          aria-expanded={reviewing}
          onClick={() => setReviewing((r) => !r)}
          className="h-11 rounded-lg bg-ink px-5 text-paper hover:opacity-90"
        >
          {reviewing ? "Hide review" : "Review answers"}
        </button>
        <button type="button" onClick={onRetake} className="h-11 rounded-lg border border-ink bg-paper-raised px-5 hover:bg-grid">
          Retake test
        </button>
        <Link href={hubHref} className="inline-flex h-11 items-center px-2 underline underline-offset-4">
          All tests
        </Link>
      </div>

      {reviewing && <Review sections={sections} passages={passages} answers={saved.answers} flagged={saved.flagged} />}
    </section>
  );
}

function Review({ sections, passages, answers, flagged }: { sections: ExamSection[]; passages: Props["passages"]; answers: Record<string, number>; flagged: string[] }) {
  let n = 0;
  return (
    <div className="mt-10 space-y-12">
      {sections.map((section) => {
        const shown = new Set<string>();
        return (
          <section key={section.id} aria-label={section.title}>
            <h2 lang="ja" className="font-jp text-lg font-medium">
              {section.title}
            </h2>
            <ol className="mt-4 space-y-8">
              {section.questions.map((q) => {
                n++;
                const mine = answers[q.id];
                const right = mine === q.answer;
                const passage = q.passageId && !shown.has(q.passageId) ? passages[q.passageId] : undefined;
                if (q.passageId) shown.add(q.passageId);
                return (
                  <li key={q.id} className="border-t border-edge pt-6">
                    {passage && (
                      <details className="mb-4 rounded-lg border border-edge bg-paper-raised px-4 py-3">
                        <summary className="cursor-pointer text-sm">Reading passage</summary>
                        <div className="mt-3">
                          <PassageText text={passage.text} />
                        </div>
                        <p className="mt-3 text-sm text-ink-2">{passage.translation}</p>
                      </details>
                    )}
                    <p className="text-sm text-ink-2">
                      {n}. {QUESTION_TYPES[q.type].en}
                      {flagged.includes(q.id) ? " · flagged" : ""} ·{" "}
                      <span className={right ? "" : "text-redpen-ink"}>{mine === undefined ? "not answered" : right ? "○ right" : "× wrong"}</span>
                    </p>
                    <p lang="ja" className="font-jp mt-2 text-xl leading-[2.2]">
                      <Stem text={q.stem} furigana />
                    </p>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((o, i) => (
                        <li key={o} className={`flex items-baseline gap-2 ${i === q.answer ? "font-medium" : "text-ink-2"}`}>
                          <span className="w-12 shrink-0 text-xs">
                            {i === q.answer ? "○ answer" : i === mine ? "× yours" : ""}
                          </span>
                          <span lang="ja" className="font-jp">
                            {i + 1}. <Stem text={o} furigana />
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 border-l-4 border-ink pl-3">{q.explanation}</p>
                    {q.translation && <p className="mt-1 pl-4 text-sm text-ink-2">{q.translation}</p>}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
