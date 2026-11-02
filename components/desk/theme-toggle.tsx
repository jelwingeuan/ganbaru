"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !dark;
    const root = document.documentElement;
    // Swap the desk in one frame instead of letting every color transition,
    // and cross-fade the whole page where the browser supports it.
    const swap = () => {
      root.classList.add("theme-switching");
      root.classList.toggle("dark", next);
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
    };
    if (document.startViewTransition) document.startViewTransition(swap);
    else swap();
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="pressable h-11 rounded-lg border border-edge bg-paper-raised px-3 text-sm text-ink hover:bg-grid"
    >
      {dark ? "Use day desk" : "Use night desk"}
    </button>
  );
}
