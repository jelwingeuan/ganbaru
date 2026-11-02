"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
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
  const sticky = inExam(path) ? "" : `material sticky top-0 z-20 border-b ${scrolled ? "border-edge" : "border-transparent"}`;
  return (
    <header className={`-mx-4 flex items-center justify-between gap-3 px-4 py-4 sm:-mx-8 sm:px-8 ${sticky}`}>
      <Link href="/" className="text-lg font-medium">
        Ganbaru{" "}
        <span lang="ja" className="font-jp text-ink-2">
          頑張る
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {NAV.slice(1).map((n) => {
            const on = isActive(path, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-10 items-center rounded-lg px-3 text-sm hover:bg-grid ${on ? "font-medium text-ink" : "text-ink-2"}`}
              >
                {n.label}
                {on && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                    aria-hidden
                    className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-ink"
                  />
                )}
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
      className="material fixed inset-x-0 bottom-0 z-20 border-t border-edge pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const on = isActive(path, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`pressable flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${on ? "font-medium text-ink" : "text-ink-2"}`}
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
