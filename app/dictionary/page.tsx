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
    <>
      <h1 className="mb-4 text-2xl font-medium">Dictionary</h1>
      <Suspense fallback={<SearchBox query="" mode="starts" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </>
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
        <div className="mt-8 text-ink-2">
          <p>Try one of these:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((q) => (
              <li key={q}>
                <Link
                  href={`/dictionary?q=${encodeURIComponent(q)}`}
                  className="font-jp inline-block rounded-lg border border-edge bg-paper-raised px-3 py-1.5 text-ink hover:bg-grid"
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
            <ul aria-label="Kanji" className="mt-6 flex flex-wrap gap-2">
              {kanji.map((k) => (
                <li key={k.character}>
                  <Link
                    href={`/dictionary/kanji/${encodeURIComponent(k.character)}`}
                    className="flex items-center gap-3 rounded-lg border border-edge bg-paper-raised py-2 pr-3 pl-2 hover:bg-grid"
                  >
                    <span lang="ja" className="font-study text-3xl leading-none">
                      {k.character}
                    </span>
                    <span className="text-sm">
                      {k.meanings.slice(0, 2).join(", ")}
                      <span className="block text-xs text-ink-2">Kanji, {k.level}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-sm text-ink-2" aria-live="polite">
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

          <ul className="mt-2 divide-y divide-edge border-y border-edge">
            {words.map((w) => (
              <li key={w.id}>
                <Link href={`/dictionary/word/${w.id}`} className="flex items-baseline gap-3 px-1 py-3 hover:bg-grid">
                  <span lang="ja" className="font-jp shrink-0 text-lg">
                    <Highlight word={w.word} text={text} />
                  </span>
                  {w.reading !== w.word && (
                    <span lang="ja" className="font-jp shrink-0 text-sm text-ink-2">
                      {w.reading}
                    </span>
                  )}
                  <span className="min-w-0 truncate text-sm">{w.meanings.slice(0, 3).join("; ")}</span>
                  <Belt level={w.level} className="ml-auto shrink-0" />
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
