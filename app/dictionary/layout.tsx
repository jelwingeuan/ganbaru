export default function DictionaryLayout({ children }: LayoutProps<"/dictionary">) {
  return (
    <div>
      <main>{children}</main>
      <footer className="mt-20 max-w-[44rem] border-t border-edge pt-5 text-xs leading-relaxed text-ink-2">
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
