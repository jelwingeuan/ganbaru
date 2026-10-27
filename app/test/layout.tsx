import { SiteHeader } from "@/components/desk/site-header";

export default function TestLayout({ children }: LayoutProps<"/test">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-8">
      <SiteHeader />
      <main>{children}</main>
      <footer className="mt-16 border-t border-edge pt-4 text-xs text-ink-2">
        <p>
          Practice questions are Ganbaru originals in the official JLPT question formats, built from{" "}
          <a className="underline" href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a> and{" "}
          <a className="underline" href="https://tatoeba.org">Tatoeba</a> sentences (
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>). They are not
          real JLPT questions.
        </p>
        <p className="mt-1">
          Listening voices: VOICEVOX:九州そら, VOICEVOX:四国めたん, VOICEVOX:玄野武宏, VOICEVOX:青山龍星 (
          <a className="underline" href="https://voicevox.hiroshiba.jp/">VOICEVOX</a>).
        </p>
      </footer>
    </div>
  );
}
