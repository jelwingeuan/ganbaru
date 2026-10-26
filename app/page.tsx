import { SiteHeader } from "@/components/desk/site-header";
import { StudyCard } from "@/components/desk/study-card";
import { DEMO_WORDS } from "@/lib/demo-words";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
      <SiteHeader />

      <div className="grid grid-cols-1 items-start gap-10 pt-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:pt-16">
        <div>
          <h1 className="text-4xl leading-tight font-medium sm:text-5xl">Pass the JLPT one red sheet at a time.</h1>
          <p className="mt-4 max-w-[48ch] text-lg text-ink-2">
            Every word from N5 to N1, scheduled to come back right before you&apos;d forget it. Type the reading, peek
            under the sheet, grade yourself, and move on.
          </p>
          <p className="mt-6 text-sm text-ink-2">Try the card. Type in romaji, then press Enter.</p>
        </div>
        <StudyCard words={DEMO_WORDS} />
      </div>
    </main>
  );
}
