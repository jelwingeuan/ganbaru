"use client";

import type { ReactNode } from "react";

/*
  The red sheet (赤シート). In light mode it multiplies a pure red over the paper, so
  check-pen orange answers vanish while blue-black ink stays readable, as a real
  sheet does. On the night desk multiply can't hide light text, so the sheet is a
  translucent tint and elements marked data-answer fade out underneath it.
*/
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
  return (
    <div data-sheet={covered ? "covered" : "open"} className="relative overflow-hidden rounded-[var(--radius-paper)]">
      {children}
      <div
        role="button"
        tabIndex={covered ? 0 : -1}
        aria-label={label}
        aria-hidden={!covered}
        onClick={onPeek}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPeek();
          }
        }}
        className={[
          "absolute inset-0 bg-[#f00000] mix-blend-multiply",
          "dark:bg-redpen dark:mix-blend-normal dark:opacity-55",
          "transition-transform duration-[220ms] ease-[cubic-bezier(.3,.7,.2,1)]",
          covered ? "translate-x-0" : "pointer-events-none translate-x-[101%]",
        ].join(" ")}
      />
    </div>
  );
}
