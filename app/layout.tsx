import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, BIZ_UDPGothic, Klee_One } from "next/font/google";
import { SiteHeader, TabBar } from "@/components/desk/site-header";
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
  description: "Prepare for the JLPT with timed mock tests, focused drills, grammar explanations and a Japanese dictionary.",
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
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="sr-only fixed top-2 left-2 z-50 rounded-lg bg-ink px-4 py-2 text-paper focus:not-sr-only">
          Skip to content
        </a>
        <div className="mx-auto flex w-full max-w-[120rem] flex-1 flex-col px-4 pb-28 sm:px-6 sm:pb-10 lg:px-10">
          <SiteHeader />
          <div id="main-content" tabIndex={-1} className="w-full flex-1 outline-none">
            {children}
          </div>
        </div>
        <TabBar />
      </body>
    </html>
  );
}
