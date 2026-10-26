"use client";

/*
  React Bits components re-skinned to the study-desk tokens. Every color is a CSS
  variable, so each one follows the day/night desk without a theme prop.
  App code imports from here, never from components/rb directly.
*/

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import Counter from "@/components/rb/Counter";
import CountUp from "@/components/rb/CountUp";
import FlipCard from "@/components/rb/FlipCard";
import HoldButton from "@/components/rb/HoldButton";
import RubberSegment from "@/components/rb/RubberSegment";
import SloshGauge from "@/components/rb/SloshGauge";
import Stack from "@/components/rb/Stack";
import StatusMark, { type StatusMarkStatus } from "@/components/rb/StatusMark";
import Stepper, { Step } from "@/components/rb/Stepper";
import SwipeToast from "@/components/rb/SwipeToast";
import TearTicket from "@/components/rb/TearTicket";

export { Step };

/** Exam countdown digits on Today. */
export function Countdown({ days }: { days: number }) {
  return <Counter value={days} fontSize={56} fontWeight={500} textColor="var(--ink)" tabular />;
}

/** XP and score tallies on session summaries and test results. */
export function Tally({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  return <CountUp to={to} prefix={prefix} suffix={suffix} duration={1.2} separator="," className="tabular-nums" />;
}

/** Daily goal, drawn as an ink bottle filling with each review. The count sits below it. */
export function InkBottle({ value, label }: { value: number; label: string }) {
  return (
    <SloshGauge
      value={value}
      showValue={false}
      liquidColor="var(--ink)"
      glassColor="var(--grid)"
      width={64}
      height={112}
      radius={14}
      ticks={3}
      ariaLabel={label}
    />
  );
}

/** Two-way segmented control: search modes, stats ranges. */
export function ModeSegment(props: Omit<ComponentProps<typeof RubberSegment>, "trackColor" | "thumbColor" | "textColor" | "activeTextColor">) {
  return (
    <RubberSegment
      size="sm"
      trackColor="var(--grid)"
      thumbColor="var(--ink)"
      textColor="var(--ink-2)"
      activeTextColor="var(--paper)"
      {...props}
    />
  );
}

/** "Graded Good. Undo" after each grade, with a 5 second fuse. */
export function UndoToast({
  title,
  onUndo,
  onClose,
}: {
  title: ReactNode;
  onUndo: () => void;
  onClose: () => void;
}) {
  return (
    <SwipeToast
      title={title}
      actionLabel="Undo"
      onAction={onUndo}
      onClose={onClose}
      duration={5000}
      background="var(--ink)"
      color="var(--paper)"
      fuseColor="var(--pen)"
      radius={8}
      width={320}
    />
  );
}

/** Hold-to-confirm for destructive actions: reset a deck, end a test early. */
export function HoldToConfirm({ children, doneLabel, onHold }: { children: ReactNode; doneLabel: ReactNode; onHold: () => void }) {
  return (
    <HoldButton
      doneLabel={doneLabel}
      onHold={onHold}
      backgroundColor="var(--paper-raised)"
      fillColor="var(--redpen)"
      textColor="var(--redpen-ink)"
      fillTextColor="var(--on-redpen)"
      radius={8}
      holdTime={1400}
      glow={false}
      wave={false}
      resetAfter={1800}
      className="border! border-redpen!"
    >
      {children}
    </HoldButton>
  );
}

export type UnitState = "todo" | "learning" | "done";
const UNIT_STATUS: Record<UnitState, StatusMarkStatus> = { todo: "pending", learning: "running", done: "done" };

/** Unit progress glyph in the level browser. The label is ours so it keeps full contrast. */
export function UnitStatus({ state, progress, label }: { state: UnitState; progress?: number; label: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusMark
        status={UNIT_STATUS[state]}
        progress={progress}
        color="var(--ink)"
        doneColor="var(--ink)"
        errorColor="var(--redpen)"
        size={18}
      />
      <span className={state === "learning" ? "text-ink" : "text-ink-2"}>{label}</span>
    </span>
  );
}

/** The 受験票 admission ticket that starts a mock test. Tearing the stub begins it. */
export function ExamTicket({ children, stub, onTear }: { children: ReactNode; stub: ReactNode; onTear: () => void }) {
  return (
    <TearTicket
      stub={stub}
      onTear={onTear}
      width={340}
      height={168}
      stubSize={92}
      radius={6}
      background="var(--paper-raised)"
      color="var(--ink)"
      border
      borderColor="var(--edge)"
      stubBackground="var(--grid)"
      tilt={false}
      ariaLabel="Admission ticket. Tear the stub to start the test"
    >
      {children}
    </TearTicket>
  );
}

/** A collectible stamp: the seal on the front, where and when it was earned on the back. */
export function StampCard({ front, back, label }: { front: ReactNode; back: ReactNode; label: string }) {
  const face = "h-full rounded-[6px] border border-edge";
  return (
    <FlipCard
      front={<div className={face}>{front}</div>}
      back={<div className={face}>{back}</div>}
      width={168}
      height={208}
      radius={6}
      background="var(--paper-raised)"
      color="var(--ink)"
      glare={false}
      tiltMax={6}
      shadow={false}
      ariaLabel={label}
    />
  );
}

/** Flick through a batch of new words before studying it. */
export function WordStack({ cards, onChange }: { cards: ReactNode[]; onChange?: (index: number) => void }) {
  return <Stack cards={cards} layout="deck" visible={3} spread={0.35} depth={0.4} radius={6} shadow={false} tilt={12} onChange={onChange} />;
}

/** Onboarding: level, exam date, daily goal. */
export function SetupStepper(props: Omit<ComponentProps<typeof Stepper>, "theme" | "frame">) {
  return (
    <Stepper
      frame={false}
      theme="light"
      radius={8}
      indicator="bars"
      style={
        {
          "--stepper-ink": "var(--ink)",
          "--stepper-muted": "var(--ink-2)",
          "--stepper-faint": "var(--edge)",
          "--stepper-track": "var(--grid)",
          "--stepper-solid": "var(--ink)",
          "--stepper-solid-ink": "var(--paper)",
          "--stepper-tile": "var(--paper-raised)",
          "--stepper-tile-edge": "var(--edge)",
          "--stepper-well": "var(--grid)",
          "--stepper-hover-fill": "var(--grid)",
        } as CSSProperties
      }
      {...props}
    />
  );
}
