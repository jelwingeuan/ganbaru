"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bind, toHiragana, unbind } from "wanakana";
import type { DemoWord } from "@/lib/demo-words";
import { UndoToast } from "./bits";
import { Mark } from "./mark";
import { RedSheet } from "./red-sheet";

const GRADES = ["Again", "Hard", "Good", "Easy"] as const;

type Phase = "answering" | "revealed";
type Toast = { id: number; grade: number; from: number };

export function StudyCard({ words, total = 60, startAt = 23 }: { words: DemoWord[]; total?: number; startAt?: number }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(startAt);
  const [phase, setPhase] = useState<Phase>("answering");
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gradesRef = useRef<HTMLDivElement>(null);
  const word = words[index % words.length];
  const revealed = phase === "revealed";

  // Romaji turns into kana as you type: "taberu" becomes たべる.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    bind(el, { IMEMode: true });
    return () => unbind(el);
  }, []);

  const reveal = useCallback(() => {
    setPhase("revealed");
    requestAnimationFrame(() => gradesRef.current?.focus());
  }, []);

  const peek = useCallback(() => {
    if (phase !== "answering") return;
    setResult(null);
    setStatus("Peeked. Grade how well you knew it.");
    reveal();
  }, [phase, reveal]);

  function check() {
    const typed = toHiragana(inputRef.current?.value.trim() ?? "");
    if (!typed) {
      setError("Type a reading first, or press Space to peek.");
      return;
    }
    const ok = typed === word.reading;
    setResult(ok);
    setStatus(ok ? "Correct. Grade how well you knew it." : `Not quite. The reading is ${word.reading}.`);
    reveal();
  }

  const load = useCallback((next: number, nextPhase: Phase) => {
    setIndex(next);
    setPhase(nextPhase);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    if (nextPhase === "answering") requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const grade = useCallback(
    (g: number) => {
      if (phase !== "revealed") return;
      setToast({ id: Date.now(), grade: g, from: index });
      setStatus("");
      setDone((d) => Math.min(total, d + 1));
      load(index + 1, "answering");
    },
    [phase, index, total, load],
  );

  function undo() {
    if (!toast) return;
    setDone((d) => d - 1);
    load(toast.from, "revealed");
    setStatus("Grade undone. Pick again.");
    requestAnimationFrame(() => gradesRef.current?.focus());
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === " " && phase === "answering") {
        e.preventDefault();
        peek();
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        grade(Number(e.key) - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, peek, grade]);

  return (
    <section aria-label="Study card" className="paper-grid rounded-[var(--radius-paper)] border border-edge px-5 pt-4 pb-5 text-ink sm:px-8">
      <div className="flex items-center gap-3 text-sm text-ink-2">
        <span className="tabular-nums">
          {done} of {total}
        </span>
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-edge" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Session progress">
          <div className="h-full bg-ink transition-[width] duration-200" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

      <p lang="ja" className="font-study mt-6 mb-1 text-center text-[clamp(56px,14vw,96px)] leading-tight tracking-wide">
        {word.word}
      </p>
      <p className="mb-3 text-center text-sm text-ink-2">Type the reading</p>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          lang="ja"
          aria-label="Reading"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          readOnly={revealed}
          placeholder="Romaji or kana"
          onInput={() => setError("")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !revealed) {
              e.preventDefault();
              check();
            }
          }}
          className="font-jp h-11 min-w-0 flex-1 rounded-lg border border-edge bg-paper-raised px-3 text-[17px] text-ink outline-none placeholder:text-ink-2/70 focus-visible:border-ink focus-visible:outline-none read-only:bg-paper"
        />
        <button
          type="button"
          onClick={check}
          disabled={revealed}
          className="h-11 rounded-lg bg-ink px-4 text-paper hover:opacity-90 disabled:opacity-40"
        >
          Check
        </button>
      </div>
      <p role="alert" className="mt-1.5 min-h-5 text-sm text-redpen-ink">
        {error}
      </p>

      <div className="relative mt-1">
        <RedSheet covered={!revealed} onPeek={peek}>
          <div className="bg-paper-raised py-3 pr-24 pl-4 dark:bg-paper-raised">
            <p data-answer lang="ja" className="font-jp text-[28px] leading-snug text-pen">
              {word.reading}
            </p>
            <p data-answer className="text-2xl leading-snug text-pen">
              {word.meaning}
            </p>
            <p className="mt-1 text-sm text-ink">{word.grammar}</p>
          </div>
        </RedSheet>
        {revealed && result !== null && (
          <Mark key={`${index}-${result}`} correct={result} className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2" />
        )}
      </div>
      <p className="mt-2 mb-4 text-sm text-ink-2">
        {revealed ? "Grade it with 1 to 4." : "The ink line stays readable under the sheet. Click it or press Space to peek."}
      </p>

      <div ref={gradesRef} tabIndex={-1} className="grid grid-cols-4 gap-2 outline-none" role="group" aria-label="Grade">
        {GRADES.map((label, g) => (
          <button
            key={label}
            type="button"
            disabled={!revealed}
            onClick={() => grade(g)}
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-ink bg-paper-raised px-1 py-2 hover:bg-grid disabled:border-edge disabled:opacity-50"
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-ink-2 tabular-nums">{word.intervals[g]}</span>
            <kbd className="rounded border border-edge px-1.5 text-[11px] text-ink-2">{g + 1}</kbd>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-2">
        {status}
      </p>

      {toast && (
        <UndoToast
          key={toast.id}
          title={`Graded ${GRADES[toast.grade]}. Back in ${words[toast.from % words.length].intervals[toast.grade]}.`}
          onUndo={undo}
          onClose={() => setToast((t) => (t?.id === toast.id ? null : t))}
        />
      )}
    </section>
  );
}
