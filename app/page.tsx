import Link from "next/link";
import { ArrowRight, BookOpenText, ClipboardList, Languages } from "lucide-react";
import { StudyCard } from "@/components/desk/study-card";
import { tests } from "@/lib/content";
import { DEMO_WORDS } from "@/lib/demo-words";
import { grammarPoints, kanjiList, words } from "@/lib/dictionary";

const fmt = (n: number) => n.toLocaleString("en");

const SECTIONS = [
  { href: "/test", title: "Mock tests", detail: "Timed practice and focused drills, N5 to N1", count: `${tests.length} tests`, icon: ClipboardList },
  { href: "/grammar", title: "Grammar", detail: "Forms, meanings and examples at every level", count: `${fmt(grammarPoints.length)} points`, icon: BookOpenText },
  { href: "/dictionary", title: "Dictionary", detail: "Find words and kanji by Japanese or English", count: `${fmt(words.length)} words · ${fmt(kanjiList.length)} kanji`, icon: Languages },
];

export default function Home() {
  return (
    <main className="pt-8 sm:pt-12 lg:pt-16">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 xl:gap-20">
        <section className="max-w-[44rem]">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-redpen-ink uppercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-redpen" />
            Your JLPT study desk
          </p>
          <h1 className="mt-5 max-w-[12ch] text-[clamp(2.65rem,5.4vw,5rem)] leading-[1.04] font-medium tracking-[-0.045em]">
            Keep going. Get ready for the JLPT.
          </h1>
          <p className="mt-6 max-w-[49ch] text-lg leading-relaxed text-ink-2 sm:text-xl">
            Work through timed mock tests, focused drills, clear grammar guides and a searchable Japanese dictionary.
            Start at your level and take the next step at your own pace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/test" className="pressable inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-ink px-5 font-medium text-paper hover:opacity-90">
              Choose your level <ArrowRight aria-hidden size={18} />
            </Link>
            <Link href="/grammar" className="pressable inline-flex min-h-12 items-center justify-center rounded-xl border border-edge bg-paper-raised px-5 font-medium hover:bg-grid">
              Explore grammar
            </Link>
          </div>
          <p className="mt-8 border-t border-edge pt-5 text-sm text-ink-2">
            Five JLPT levels. One place to practise, read and review.
          </p>
        </section>

        <section aria-labelledby="sample-title" className="min-w-0 rounded-[1.75rem] border border-edge bg-paper-raised p-3 shadow-[var(--shadow-float)] sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2 pt-1 pb-4 sm:px-3">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-redpen-ink uppercase">A little preview</p>
              <h2 id="sample-title" className="mt-1 text-xl font-medium">Try the red sheet</h2>
            </div>
            <p className="text-sm text-ink-2">Sample card</p>
          </div>
          <StudyCard words={DEMO_WORDS} />
          <p className="px-2 pt-4 text-sm text-ink-2 sm:px-3">
            Type the reading in romaji or kana, then check it. You can also slide the sheet to peek.
          </p>
        </section>
      </div>

      <section aria-labelledby="explore-title" className="mt-16 pb-10 sm:mt-20">
        <div className="mb-5">
          <p className="text-xs font-bold tracking-[0.14em] text-redpen-ink uppercase">Find your next step</p>
          <h2 id="explore-title" className="mt-1 text-2xl font-medium tracking-[-0.02em] sm:text-3xl">Choose how to study</h2>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {SECTIONS.map(({ href, title, detail, count, icon: Icon }) => (
            <li key={href} className="min-w-0">
              <Link href={href} className="pressable group flex h-full min-h-44 flex-col rounded-2xl border border-edge bg-paper-raised p-5 shadow-[var(--shadow-float)] hover:border-ink/30 hover:bg-grid">
                <span className="mb-5 flex size-10 items-center justify-center rounded-xl bg-grid text-ink"><Icon aria-hidden size={20} /></span>
                <span className="flex items-center justify-between gap-3 text-lg font-medium">{title} <ArrowRight aria-hidden size={18} className="shrink-0 text-ink-2" /></span>
                <span className="mt-1 block text-sm text-ink-2">{detail}</span>
                <span className="mt-auto block pt-5 text-xs font-medium text-ink-2">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
