import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Belt } from "@/components/desk/belt";
import { ExampleSentence } from "@/components/desk/example-sentence";
import { grammarById, grammarPoints } from "@/lib/dictionary";

export async function generateStaticParams() {
  return grammarPoints.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/grammar/[id]">): Promise<Metadata> {
  const g = grammarById.get((await params).id);
  return { title: g ? `${g.pattern} grammar` : "Grammar point not found" };
}

export default function GrammarPointPage({ params }: PageProps<"/grammar/[id]">) {
  return (
    <>
      <Link href="/grammar" className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 hover:text-ink">
        ← Grammar library
      </Link>
      <Suspense fallback={<div className="h-64" />}>{params.then(({ id }) => <Point id={id} />)}</Suspense>
    </>
  );
}

function Point({ id }: { id: string }) {
  const g = grammarById.get(id);
  if (!g) notFound();
  const sameLevel = grammarPoints.filter((p) => p.level === g.level);
  const at = sameLevel.indexOf(g);
  const related = g.tags?.length
    ? grammarPoints.filter((p) => p.id !== g.id && p.tags?.some((t) => g.tags!.includes(t))).slice(0, 6)
    : [];

  return (
    <article className="max-w-[44rem] pt-3 sm:pt-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.18em] text-pen uppercase">Grammar point</p>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <h1 lang="ja" className="font-study min-w-0 text-4xl leading-tight sm:text-5xl [overflow-wrap:anywhere]">
            {g.pattern}
          </h1>
          <Belt level={g.level} className="mt-2 shrink-0" />
        </div>
      </header>
      {g.romaji && <p className="mt-1 text-sm text-ink-2">{g.romaji}</p>}

      <div className="mt-8 rounded-2xl border border-edge bg-paper-raised p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-2 uppercase">Meaning</p>
        <p className="mt-2 text-xl leading-relaxed">{g.meaning}</p>
        {g.formation && (
          <p className="mt-5 border-t border-edge pt-4">
            <span className="mr-2 text-sm text-ink-2">Formed with</span>
            <span lang="ja" className="font-jp [overflow-wrap:anywhere]">
              {g.formation}
            </span>
          </p>
        )}
      </div>
      {g.notes && <p className="mt-5 leading-relaxed text-ink-2">{g.notes}</p>}

      <section className="mt-12">
        <h2 className="text-xl font-medium">Examples</h2>
        <ul className="mt-4 divide-y divide-edge overflow-hidden rounded-2xl border border-edge bg-paper-raised">
          {g.examples.map((ex) => (
            <li key={ex.ja} className="px-5 py-5 sm:px-6">
              <ExampleSentence example={ex} />
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-medium">Related points</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/grammar/${p.id}`} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-edge bg-paper-raised px-3 py-2 hover:bg-grid">
                  <span lang="ja" className="font-jp min-w-0 [overflow-wrap:anywhere]">
                    {p.pattern}
                  </span>
                  <span className="text-sm text-ink-2">{p.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="More grammar" className="mt-12 grid gap-3 border-t border-edge pt-5 text-sm sm:grid-cols-2">
        {at > 0 ? (
          <Link href={`/grammar/${sameLevel[at - 1].id}`} className="min-w-0 rounded-xl border border-edge bg-paper-raised p-4 hover:bg-grid">
            <span className="block text-ink-2">Previous</span>
            <span lang="ja" className="font-jp mt-1 block [overflow-wrap:anywhere]">{sameLevel[at - 1].pattern}</span>
          </Link>
        ) : (
          <span />
        )}
        {at < sameLevel.length - 1 && (
          <Link href={`/grammar/${sameLevel[at + 1].id}`} className="min-w-0 rounded-xl border border-edge bg-paper-raised p-4 hover:bg-grid">
            <span className="block text-ink-2">Next</span>
            <span lang="ja" className="font-jp mt-1 block [overflow-wrap:anywhere]">{sameLevel[at + 1].pattern}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
