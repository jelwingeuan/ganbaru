import type { Metadata } from "next";
import Link from "next/link";
import { Belt } from "@/components/desk/belt";
import { BLUEPRINTS } from "@/content/blueprints";
import { drillSets } from "@/lib/content";
import { LEVELS } from "@/lib/openjlpt";

export const metadata: Metadata = { title: "Tests" };

export default function TestsPage() {
  return (
    <>
      <h1 className="text-2xl font-medium">Practice tests</h1>
      <p className="mt-2 max-w-[60ch] text-ink-2">Pick the level you&apos;re aiming for.</p>
      <ul className="mt-6 divide-y divide-edge border-y border-edge">
        {LEVELS.map((level) => {
          const bp = BLUEPRINTS[level];
          const minutes = bp.sections.reduce((m, s) => m + s.minutes, 0);
          return (
            <li key={level}>
              <Link href={`/test/${level.toLowerCase()}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 py-4 hover:bg-grid">
                <Belt level={level} />
                <span className="text-sm text-ink-2">
                  Real test: {minutes} minutes, pass mark {bp.passMark} of 180
                </span>
                <span className="ml-auto text-sm">{drillSets(level).length} drill sets</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
