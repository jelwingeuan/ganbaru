export default function GrammarLayout({ children }: LayoutProps<"/grammar">) {
  return (
    <div className="max-w-6xl">
      <main>{children}</main>
      <footer className="mt-20 max-w-[44rem] border-t border-edge pt-5 text-xs leading-relaxed text-ink-2">
        <p>
          Grammar points from <a className="underline" href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a> (
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>). Levels follow
          common JLPT study materials; the JLPT publishes no official grammar list.
        </p>
      </footer>
    </div>
  );
}
