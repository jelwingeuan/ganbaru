import type { Metadata } from "next";
import Link from "next/link";
import { Belt } from "@/components/desk/belt";
import { grammarPoints } from "@/lib/dictionary";
import { LEVELS } from "@/lib/openjlpt";

export const metadata: Metadata = { title: "Grammar" };

export default function GrammarPage() {
  return (
    <>
      <h1 className="text-2xl font-medium">Grammar</h1>
      <p className="mt-2 text-ink-2">{grammarPoints.length} grammar points from N5 to N1, each with how it&apos;s formed and examples.</p>
      <nav aria-label="Levels" className="mt-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className="rounded-full">
            <Belt level={l} />
          </a>
        ))}
      </nav>
      {LEVELS.map((level) => {
        const points = grammarPoints.filter((g) => g.level === level);
        return (
          <section key={level} id={level.toLowerCase()} aria-labelledby={`h-${level}`} className="mt-10 scroll-mt-4">
            <h2 id={`h-${level}`} className="flex items-center gap-3 text-xl font-medium">
              {level} <span className="text-sm font-normal text-ink-2">{points.length} points</span>
            </h2>
            <ul className="mt-2 divide-y divide-edge border-y border-edge">
              {points.map((g) => (
                <li key={g.id}>
                  <Link href={`/grammar/${g.id}`} className="flex items-baseline gap-4 px-1 py-3 hover:bg-grid">
                    <span lang="ja" className="font-jp shrink-0 text-lg">
                      {g.pattern}
                    </span>
                    <span className="min-w-0 truncate text-sm text-ink-2">{g.meaning}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
