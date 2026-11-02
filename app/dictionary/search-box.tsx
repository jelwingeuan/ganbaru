"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
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
      <label htmlFor="dictionary-q" className="mb-2 block text-sm font-medium">
        Search Japanese, romaji, or English
      </label>
      <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-edge bg-paper-raised px-4 shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
        <Search size={21} aria-hidden className="shrink-0 text-ink-2" />
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
          className="font-jp min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink-2/70"
        />
        <kbd className="hidden rounded border border-edge px-1.5 text-xs text-ink-2 sm:inline">/</kbd>
      </div>
      <p className="mt-2 text-sm text-ink-2">Add a tag such as #n5 or #verb to narrow your search.</p>
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">Match</p>
        <div className="overflow-x-auto pb-1">
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
      </div>
    </form>
  );
}
