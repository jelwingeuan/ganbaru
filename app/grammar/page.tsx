import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense } from "react";
import { Belt } from "@/components/desk/belt";
import { ListRow } from "@/components/desk/list-row";
import { grammarPoints } from "@/lib/dictionary";
import { LEVELS } from "@/lib/openjlpt";

export const metadata: Metadata = { title: "Grammar" };

export default function GrammarPage({ searchParams }: PageProps<"/grammar">) {
  return (
    <>
      <header className="max-w-[44rem] pt-4 sm:pt-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-pen uppercase">Grammar library</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Find the form you need.</h1>
        <p className="mt-4 text-lg text-ink-2">
          {grammarPoints.length} grammar points from N5 to N1, with formation, meaning, and examples.
        </p>
      </header>
      <Suspense fallback={<div className="mt-8 h-64" />}>
        <GrammarDirectory searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function GrammarDirectory({ searchParams }: Pick<PageProps<"/grammar">, "searchParams">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalized = query.normalize("NFKC").toLocaleLowerCase();
  const matches = normalized
    ? grammarPoints.filter((point) =>
        [point.pattern, point.meaning, point.romaji, point.formation, ...(point.tags ?? [])]
          .some((value) => value?.normalize("NFKC").toLocaleLowerCase().includes(normalized)),
      )
    : grammarPoints;
  const groups = LEVELS.map((level) => ({ level, points: matches.filter((point) => point.level === level) }))
    .filter((group) => group.points.length > 0);

  return (
    <>
      <form action="/grammar" role="search" className="mt-8 max-w-[44rem]">
        <label htmlFor="grammar-q" className="mb-2 block text-sm font-medium">Search patterns or meanings</label>
        <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-edge bg-paper-raised p-1.5 pl-4 shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
          <Search size={20} aria-hidden className="shrink-0 text-ink-2" />
          <input
            id="grammar-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="〜ようにする, obligation…"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-2/70"
          />
          <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-ink px-4 text-sm font-medium text-paper hover:opacity-90">
            Search
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-12">
        {groups.length > 0 && <nav aria-label="Grammar levels" className="flex self-start gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0">
          {groups.map(({ level, points }) => (
            <a key={level} href={`#${level.toLowerCase()}`} className="flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-xl border border-edge bg-paper-raised px-3 hover:bg-grid lg:w-full">
              <Belt level={level} />
              <span className="text-sm tabular-nums text-ink-2">{points.length}</span>
            </a>
          ))}
        </nav>}

        <div className={`min-w-0 ${groups.length === 0 ? "lg:col-start-2" : ""}`}>
          <p role="status" className="text-sm text-ink-2">
            {query ? `${matches.length} ${matches.length === 1 ? "result" : "results"} for “${query}”` : "Browse by level or search for a pattern."}
            {query && <Link href="/grammar" className="ml-3 font-medium text-ink underline underline-offset-4">Clear search</Link>}
          </p>
          {groups.length === 0 && <p className="mt-8 rounded-2xl border border-edge bg-paper-raised p-6">No grammar points match that search. Try a shorter phrase.</p>}
          {groups.map(({ level, points }) => (
            <section key={level} id={level.toLowerCase()} aria-labelledby={`h-${level}`} className="mt-10 scroll-mt-28">
              <h2 id={`h-${level}`} className="flex items-center gap-3 text-xl font-medium">
                <Belt level={level} />
                <span className="text-sm font-normal text-ink-2">{points.length} {points.length === 1 ? "point" : "points"}</span>
              </h2>
              <ul className="mt-4 divide-y divide-edge overflow-hidden rounded-2xl border border-edge bg-paper-raised">
                {points.map((point) => (
                  <li key={point.id}>
                    <ListRow href={`/grammar/${point.id}`}>
                      <span className="grid w-full min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] sm:gap-5">
                        <span lang="ja" className="font-jp min-w-0 text-lg [overflow-wrap:anywhere]">{point.pattern}</span>
                        <span className="min-w-0 text-sm text-ink-2 [overflow-wrap:anywhere]">{point.meaning}</span>
                      </span>
                    </ListRow>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
