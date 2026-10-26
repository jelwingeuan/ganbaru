import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 py-6">
      <Link href="/" className="text-lg font-medium">
        Ganbaru <span lang="ja" className="font-jp text-ink-2">頑張る</span>
      </Link>
      <nav aria-label="Main" className="flex items-center gap-4">
        <Link href="/test" className="text-sm underline underline-offset-4 hover:text-ink-2">
          Tests
        </Link>
        <Link href="/grammar" className="text-sm underline underline-offset-4 hover:text-ink-2">
          Grammar
        </Link>
        <Link href="/dictionary" className="text-sm underline underline-offset-4 hover:text-ink-2">
          Dictionary
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
