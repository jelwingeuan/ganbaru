export type Level = "N5" | "N4" | "N3" | "N2" | "N1";

export const BELTS: Record<Level, { kanji: string; name: string; className: string }> = {
  N5: { kanji: "白", name: "White belt", className: "bg-belt-n5 text-[#1b2a47] border-edge" },
  N4: { kanji: "黄", name: "Yellow belt", className: "bg-belt-n4 text-[#3d2e00] border-transparent" },
  N3: { kanji: "緑", name: "Green belt", className: "bg-belt-n3 text-white border-transparent" },
  N2: { kanji: "茶", name: "Brown belt", className: "bg-belt-n2 text-white border-transparent" },
  N1: { kanji: "黒", name: "Black belt", className: "bg-belt-n1 text-white border-transparent" },
};

export function Belt({ level, className = "" }: { level: Level; className?: string }) {
  const belt = BELTS[level];
  return (
    <span
      title={belt.name}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${belt.className} ${className}`}
    >
      {level} <span lang="ja" className="font-jp">{belt.kanji}</span>
    </span>
  );
}
