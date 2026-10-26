import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Belt, BELTS, type Level } from "@/components/desk/belt";
import {
  DangerZone,
  NewWordStack,
  SearchDemo,
  SetupDemo,
  StampBook,
  TicketDemo,
  TodayWidgets,
  UnitList,
} from "@/components/desk/showcase";
import { StudyCard } from "@/components/desk/study-card";
import { ThemeToggle } from "@/components/desk/theme-toggle";
import { DEMO_WORDS } from "@/lib/demo-words";

export const metadata: Metadata = { title: "Design system" };

const COLORS = [
  { token: "paper", name: "Grid paper", role: "Page and study surfaces", light: "#F6F8FA", dark: "#131B2C" },
  { token: "grid", name: "Grid line", role: "Notebook grid, quiet fills", light: "#E3EAF2", dark: "#1F2A40" },
  { token: "ink", name: "Blue-black ink", role: "Text and primary buttons", light: "#1B2A47", dark: "#E4EAF4" },
  { token: "ink-2", name: "Faded ink", role: "Secondary text", light: "#56688A", dark: "#9AA8C2" },
  { token: "pen", name: "Check-pen orange", role: "Answers only, 24px and up", light: "#FF5A1F", dark: "#FF8A4C" },
  { token: "redpen", name: "Red pen", role: "Red sheet, marks, stamps, destructive", light: "#E5243B", dark: "#FF4D5E" },
  { token: "hi", name: "Highlighter", role: "New items and search matches", light: "#FFE76A", dark: "#E8C93A at 35%" },
];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-edge py-10">
      <h2 className="text-xl font-medium">{title}</h2>
      {note && <p className="mt-1 max-w-[62ch] text-ink-2">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 py-8">
        <div>
          <p className="text-sm text-ink-2">
            Ganbaru <span lang="ja" className="font-jp">頑張る</span>
          </p>
          <h1 className="text-3xl font-medium">The study desk</h1>
          <p className="mt-2 max-w-[62ch] text-ink-2">
            Grid paper, blue-black ink, and check-pen answers hidden under a red sheet. One bold idea, and everything
            around it stays quiet so studying stays fast.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid grid-cols-1 gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <StudyCard words={DEMO_WORDS} />
        <div className="space-y-4 text-sm text-ink-2">
          <h2 className="text-xl font-medium text-ink">The red sheet</h2>
          <p>
            Answers are written in check-pen orange. The sheet hides them and leaves the blue-black ink readable,
            which is how students in Japan memorise.
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt><kbd className="rounded border border-edge px-1.5 text-ink">Enter</kbd></dt>
            <dd>Check what you typed</dd>
            <dt><kbd className="rounded border border-edge px-1.5 text-ink">Space</kbd></dt>
            <dd>Peek under the sheet</dd>
            <dt><kbd className="rounded border border-edge px-1.5 text-ink">1–4</kbd></dt>
            <dd>Grade, from Again to Easy</dd>
          </dl>
          <p>Type in romaji and it turns into kana as you go. A grade can be undone for five seconds.</p>
        </div>
      </div>

      <Section title="Color" note="Every color is a role, and none is decoration. Orange appears only on answers, red only on the sheet, marks and stamps.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLORS.map((c) => (
            <li key={c.token} className="flex items-center gap-3 rounded-lg border border-edge bg-paper-raised p-3">
              <span className="size-12 shrink-0 rounded-md border border-edge" style={{ background: `var(--${c.token})` }} />
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-ink-2">{c.role}</p>
                <p className="text-xs text-ink-2 tabular-nums">
                  {c.light}, night {c.dark}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type" note="Each face was chosen for legibility. Klee One keeps textbook stroke shapes, so learners see kanji the way they write them.">
        <div className="space-y-6">
          <div>
            <p lang="ja" className="font-study text-6xl">勉強する</p>
            <p className="text-sm text-ink-2">Klee One 600 for study words on cards</p>
          </div>
          <div>
            <p lang="ja" className="font-jp text-xl">
              <ruby>毎日<rt>まいにち</rt></ruby>、<ruby>日本語<rt>にほんご</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>しています。
            </p>
            <p className="text-sm text-ink-2">BIZ UDPGothic for Japanese text, with furigana as ruby</p>
          </div>
          <div>
            <p className="text-xl">You have 42 reviews due and 10 new words ready.</p>
            <p className="text-sm text-ink-2">Atkinson Hyperlegible Next for English and numbers</p>
          </div>
        </div>
      </Section>

      <Section title="Buttons" note="Ink means go. Outline is the alternative. Red appears only when something gets erased, and erasing takes a hold, not a click.">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Study 42 due</Button>
          <Button variant="outline">Add to deck</Button>
          <Button variant="ghost">Skip for today</Button>
          <Button variant="destructive">Remove card</Button>
        </div>
        <div className="mt-6">
          <DangerZone />
        </div>
      </Section>

      <Section title="Level belts" note="Levels are dojo belts, from N5 white to N1 black. Belt colors only ever mean level.">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BELTS) as Level[]).map((l) => (
            <Belt key={l} level={l} />
          ))}
        </div>
      </Section>

      <Section title="Today" note="The countdown, the daily goal as an ink bottle, and the XP tally.">
        <TodayWidgets />
      </Section>

      <Section title="Dictionary search" note="Pick a search mode, and matches are highlighted like a highlighter pen.">
        <SearchDemo />
      </Section>

      <Section title="Units" note="Each level is split into units of ten. The mark shows where you are in each.">
        <UnitList />
      </Section>

      <Section title="New words">
        <NewWordStack />
      </Section>

      <Section title="Stamp book" note="A perfect score on a unit earns a stamp. Flip one to see where you earned it.">
        <StampBook />
      </Section>

      <Section title="Mock test ticket" note="Every mock test starts the way the real exam does, with your admission ticket.">
        <TicketDemo />
      </Section>

      <Section title="Onboarding">
        <SetupDemo />
      </Section>
    </main>
  );
}
