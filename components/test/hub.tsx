"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ModeSegment } from "@/components/desk/bits";
import { loadProgress, type DrillProgress } from "@/lib/progress";

type Tab = "full" | "mini" | "skill";
const TABS: { value: Tab; label: string }[] = [
  { value: "full", label: "Full test" },
  { value: "mini", label: "Mini test" },
  { value: "skill", label: "Skill drills" },
];

export function HubTabs({ panels, initial }: { panels: Record<Tab, ReactNode>; initial: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  return (
    <>
      <ModeSegment items={TABS} value={tab} onChange={(v) => setTab(v as Tab)} aria-label="Test type" />
      <div className="mt-6">{panels[tab]}</div>
    </>
  );
}

type TestStatus = { phase: "ticket" | "exam" | "done"; best?: number };

/** Full mock tests with this browser's status: not taken, in progress, or best score. */
export function TestList({ tests }: { tests: { id: string; title: string; href: string; questions: number; minutes: number; note?: string }[] }) {
  const [status, setStatus] = useState<Record<string, TestStatus | null>>({});
  useEffect(() => {
    const read = (id: string): TestStatus | null => {
      try {
        const raw = localStorage.getItem(`ganbaru:v1:test:${id}`);
        return raw ? (JSON.parse(raw) as TestStatus) : null;
      } catch {
        return null;
      }
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser storage after mount
    setStatus(Object.fromEntries(tests.map((t) => [t.id, read(t.id)])));
  }, [tests]);

  return (
    <ul className="divide-y divide-edge border-y border-edge">
      {tests.map((t) => {
        const st = status[t.id];
        const label = st?.phase === "exam" ? "In progress" : st?.best !== undefined ? `Best ${st.best} of ${t.questions}` : "Not taken";
        return (
          <li key={t.id}>
            <Link href={t.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 py-4 hover:bg-grid">
              <span className="font-medium">{t.title}</span>
              <span className="text-sm text-ink-2 tabular-nums">
                {t.questions} questions, {t.minutes} min
              </span>
              <span className="ml-auto text-sm tabular-nums">{label}</span>
              {t.note && <span className="w-full text-xs text-ink-2">{t.note}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Numbered drill sets with each one's status from this browser: untried, in progress, or best score. */
export function DrillGrid({ level, href, sets }: { level: string; href: string; sets: { id: string; number: number; size: number }[] }) {
  const [progress, setProgress] = useState<Record<string, DrillProgress | null>>({});
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser storage after mount
    setProgress(Object.fromEntries(sets.map((s) => [s.id, loadProgress(level, s.id)])));
  }, [level, sets]);

  return (
    <ol className="flex flex-wrap gap-2">
      {sets.map((s) => {
        const p = progress[s.id];
        const done = p?.best !== undefined;
        const started = !done && p?.answers.some((a) => a !== null);
        const label = done ? `Set ${s.number}, best ${p!.best} of ${s.size}` : started ? `Set ${s.number}, in progress` : `Set ${s.number}`;
        return (
          <li key={s.id}>
            <Link
              href={`${href}/${s.id}`}
              aria-label={label}
              className={[
                "flex h-12 min-w-12 flex-col items-center justify-center rounded-lg border px-2 text-sm tabular-nums hover:border-ink",
                done ? "border-ink bg-grid" : started ? "border-dashed border-ink bg-paper-raised" : "border-edge bg-paper-raised",
              ].join(" ")}
            >
              <span className="font-medium">{s.number}</span>
              {done && <span className="text-[11px] leading-none text-ink-2">{p!.best}/{s.size}</span>}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
