import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Belt } from "@/components/desk/belt";
import { MODES, search, type Mode } from "@/lib/dictionary";
import { SearchBox } from "./search-box";

export const metadata: Metadata = { title: "Dictionary" };

const EXAMPLES = ["食べる", "taberu", "eat", "#n5 #verb", "学"];

export default function DictionaryPage({ searchParams }: PageProps<"/dictionary">) {
  return (
    <div className="max-w-[56rem]">
      <header className="max-w-[44rem] pt-4 sm:pt-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-pen uppercase">Dictionary</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Find a word. Keep going.</h1>
        <p className="mt-4 text-lg text-ink-2">Look up Japanese words and kanji by writing, reading, or meaning.</p>
      </header>
      <div className="mt-8">
      <Suspense fallback={<SearchBox query="" mode="starts" />}>
        <Results searchParams={searchParams} />
      </Suspense>
      </div>
    </div>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/dictionary">, "searchParams">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const mode: Mode = MODES.includes(params.mode as Mode) ? (params.mode as Mode) : "starts";
  const { words, total, kanji, unknownTags } = search(query, mode);
  const text = query.split(/\s+/).filter((t) => t && !t.startsWith("#")).join(" ");

  return (
    <>
      <SearchBox query={query} mode={mode} />

      {unknownTags.length > 0 && (
        <p className="mt-4 text-sm text-redpen-ink">
          Unknown tag {unknownTags.map((t) => `#${t}`).join(", ")}. Tags are #n5 to #n1, #verb, #noun, #adj and #adv.
        </p>
      )}

      {!query.trim() ? (
        <div className="mt-10">
          <h2 className="font-medium">Try a search</h2>
          <p className="mt-1 text-sm text-ink-2">Use a word, a reading, a meaning, or a level tag.</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((q) => (
              <li key={q}>
                <Link
                  href={`/dictionary?q=${encodeURIComponent(q)}`}
                  className="font-jp inline-flex min-h-11 items-center rounded-xl border border-edge bg-paper-raised px-4 py-2 text-ink hover:bg-grid"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {kanji.length > 0 && (
            <ul aria-label="Kanji" className="mt-8 flex flex-wrap gap-2">
              {kanji.map((k) => (
                <li key={k.character}>
                  <Link
                    href={`/dictionary/kanji/${encodeURIComponent(k.character)}`}
                    className="flex min-h-16 max-w-full items-center gap-3 rounded-xl border border-edge bg-paper-raised py-2 pr-4 pl-3 hover:bg-grid"
                  >
                    <span lang="ja" className="font-study text-3xl leading-none">
                      {k.character}
                    </span>
                    <span className="min-w-0 text-sm [overflow-wrap:anywhere]">
                      {k.meanings.slice(0, 2).join(", ")}
                      <span className="block text-sm text-ink-2">Kanji, {k.level}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-sm text-ink-2" aria-live="polite">
            {total === 0
              ? `No words match “${query.trim()}”.`
              : total > words.length
                ? `Showing ${words.length} of ${total} words`
                : `${total} ${total === 1 ? "word" : "words"}`}
            {total === 0 && mode !== "contains" && (
              <>
                {" "}
                <Link className="text-ink underline" href={`/dictionary?q=${encodeURIComponent(query.trim())}&mode=contains`}>
                  Search with Contains
                </Link>
              </>
            )}
          </p>

          <ul className="mt-3 divide-y divide-edge overflow-hidden rounded-2xl border border-edge bg-paper-raised">
            {words.map((w) => (
              <li key={w.id}>
                <Link href={`/dictionary/word/${w.id}`} className="pressable grid min-h-18 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3 hover:bg-grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                  <span className="min-w-0">
                    <span lang="ja" className="font-jp block text-lg [overflow-wrap:anywhere]">
                      <Highlight word={w.word} text={text} />
                    </span>
                    {w.reading !== w.word && <span lang="ja" className="font-jp block text-sm text-ink-2 [overflow-wrap:anywhere]">{w.reading}</span>}
                  </span>
                  <span className="col-span-2 min-w-0 text-sm text-ink-2 [overflow-wrap:anywhere] sm:col-span-1 sm:col-start-2 sm:row-start-1">
                    {w.meanings.slice(0, 3).join("; ")}
                  </span>
                  <Belt level={w.level} className="col-start-2 row-start-1 shrink-0 self-start sm:col-start-3 sm:self-center" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Highlight({ word, text }: { word: string; text: string }) {
  const at = text ? word.indexOf(text) : -1;
  if (at < 0) return word;
  return (
    <>
      {word.slice(0, at)}
      <mark className="rounded-sm bg-hi px-0.5 text-ink">{text}</mark>
      {word.slice(at + text.length)}
    </>
  );
}
