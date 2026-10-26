import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, BIZ_UDPGothic, Klee_One } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Japanese fonts ship as unicode-range slices, so there is no subset to preload.
const biz = BIZ_UDPGothic({
  variable: "--font-biz",
  weight: ["400", "700"],
  preload: false,
});

const klee = Klee_One({
  variable: "--font-klee",
  weight: "600",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "Ganbaru", template: "%s · Ganbaru" },
  description: "Study for the JLPT with spaced repetition, a red-sheet study card, grammar, quizzes and mock tests.",
};

// Runs before paint so the saved or system theme never flashes.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${atkinson.variable} ${biz.variable} ${klee.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
