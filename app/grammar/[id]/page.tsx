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
      <Link href="/grammar" className="text-sm text-ink-2 underline underline-offset-4">
        Grammar
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
    <article>
      <header className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <h1 lang="ja" className="font-study text-5xl leading-tight sm:text-6xl">
          {g.pattern}
        </h1>
        <Belt level={g.level} className="mb-2" />
      </header>
      {g.romaji && <p className="mt-1 text-sm text-ink-2">{g.romaji}</p>}

      <p className="mt-6 text-xl">{g.meaning}</p>
      {g.formation && (
        <p className="mt-3">
          <span className="text-ink-2">Formed with </span>
          <span lang="ja" className="font-jp">
            {g.formation}
          </span>
        </p>
      )}
      {g.notes && <p className="mt-3 max-w-[62ch] text-ink-2">{g.notes}</p>}

      <section className="mt-10">
        <h2 className="text-lg font-medium">Examples</h2>
        <ul className="mt-3 space-y-5">
          {g.examples.map((ex) => (
            <li key={ex.ja}>
              <ExampleSentence example={ex} />
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Related points</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/grammar/${p.id}`} className="inline-flex items-center gap-2 rounded-lg border border-edge bg-paper-raised px-3 py-1.5 hover:bg-grid">
                  <span lang="ja" className="font-jp">
                    {p.pattern}
                  </span>
                  <span className="text-xs text-ink-2">{p.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="More grammar" className="mt-10 flex justify-between gap-4 border-t border-edge pt-4 text-sm">
        {at > 0 ? (
          <Link href={`/grammar/${sameLevel[at - 1].id}`} className="underline underline-offset-4">
            Previous: <span lang="ja" className="font-jp">{sameLevel[at - 1].pattern}</span>
          </Link>
        ) : (
          <span />
        )}
        {at < sameLevel.length - 1 && (
          <Link href={`/grammar/${sameLevel[at + 1].id}`} className="text-right underline underline-offset-4">
            Next: <span lang="ja" className="font-jp">{sameLevel[at + 1].pattern}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
