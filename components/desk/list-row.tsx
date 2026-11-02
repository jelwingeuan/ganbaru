import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** One row in a ruled list: 56px tall at least, with a chevron so it reads as a way in. */
export function ListRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="pressable flex min-h-14 items-center gap-3 px-2 py-3 hover:bg-grid">
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">{children}</span>
      <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-2" />
    </Link>
  );
}
