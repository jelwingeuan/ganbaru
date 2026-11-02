"use client";

import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/*
  The red sheet (赤シート). In light mode it multiplies a pure red over the paper, so
  check-pen orange answers vanish while blue-black ink stays readable, as a real
  sheet does. On the night desk multiply can't hide light text, so the sheet is a
  translucent tint and elements marked data-answer hide underneath it.

  It slides like a real sheet: grab it, it follows 1:1, a flick throws it off.
  Keyboard peeks and covering the next card are instant: they happen 100+ times a session.
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
  const box = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const touched = useRef<{ bounce: number } | null>(null);
  const drag = useRef<{ offset: number; moved: boolean; hist: { x: number; t: number }[] } | null>(null);
  const dragged = useRef(false);
  const width = () => (box.current?.offsetWidth ?? 300) * 1.01;
  // Motion 12 runs x/y shorthands on the main thread, so position is a full transform string.
  const at = () => (sheet.current ? new DOMMatrix(getComputedStyle(sheet.current).transform).m41 : 0);
  const place = (x: number) => {
    anim.current?.stop();
    if (sheet.current) sheet.current.style.transform = `translateX(${x}px)`;
  };

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const to = covered ? 0 : width();
    const touch = touched.current;
    touched.current = null;
    if (reduce) {
      place(0);
      el.style.opacity = covered ? "1" : "0";
    } else if (touch && !covered) {
      anim.current?.stop();
      anim.current = animate(el, { transform: `translateX(${to}px)` }, { type: "spring", bounce: touch.bounce, duration: 0.3 });
    } else {
      place(to);
    }
  }, [covered, reduce]);

  return (
    <div ref={box} data-sheet={covered ? "covered" : "open"} className="relative overflow-hidden rounded-[var(--radius-paper)]">
      {children}
      <div
        ref={sheet}
        role="button"
        tabIndex={covered ? 0 : -1}
        aria-label={label}
        aria-hidden={!covered}
        onPointerDown={(e) => {
          if (!covered || reduce) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const x = at();
          place(x);
          drag.current = { offset: e.clientX - x, moved: false, hist: [{ x: e.clientX, t: e.timeStamp }] };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (!d.moved && Math.abs(e.clientX - d.hist[0].x) < 10) return;
          d.moved = true;
          const raw = e.clientX - d.offset;
          place(raw < 0 ? rubberband(raw, width()) : raw);
          d.hist = [...d.hist.slice(-4), { x: e.clientX, t: e.timeStamp }];
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          dragged.current = !!d?.moved;
          if (!d?.moved) return;
          const first = d.hist[0], last = d.hist[d.hist.length - 1];
          const v = last.t > first.t ? ((last.x - first.x) / (last.t - first.t)) * 1000 : 0;
          const open = at() + project(v) > width() / 2;
          // Bounce only after a flick; a slow release settles flat.
          const bounce = Math.abs(v) > 500 ? 0.15 : 0;
          if (open) {
            touched.current = { bounce };
            onPeek();
          } else {
            anim.current = animate(sheet.current!, { transform: "translateX(0px)" }, { type: "spring", bounce, duration: 0.3 });
          }
        }}
        onClick={() => {
          if (dragged.current) return;
          touched.current = { bounce: 0 };
          onPeek();
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
