import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Belt, BELTS, type Level } from "@/components/desk/belt";
import { ListRow } from "@/components/desk/list-row";
import { StudyCard } from "@/components/desk/study-card";
import { DEMO_WORDS } from "@/lib/demo-words";

export const metadata: Metadata = { title: "Design reference" };

const COLORS = [
  { token: "paper", name: "Paper", role: "Page background" },
  { token: "paper-raised", name: "Raised paper", role: "Reading and study surfaces" },
  { token: "grid", name: "Grid", role: "Quiet fills and notebook lines" },
  { token: "edge", name: "Edge", role: "Surface boundaries" },
  { token: "ink", name: "Ink", role: "Primary text and actions" },
  { token: "ink-2", name: "Soft ink", role: "Supporting text" },
  { token: "pen", name: "Check pen", role: "Revealed answers" },
  { token: "redpen", name: "Red sheet", role: "Marks and the study sheet" },
  { token: "hi", name: "Highlighter", role: "Search matches" },
];

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="border-t border-edge py-9 sm:py-12">
      <div className="max-w-[44rem]">
        <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
        <p className="mt-2 text-ink-2">{note}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="pb-12">
      <header className="max-w-[44rem] py-10 sm:py-16">
        <p className="text-sm font-bold tracking-[0.14em] text-redpen-ink uppercase">Ganbaru / Design reference</p>
        <h1 className="mt-4 text-4xl leading-tight font-medium tracking-tight sm:text-5xl">A calmer place to study.</h1>
        <p className="mt-4 text-lg text-ink-2">
          Paper holds the lesson. Ink guides the eye. The red sheet adds one useful moment of discovery. These are the
          colors, type, and controls used in the live study flows.
        </p>
      </header>

      <Section title="Color roles" note="Each color has one job. Reading content stays on solid paper; translucent material belongs to navigation and controls.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLORS.map((color) => (
            <li key={color.token} className="flex min-w-0 items-center gap-4 rounded-2xl border border-edge bg-paper-raised p-4">
              <span className="size-12 shrink-0 rounded-xl border border-edge" style={{ backgroundColor: `var(--${color.token})` }} />
              <span className="min-w-0">
                <span className="block font-medium">{color.name}</span>
                <span className="block text-sm text-ink-2">{color.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Reading type" note="English labels stay clear at small sizes; Japanese examples keep generous leading and ruby readings.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-edge bg-paper-raised p-5 sm:p-7">
            <p className="text-sm text-ink-2">Study word · Klee One</p>
            <p lang="ja" className="font-study mt-4 text-5xl leading-tight">勉強する</p>
          </div>
          <div className="rounded-2xl border border-edge bg-paper-raised p-5 sm:p-7">
            <p className="text-sm text-ink-2">Reading text · BIZ UDPGothic</p>
            <p lang="ja" className="font-jp mt-4 text-lg leading-loose">
              <ruby>毎日<rt>まいにち</rt></ruby>、<ruby>日本語<rt>にほんご</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>しています。
            </p>
          </div>
        </div>
      </Section>

      <Section title="Level and destination" note="Level colors identify the JLPT level. The same belts and ruled rows lead into the working test, grammar, and dictionary pages.">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BELTS) as Level[]).map((level) => (
            <Link key={level} href={`/test/${level.toLowerCase()}`} className="rounded-full focus-visible:outline-offset-4">
              <Belt level={level} />
            </Link>
          ))}
        </div>
        <ul className="mt-7 max-w-[44rem] divide-y divide-edge border-y border-edge">
          <li><ListRow href="/test"><span className="font-medium">Practice tests</span><span className="text-sm text-ink-2">Timed exams and skill drills</span></ListRow></li>
          <li><ListRow href="/grammar"><span className="font-medium">Grammar</span><span className="text-sm text-ink-2">Forms, meanings, and examples</span></ListRow></li>
          <li><ListRow href="/dictionary"><span className="font-medium">Dictionary</span><span className="text-sm text-ink-2">Words and kanji</span></ListRow></li>
        </ul>
      </Section>

      <Section title="The red sheet" note="This is the same interactive study sample shown on Home. It is a preview, not a saved spaced-repetition deck.">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
          <div className="paper-grid min-w-0 rounded-2xl border border-edge p-3 sm:p-5">
            <StudyCard words={DEMO_WORDS} />
          </div>
          <div className="max-w-[44rem] space-y-4 text-ink-2">
            <p>Type the reading in romaji or slide the sheet to reveal the answer. The sheet responds to your gesture and can be interrupted.</p>
            <Link href="/test" className="pressable inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-5 font-medium text-paper hover:opacity-90">
              Explore practice <ArrowUpRight aria-hidden size={18} />
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
