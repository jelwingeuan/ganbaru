import { furiganaParts } from "@/lib/furigana";
import type { Example } from "@/lib/openjlpt";

/** A Japanese example with furigana as ruby, its translation and, for Tatoeba sentences, a source link. */
export function ExampleSentence({ example }: { example: Example }) {
  return (
    <>
      <p lang="ja" className="font-jp text-xl leading-[2.2]">
        {example.furigana
          ? furiganaParts(example.furigana).map((p, i) =>
              p.ruby ? (
                <ruby key={i}>
                  {p.text}
                  <rt>{p.ruby}</rt>
                </ruby>
              ) : (
                p.text
              ),
            )
          : example.ja}
      </p>
      <p className="text-ink-2">
        {example.en}
        {example.tatoeba_id && (
          <a href={`https://tatoeba.org/sentences/show/${example.tatoeba_id}`} className="ml-2 text-xs underline underline-offset-2">
            Tatoeba {example.tatoeba_id}
          </a>
        )}
      </p>
    </>
  );
}
