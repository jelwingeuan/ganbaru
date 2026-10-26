"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ModeSegment } from "@/components/desk/bits";
import type { Mode } from "@/lib/dictionary";

const MODE_ITEMS: { value: Mode; label: string }[] = [
  { value: "exact", label: "Exact" },
  { value: "starts", label: "Starts with" },
  { value: "contains", label: "Contains" },
  { value: "ends", label: "Ends with" },
];

export function SearchBox({ query, mode: initialMode }: { query: string; mode: Mode }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mode, setMode] = useState(initialMode);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function go(q: string, m: Mode) {
    clearTimeout(timer.current);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (m !== "starts") params.set("mode", m);
    startTransition(() => router.replace(params.size ? `/dictionary?${params}` : "/dictionary", { scroll: false }));
  }

  // "/" jumps to the search field from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go(inputRef.current?.value ?? "", mode);
      }}
    >
      <label htmlFor="dictionary-q" className="mb-2 block text-sm text-ink-2">
        Search in Japanese, romaji or English. Add tags like #n5 or #verb.
      </label>
      <div className="flex h-12 items-center rounded-lg border border-ink bg-paper-raised px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
        <input
          ref={inputRef}
          id="dictionary-q"
          type="search"
          lang="ja"
          defaultValue={query}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="食べる, taberu, eat"
          onChange={(e) => {
            const q = e.target.value;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => go(q, mode), 120);
          }}
          className="font-jp min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink-2/70 [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="ml-2 hidden rounded border border-edge px-1.5 text-xs text-ink-2 sm:inline">/</kbd>
      </div>
      <div className="mt-3">
        <ModeSegment
          items={MODE_ITEMS}
          value={mode}
          onChange={(v) => {
            setMode(v as Mode);
            go(inputRef.current?.value ?? "", v as Mode);
          }}
          aria-label="Match"
        />
      </div>
    </form>
  );
}
