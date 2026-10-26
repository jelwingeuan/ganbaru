"use client";

import { useState } from "react";
import { Belt, BELTS, type Level } from "./belt";
import {
  Countdown,
  ExamTicket,
  HoldToConfirm,
  InkBottle,
  ModeSegment,
  SetupStepper,
  StampCard,
  Step,
  Tally,
  UnitStatus,
  WordStack,
} from "./bits";
import { DEMO_WORDS } from "@/lib/demo-words";

export function TodayWidgets() {
  const [reviews, setReviews] = useState(18);
  const goal = 30;
  return (
    <div className="flex flex-wrap items-end gap-10">
      <div>
        <Countdown days={47} />
        <p className="text-sm text-ink-2">days to the N3 exam</p>
      </div>
      <div className="flex items-end gap-4">
        <InkBottle value={(reviews / goal) * 100} label={`Daily goal: ${reviews} of ${goal} reviews`} />
        <div>
          <p className="text-2xl font-medium tabular-nums">
            {reviews} of {goal}
          </p>
          <p className="mb-2 text-sm text-ink-2">reviews today</p>
          <button
            type="button"
            onClick={() => setReviews((r) => Math.min(goal, r + 3))}
            className="h-10 rounded-lg border border-ink bg-paper-raised px-3 text-sm hover:bg-grid"
          >
            Do 3 reviews
          </button>
        </div>
      </div>
      <div>
        <p className="text-[56px] leading-none font-medium">
          <Tally to={1240} prefix="+" />
        </p>
        <p className="text-sm text-ink-2">XP this week</p>
      </div>
    </div>
  );
}

const MODES = [
  { value: "exact", label: "Exact" },
  { value: "starts", label: "Starts with" },
  { value: "contains", label: "Contains" },
  { value: "ends", label: "Ends with" },
];

const RESULTS: Record<string, { word: string; reading: string; meaning: string; level: Level }[]> = {
  exact: [{ word: "食べる", reading: "たべる", meaning: "to eat", level: "N5" }],
  starts: [
    { word: "食べる", reading: "たべる", meaning: "to eat", level: "N5" },
    { word: "食べ物", reading: "たべもの", meaning: "food", level: "N5" },
    { word: "食べ放題", reading: "たべほうだい", meaning: "all you can eat", level: "N2" },
  ],
  contains: [
    { word: "食べ物", reading: "たべもの", meaning: "food", level: "N5" },
    { word: "食べ過ぎる", reading: "たべすぎる", meaning: "to overeat", level: "N3" },
  ],
  ends: [{ word: "立ち食べ", reading: "たちたべ", meaning: "eating while standing", level: "N1" }],
};

