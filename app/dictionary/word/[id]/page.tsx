import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Belt } from "@/components/desk/belt";
import { ExampleSentence } from "@/components/desk/example-sentence";
import { kanjiByChar, posLabel, wordById, words } from "@/lib/dictionary";

// N5 pages are built ahead of time; every other word renders on its first visit and is then kept.
export async function generateStaticParams() {
  return words.filter((w) => w.level === "N5").map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: PageProps<"/dictionary/word/[id]">): Promise<Metadata> {
  const w = wordById.get((await params).id);
  return { title: w ? `${w.word} (${w.reading})` : "Word not found" };
}

// The link stays in the static shell so navigating here is instant; the word streams in once params resolve.
export default function WordPage({ params }: PageProps<"/dictionary/word/[id]">) {
  return (
    <>
      <Link href="/dictionary" className="text-sm text-ink-2 underline underline-offset-4">
        Dictionary
      </Link>
      <Suspense fallback={<div className="h-64" />}>{params.then(({ id }) => <Word id={id} />)}</Suspense>
    </>
  );
}

function Word({ id }: { id: string }) {
  const w = wordById.get(id);
  if (!w) notFound();
  const kanji = [...new Set(w.word)].flatMap((c) => kanjiByChar.get(c) ?? []);

  return (
    <article>
      <header className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <h1 lang="ja" className="font-study text-6xl leading-tight sm:text-7xl">
          {w.word}
        </h1>
        <div className="pb-2">
          {w.reading !== w.word && (
            <p lang="ja" className="font-jp text-2xl">
              {w.reading}
            </p>
          )}
          <p className="text-sm text-ink-2">{w.romaji}</p>
        </div>
        <Belt level={w.level} className="mb-3" />
      </header>

      <section className="mt-8">
        <h2 className="sr-only">Meanings</h2>
        <ol className="list-inside list-decimal space-y-1 text-lg marker:text-ink-2">
          {w.meanings.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ol>
        {w.pos && <p className="mt-2 text-sm text-ink-2">{w.pos.map(posLabel).join(", ")}</p>}
        {(w.other_forms?.length || w.other_readings?.length) && (
          <p lang="ja" className="font-jp mt-2 text-sm text-ink-2">
            Also written {[...(w.other_forms ?? []), ...(w.other_readings ?? [])].join("、")}
          </p>
        )}
      </section>

      {kanji.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Kanji in this word</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {kanji.map((k) => (
              <li key={k.character}>
                <Link
                  href={`/dictionary/kanji/${encodeURIComponent(k.character)}`}
                  className="flex items-center gap-3 rounded-lg border border-edge bg-paper-raised py-2 pr-3 pl-2 hover:bg-grid"
                >
                  <span lang="ja" className="font-study text-3xl leading-none">
                    {k.character}
                  </span>
                  <span className="text-sm">{k.meanings.slice(0, 2).join(", ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium">Examples</h2>
        {w.examples?.length ? (
          <ul className="mt-3 space-y-5">
            {w.examples.map((ex) => (
              <li key={ex.tatoeba_id ?? ex.ja}>
                <ExampleSentence example={ex} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ink-2">No example sentences for this word yet.</p>
        )}
      </section>
    </article>
  );
}
