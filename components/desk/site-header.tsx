"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, House, Languages } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/test", label: "Tests", icon: ClipboardList },
  { href: "/grammar", label: "Grammar", icon: BookOpen },
  { href: "/dictionary", label: "Dictionary", icon: Languages },
];

const inExam = (path: string) => /^\/test\/[^/]+\/full\//.test(path);

const isActive = (path: string, href: string) =>
  href === "/" ? path === "/" : path.startsWith(href);

export function SiteHeader() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 0);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  // The exam has its own sticky timer bar, so the header scrolls away there.
  const sticky = inExam(path) ? "" : `material sticky top-0 z-30 border-b ${scrolled ? "border-edge" : "border-transparent"}`;
  return (
    <header className={`-mx-4 flex min-h-18 items-center justify-between gap-3 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 ${sticky}`}>
      <Link href="/" className="pressable inline-flex min-h-11 items-center gap-2.5 rounded-lg">
        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-redpen text-paper">
          <span className="font-study text-xl leading-none">頑</span>
        </span>
        <span className="flex flex-col justify-center leading-none">
          <span className="text-base font-bold tracking-[-0.02em]">Ganbaru</span>
          <span lang="ja" className="font-jp mt-1 text-[11px] tracking-[0.08em] text-ink-2">頑張る</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-edge bg-grid p-1 sm:flex">
          {NAV.slice(1).map((n) => {
            const on = isActive(path, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`pressable flex h-9 items-center rounded-full px-3 text-sm hover:text-ink ${on ? "bg-paper-raised font-medium text-ink shadow-sm" : "text-ink-2"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Phone navigation. Hidden in a full mock test so it can't pull people out mid-exam. */
export function TabBar() {
  const path = usePathname();
  if (inExam(path)) return null;
  return (
    <nav
      aria-label="Main"
      className="material fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-[1.25rem] border border-edge shadow-[var(--shadow-float)] sm:hidden"
    >
      <ul className="grid grid-cols-4 gap-1 p-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const on = isActive(path, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`pressable flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[0.9rem] text-[11px] ${on ? "bg-ink font-medium text-paper" : "text-ink-2 hover:bg-grid hover:text-ink"}`}
              >
                <Icon aria-hidden size={22} strokeWidth={on ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
