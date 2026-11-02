import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StudyCard } from "@/components/desk/study-card";
import { tests } from "@/lib/content";
import { DEMO_WORDS } from "@/lib/demo-words";
import { grammarPoints, kanjiList, words } from "@/lib/dictionary";

const fmt = (n: number) => n.toLocaleString("en");

const SECTIONS = [
  { href: "/test", title: "Mock tests", detail: `${tests.length} full tests in the real JLPT format, N5 to N1` },
  { href: "/grammar", title: "Grammar", detail: `${fmt(grammarPoints.length)} points with forms and examples` },
  { href: "/dictionary", title: "Dictionary", detail: `${fmt(words.length)} words and ${fmt(kanjiList.length)} kanji` },
];

export default function Home() {
  return (
    <main>
      <div className="grid grid-cols-1 items-center gap-10 pt-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:pt-12">
        <div>
          <h1 className="text-4xl leading-tight font-medium sm:text-5xl">Pass the JLPT one red sheet at a time.</h1>
          <p className="mt-4 max-w-[48ch] text-lg text-ink-2">
            Every word from N5 to N1, scheduled to come back right before you&apos;d forget it. Type the reading, peek
            under the sheet, grade yourself, and move on.
          </p>
          <Link href="/test" className="mt-6 pressable inline-flex h-12 items-center rounded-lg bg-ink px-5 font-medium text-paper hover:opacity-90">
            Start practising
          </Link>
        </div>
        <div className="paper-grid rounded-xl border border-edge p-3 sm:p-6">
          <p className="mb-3 text-sm text-ink-2">Try it: type the reading in romaji, or slide the red sheet off.</p>
          <StudyCard words={DEMO_WORDS} />
        </div>
      </div>

      <ul className="mt-16 grid gap-3 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="pressable flex h-full items-center gap-3 rounded-xl border border-edge bg-paper-raised p-4 hover:bg-grid"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.title}</span>
                <span className="mt-0.5 block text-sm text-ink-2">{s.detail}</span>
              </span>
              <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