export function SearchDemo() {
  const [mode, setMode] = useState("starts");
  return (
    <div className="max-w-xl">
      <div className="mb-3 flex h-11 items-center rounded-lg border border-ink bg-paper-raised px-3">
        <span lang="ja" className="font-jp text-[17px]">
          食べ
        </span>
        <span className="ml-auto text-xs text-ink-2">
          Press <kbd className="rounded border border-edge px-1.5">/</kbd> to search
        </span>
      </div>
      <ModeSegment items={MODES} value={mode} onChange={setMode} aria-label="Search mode" />
      <ul className="mt-3 divide-y divide-edge border-y border-edge">
        {RESULTS[mode].map((r) => (
          <li key={r.word} className="flex items-baseline gap-3 py-2.5">
            <span lang="ja" className="font-jp text-lg">
              <mark className="rounded-sm bg-hi px-0.5 text-ink">食べ</mark>
              {r.word.replace("食べ", "")}
            </span>
            <span lang="ja" className="font-jp text-sm text-ink-2">
              {r.reading}
            </span>
            <span className="text-sm">{r.meaning}</span>
            <Belt level={r.level} className="ml-auto" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UnitList() {
  return (
    <ul className="space-y-2.5">
      <li>
        <UnitStatus state="done" label="Food and drink, 10 words" />
      </li>
      <li>
        <UnitStatus state="learning" progress={0.4} label="Getting around, 4 of 10 learned" />
      </li>
      <li>
        <UnitStatus state="todo" label="Weather and seasons, not started" />
      </li>
    </ul>
  );
}

export function NewWordStack() {
  const [at, setAt] = useState(0);
  const cards = DEMO_WORDS.map((w) => (
    <div key={w.word} className="paper-grid flex h-full w-full flex-col items-center justify-center border border-edge text-ink">
      <span lang="ja" className="font-study text-5xl">
        {w.word}
      </span>
      <span lang="ja" className="font-jp mt-2 text-ink-2">
        {w.reading}
      </span>
      <span className="text-sm">{w.meaning}</span>
    </div>
  ));
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="h-56 w-44">
        <WordStack cards={cards} onChange={setAt} />
      </div>
      <p className="max-w-56 text-sm text-ink-2">
        Word {at + 1} of {DEMO_WORDS.length}. Drag or flick the top card to see the next one before you study the batch.
      </p>
    </div>
  );
}

function Seal({ skill, level }: { skill: string; level: Level }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex size-28 -rotate-6 flex-col items-center justify-center rounded-full border-[3px] border-redpen text-redpen">
        <span lang="ja" className="font-study text-3xl leading-none">
          {skill}
        </span>
        <span className="mt-1 text-xs font-medium">{level}</span>
      </div>
      <span className="text-xs text-ink-2">Tap to flip</span>
    </div>
  );
}

export function StampBook() {
  const stamps = [
    { skill: "語彙", level: "N5" as Level, unit: "Food and drink", date: "26 Oct 2026" },
    { skill: "漢字", level: "N5" as Level, unit: "Numbers and time", date: "24 Oct 2026" },
    { skill: "文法", level: "N4" as Level, unit: "Giving and receiving", date: "20 Oct 2026" },
  ];
  return (
    <div className="flex flex-wrap gap-5">
      {stamps.map((s) => (
        <StampCard
          key={s.unit}
          label={`${s.level} ${s.unit} stamp`}
          front={<Seal skill={s.skill} level={s.level} />}
          back={
            <div className="flex h-full flex-col justify-center gap-1 p-4 text-sm">
              <p className="font-medium">{s.unit}</p>
              <p className="text-ink-2">Perfect score</p>
              <p className="text-ink-2">{s.date}</p>
            </div>
          }
        />
      ))}
    </div>
  );
}

export function TicketDemo() {
  const [started, setStarted] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ExamTicket
        onTear={() => setStarted(true)}
        stub={
          <div className="flex h-full items-center justify-center text-center text-xs text-ink-2">
            Tear
            <br />
            to start
          </div>
        }
      >
        <div className="flex h-full flex-col justify-center gap-1 px-5">
          <p lang="ja" className="font-study text-2xl">
            受験票
          </p>
          <p className="font-medium">N3 mock test</p>
          <p className="text-sm text-ink-2">Vocabulary, grammar and reading. 105 minutes.</p>
        </div>
      </ExamTicket>
      <p aria-live="polite" className="text-sm text-ink-2">
        {started ? "Test started. The timer is running." : "Drag the stub off, or focus it and press Enter."}
      </p>
    </div>
  );
}

export function DangerZone() {
  const [msg, setMsg] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-4">
      <HoldToConfirm doneLabel="Deck reset" onHold={() => setMsg("Deck reset. Your N5 cards are new again.")}>
        Hold to reset deck
      </HoldToConfirm>
      <p aria-live="polite" className="text-sm text-ink-2">
        {msg || "Press and hold for about a second. Letting go early cancels."}
      </p>
    </div>
  );
}

export function SetupDemo() {
  const [level, setLevel] = useState<Level>("N4");
  const [goal, setGoal] = useState(20);
  return (
    <div className="max-w-md">
      <SetupStepper nextButtonText="Next" completeButtonText="Start studying" completedContent={<p className="py-4">You&apos;re set. Your first 10 {level} words are ready.</p>}>
        <Step>
          <p className="mb-3 font-medium">Which level are you aiming for?</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BELTS) as Level[]).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={level === l}
                onClick={() => setLevel(l)}
                className="rounded-full outline-offset-2 aria-pressed:outline-2 aria-pressed:outline-ink"
              >
                <Belt level={l} />
              </button>
            ))}
          </div>
        </Step>
        <Step>
          <p className="mb-3 font-medium">When is your exam?</p>
          <div className="flex gap-2">
            <button type="button" className="h-10 rounded-lg border border-ink bg-paper-raised px-3 text-sm">
              July 2027
            </button>
            <button type="button" className="h-10 rounded-lg border border-edge bg-paper-raised px-3 text-sm">
              December 2026
            </button>
          </div>
        </Step>
        <Step>
          <p className="mb-3 font-medium">How many new words a day?</p>
          <div className="flex gap-2">
            {[10, 20, 30].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={goal === n}
                onClick={() => setGoal(n)}
                className="h-10 rounded-lg border border-edge bg-paper-raised px-4 text-sm aria-pressed:border-ink aria-pressed:font-medium"
              >
                {n}
              </button>
            ))}
          </div>
        </Step>
      </SetupStepper>
    </div>
  );
}
