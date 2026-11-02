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
      <Link href="/dictionary" className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 hover:text-ink">
        ← Dictionary
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
    <article className="max-w-[44rem] pt-3 sm:pt-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.18em] text-pen uppercase">Kanji</p>
        <div className="mt-4 flex flex-wrap items-center gap-5 sm:gap-7">
          <h1 lang="ja" className="font-study paper-grid flex size-32 shrink-0 items-center justify-center rounded-2xl border border-edge text-7xl leading-none sm:size-40 sm:text-8xl">
            {k.character}
          </h1>
          <div className="min-w-0 flex-1">
            <p className="text-xl leading-relaxed [overflow-wrap:anywhere]">{k.meanings.join(", ")}</p>
            <Belt level={k.level} className="mt-3" />
          </div>
        </div>
      </header>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-edge bg-paper-raised p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 sm:p-6">
        {k.onyomi.length > 0 && (
          <>
            <dt className="text-sm text-ink-2">On reading</dt>
            <dd lang="ja" className="font-jp min-w-0 text-lg [overflow-wrap:anywhere]">
              {k.onyomi.join("、")}
            </dd>
          </>
        )}
        {k.kunyomi.length > 0 && (
          <>
            <dt className="text-sm text-ink-2">Kun reading</dt>
            <dd lang="ja" className="font-jp min-w-0 text-lg [overflow-wrap:anywhere]">
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
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="min-w-0 tabular-nums [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      {k.supplementary && (
        <p className="mt-4 text-sm text-ink-2">
          Not on Jonathan Waller&apos;s lists. Its level comes from the easiest word that uses it.
        </p>
      )}

      {words.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-medium">Words with {k.character}</h2>
          <ul className="mt-4 divide-y divide-edge overflow-hidden rounded-2xl border border-edge bg-paper-raised">
            {words.map((w) => (
              <li key={w.id}>
                <Link href={`/dictionary/word/${w.id}`} className="pressable grid min-h-18 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3 hover:bg-grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                  <span lang="ja" className="font-jp min-w-0 text-lg [overflow-wrap:anywhere]">
                    {w.word}
                  </span>
                  <span lang="ja" className="font-jp col-start-1 row-start-2 min-w-0 text-sm text-ink-2 [overflow-wrap:anywhere] sm:row-start-2">
                    {w.reading}
                  </span>
                  <span className="col-span-2 min-w-0 text-sm text-ink-2 [overflow-wrap:anywhere] sm:col-span-1 sm:col-start-2 sm:row-start-1">
                    {w.meanings.slice(0, 2).join("; ")}
                  </span>
                  <Belt level={w.level} className="col-start-2 row-start-1 shrink-0 self-start sm:col-start-3 sm:self-center" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
