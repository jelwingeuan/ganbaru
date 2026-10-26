import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Belt } from "@/components/desk/belt";
import { kanjiByChar, kanjiList, wordFor } from "@/lib/dictionary";

export async function generateStaticParams() {
  return kanjiList.filter((k) => k.level === "N5").map((k) => ({ char: k.character }));
}

const kanjiFrom = (char: string) => kanjiByChar.get(decodeURIComponent(char));

export async function generateMetadata({ params }: PageProps<"/dictionary/kanji/[char]">): Promise<Metadata> {
  const k = kanjiFrom((await params).char);
  return { title: k ? `${k.character} kanji` : "Kanji not found" };
}

const GRADE: Record<number, string> = { 8: "Jōyō, secondary school", 9: "Jinmeiyō (names)", 10: "Jinmeiyō (names)" };

export default function KanjiPage({ params }: PageProps<"/dictionary/kanji/[char]">) {
  return (
    <>
      <Link href="/dictionary" className="text-sm text-ink-2 underline underline-offset-4">
        Dictionary
      </Link>
      <Suspense fallback={<div className="h-64" />}>{params.then(({ char }) => <KanjiDetail char={char} />)}</Suspense>
    </>
  );
}

function KanjiDetail({ char }: { char: string }) {
  const k = kanjiFrom(char);
  if (!k) notFound();
  const words = (k.words ?? []).flatMap((text) => wordFor(text) ?? []);
  const facts = [
    ["Strokes", k.strokes],
    ["Radical", k.radical && `${k.radical} (no. ${k.radical_number})`],
    ["School grade", k.grade && (GRADE[k.grade] ?? `Grade ${k.grade}`)],
    ["Newspaper frequency", k.freq && `#${k.freq} of 2,500`],
  ].filter(([, v]) => v);

  return (
    <article>
      <header className="mt-4 flex flex-wrap items-end gap-6">
        <h1 lang="ja" className="font-study paper-grid rounded-[var(--radius-paper)] border border-edge px-4 text-[120px] leading-tight">
          {k.character}
        </h1>
        <div className="pb-2">
          <p className="text-xl">{k.meanings.join(", ")}</p>
          <Belt level={k.level} className="mt-2" />
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        {k.onyomi.length > 0 && (
          <>
            <dt className="text-ink-2">On reading</dt>
            <dd lang="ja" className="font-jp text-lg">
              {k.onyomi.join("、")}
            </dd>
          </>
        )}
        {k.kunyomi.length > 0 && (
          <>
            <dt className="text-ink-2">Kun reading</dt>
            <dd lang="ja" className="font-jp text-lg">
              {k.kunyomi.map((r, i) => {
                // KANJIDIC marks okurigana with a dot: た.べる. Show the okurigana fainter.
                const [stem, okurigana] = r.split(".");
                return (
                  <span key={r}>
                    {i > 0 && "、"}
                    {stem}
                    {okurigana && <span className="text-ink-2">{okurigana}</span>}
                  </span>
                );
              })}
            </dd>
          </>
        )}
        {facts.map(([label, value]) => (
          <div key={label as string} className="contents">
            <dt className="text-ink-2">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {k.supplementary && (
        <p className="mt-4 text-sm text-ink-2">
          Not on Jonathan Waller&apos;s lists. Its level comes from the easiest word that uses it.
        </p>
      )}

      {words.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Words with {k.character}</h2>
          <ul className="mt-2 divide-y divide-edge border-y border-edge">
            {words.map((w) => (
              <li key={w.id}>
                <Link href={`/dictionary/word/${w.id}`} className="flex items-baseline gap-3 px-1 py-3 hover:bg-grid">
                  <span lang="ja" className="font-jp shrink-0 text-lg">
                    {w.word}
                  </span>
                  <span lang="ja" className="font-jp shrink-0 text-sm text-ink-2">
                    {w.reading}
                  </span>
                  <span className="min-w-0 truncate text-sm">{w.meanings.slice(0, 2).join("; ")}</span>
                  <Belt level={w.level} className="ml-auto shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
