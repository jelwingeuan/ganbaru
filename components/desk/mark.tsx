"use client";

import { useMemo } from "react";

// Hanamaru (花丸): a spiral wrapped in eight petal loops, drawn in one red-pen stroke.
function hanamaruPath() {
  const c = 40;
  const pts: [number, number][] = [];
  for (let t = 0; t <= 13.8; t += 0.12) {
    const r = 3 + t;
    pts.push([c + r * Math.cos(t), c + r * Math.sin(t)]);
  }
  for (let t = 1.24; t <= 1.24 + Math.PI * 2 + 0.02; t += 0.03) {
    pts.push([c + 24 * Math.cos(t) + 7 * Math.cos(7 * t), c + 24 * Math.sin(t) - 7 * Math.sin(7 * t)]);
  }
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
}

const CROSS = "M20 20 L60 60 M60 20 L20 60";

export function Mark({ correct, size = 72, className = "" }: { correct: boolean; size?: number; className?: string }) {
  const d = useMemo(() => (correct ? hanamaruPath() : CROSS), [correct]);

  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} aria-hidden="true">
      <path
        d={d}
        fill="none"
        style={{ stroke: "var(--redpen)" }}
        strokeWidth={correct ? 2.4 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
