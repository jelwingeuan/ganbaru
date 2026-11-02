import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Belt } from "@/components/desk/belt";
import { BLUEPRINTS } from "@/content/blueprints";
import { drillSets, testsFor } from "@/lib/content";
import { LEVELS } from "@/lib/openjlpt";

export const metadata: Metadata = { title: "Tests" };

export default function TestsPage() {
  return (
    <div className="pt-6 sm:pt-10">
      <div className="max-w-[44rem]">
        <p className="text-xs font-semibold tracking-[0.16em] text-redpen-ink uppercase">Practice / JLPT</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Find your level. Keep going.</h1>
        <p className="mt-4 text-lg text-ink-2">Choose a level for timed mock tests or short skill drills. Your progress stays in this browser.</p>
      </div>
      <ul className="mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {LEVELS.map((level) => {
          const bp = BLUEPRINTS[level];
          const minutes = bp.sections.reduce((m, s) => m + s.minutes, 0);
          const exams = testsFor(level).length;
          const drills = drillSets(level).length;
          return (
            <li key={level}>
              <Link href={`/test/${level.toLowerCase()}`} className="pressable group flex h-full min-h-44 flex-col rounded-2xl border border-edge bg-paper-raised p-5 shadow-[0_1px_0_rgba(27,42,71,0.04)] hover:border-ink/30 hover:shadow-[0_8px_28px_rgba(27,42,71,0.07)]">
                <span className="flex items-start justify-between gap-3">
                  <Belt level={level} />
                  <ArrowUpRight aria-hidden size={19} className="text-ink-2 group-hover:text-ink" />
                </span>
                <span className="mt-5 text-sm text-ink-2">{exams} {exams === 1 ? "mock test" : "mock tests"} · {drills} drill sets</span>
                <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-2">
                  <span className="inline-flex items-center gap-1"><Clock3 aria-hidden size={14} /> {minutes} min per test</span>
                  <span>Pass mark {bp.passMark}/180</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
