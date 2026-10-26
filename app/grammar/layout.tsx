import { SiteHeader } from "@/components/desk/site-header";

export default function GrammarLayout({ children }: LayoutProps<"/grammar">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-8">
      <SiteHeader />
      <main>{children}</main>
      <footer className="mt-16 border-t border-edge pt-4 text-xs text-ink-2">
        <p>
          Grammar points from <a className="underline" href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a> (
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>). Levels follow
          common JLPT study materials; the JLPT publishes no official grammar list.
        </p>
      </footer>
    </div>
  );
}
