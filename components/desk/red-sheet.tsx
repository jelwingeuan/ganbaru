"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/*
  The red sheet (赤シート). In light mode it multiplies a pure red over the paper, so
  check-pen orange answers vanish while blue-black ink stays readable, as a real
  sheet does. On the night desk multiply can't hide light text, so the sheet is a
  translucent tint and elements marked data-answer fade out underneath it.

  It slides like a real sheet: grab it, it follows 1:1, a flick throws it off.
*/

// Apple's momentum projection: where a flick at v px/s comes to rest.
const project = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);
// Resist past the edge instead of stopping dead.
const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

export function RedSheet({
  covered,
  onPeek,
  children,
  label = "Red sheet. Slide it off to see the answer",
}: {
  covered: boolean;
  onPeek: () => void;
  children: ReactNode;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ offset: number; moved: boolean; hist: { x: number; t: number }[] } | null>(null);
  const dragged = useRef(false);
  const width = () => (box.current?.offsetWidth ?? 300) * 1.01;

  useEffect(() => {
    if (reduce) {
      x.set(0);
      animate(opacity, covered ? 1 : 0, { duration: 0.15 });
    } else {
      opacity.set(1);
      animate(x, covered ? 0 : width(), { type: "spring", bounce: 0, duration: 0.35 });
    }
  }, [covered, reduce, x, opacity]);

  return (
    <div ref={box} data-sheet={covered ? "covered" : "open"} className="relative overflow-hidden rounded-[var(--radius-paper)]">
      {children}
      <motion.div
        role="button"
        tabIndex={covered ? 0 : -1}
        aria-label={label}
        aria-hidden={!covered}
        style={{ x, opacity }}
        onPointerDown={(e) => {
          if (!covered || reduce) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          x.stop();
          drag.current = { offset: e.clientX - x.get(), moved: false, hist: [{ x: e.clientX, t: e.timeStamp }] };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const raw = e.clientX - d.offset;
          if (!d.moved && Math.abs(e.clientX - d.hist[0].x) < 10) return;
          d.moved = true;
          x.set(raw < 0 ? rubberband(raw, width()) : raw);
          d.hist = [...d.hist.slice(-4), { x: e.clientX, t: e.timeStamp }];
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          dragged.current = !!d?.moved;
          if (!d?.moved) return;
          const first = d.hist[0], last = d.hist[d.hist.length - 1];
          const v = last.t > first.t ? ((last.x - first.x) / (last.t - first.t)) * 1000 : 0;
          const open = x.get() + project(v) > width() / 2;
          animate(x, open ? width() : 0, { type: "spring", bounce: 0.2, duration: 0.3, velocity: v });
          if (open) onPeek();
        }}
        onClick={() => {
          if (!dragged.current) onPeek();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPeek();
          }
        }}
        className={[
          "absolute inset-0 touch-pan-y bg-[#f00000] mix-blend-multiply select-none",
          "dark:bg-redpen/55 dark:mix-blend-normal",
          covered ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
        ].join(" ")}
      />
    </div>
  );
}
