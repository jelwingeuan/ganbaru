import { furiganaParts } from "@/lib/furigana";

function Furigana({ text, show }: { text: string; show: boolean }) {
  return furiganaParts(text).map((p, i) =>
    p.ruby && show ? (
      <ruby key={i}>
        {p.text}
        <rt>{p.ruby}</rt>
      </ruby>
    ) : (
      p.text
    ),
  );
}

/** Renders a question stem: {漢字|かな} furigana, [[underlined]] target and （　） blank. */
export function Stem({ text, furigana }: { text: string; furigana: boolean }) {
  return text.split(/(\[\[.+?\]\]|（　）)/).map((piece, i) => {
    if (piece === "（　）")
      return (
        <span key={i} className="mx-1 inline-block w-[4em] border-b-2 border-ink align-baseline" aria-label="blank">
          &nbsp;
        </span>
      );
    if (piece.startsWith("[["))
      return (
        <u key={i} className="decoration-ink decoration-2 underline-offset-[6px]">
          <Furigana text={piece.slice(2, -2)} show={furigana} />
        </u>
      );
    return <Furigana key={i} text={piece} show={furigana} />;
  });
}
