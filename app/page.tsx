import Link from "next/link";
import { StudyCard } from "@/components/desk/study-card";
import { ThemeToggle } from "@/components/desk/theme-toggle";
import { DEMO_WORDS } from "@/lib/demo-words";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <p className="text-lg font-medium">
          Ganbaru <span lang="ja" className="font-jp text-ink-2">頑張る</span>
        </p>
        <nav className="flex items-center gap-3">
          <Link href="/design" className="text-sm underline underline-offset-4 hover:text-ink-2">
            Design system
          </Link>
          <ThemeToggle />
        </nav>
      </header>

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
