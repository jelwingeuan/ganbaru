import { SiteHeader } from "@/components/desk/site-header";

export default function DictionaryLayout({ children }: LayoutProps<"/dictionary">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-8">
      <SiteHeader />
      <main>{children}</main>
      <footer className="mt-16 border-t border-edge pt-4 text-xs text-ink-2">
        <p>
          JLPT levels are community estimates. The JLPT has published no official word or kanji lists since 2010.
        </p>
        <p className="mt-1">
          Data from <a className="underline" href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a> (
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>), using JMdict
          and KANJIDIC2 (<a className="underline" href="https://www.edrdg.org/edrdg/licence.html">EDRDG</a>), Jonathan
          Waller&apos;s JLPT lists and <a className="underline" href="https://tatoeba.org">Tatoeba</a> sentences.
        </p>
      </footer>
    </div>
  );
}
