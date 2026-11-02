// Interface regression check. The static half always runs. The browser half needs a running build and
// Playwright with @axe-core/playwright installed somewhere (no new project dependencies):
//   UX_URL=http://localhost:3200 UX_DEPS=/path/with/node_modules npm test
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : /\.(tsx|css)$/.test(e.name) ? [join(dir, e.name)] : [],
  );
const sources = ["app", "components"].flatMap(files).map((f) => ({ f, src: readFileSync(f, "utf8") }));

test("motion follows the house rules", () => {
  const bad = (re: RegExp) => sources.filter(({ src }) => re.test(src)).map(({ f }) => f);
  assert.deepEqual(bad(/transition-all|transition:\s*all\b|transition-property:\s*all/), [], "transition: all");
  assert.deepEqual(bad(/\bease-in(?!-out)\b|easeIn\b/), [], "ease-in");
  assert.deepEqual(bad(/scale\(0\)|\bscale-0\b|scale:\s*0[,}\s]/), [], "animating from scale(0)");
  // Anything that animates must also say what happens under reduced motion.
  const animates = sources.filter(({ src }) => /\banimate\(|@keyframes|\.animate\(\[/.test(src));
  assert.deepEqual(animates.filter(({ src }) => !/useReducedMotion|prefers-reduced-motion|reduceMotion|reduce\b/.test(src)).map(({ f }) => f), [], "no reduced-motion handling");
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /prefers-reduced-motion[\s\S]*::view-transition/, "reduced motion must cover view transitions");
  assert.match(css, /prefers-reduced-transparency/);
  assert.match(css, /prefers-contrast/);
});

const url = process.env.UX_URL;
test("exam player: zero axe violations and answer picks under 50ms", { skip: !url && "set UX_URL and UX_DEPS to run" }, async () => {
  const req = createRequire(join(process.env.UX_DEPS ?? process.cwd(), "package.json"));
  const { chromium } = req("playwright");
  const AxeBuilder = req("@axe-core/playwright").default;
  const browser = await chromium.launch();
  try {
    for (const viewport of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(`${url}/test/n5/full/n5-test-1`);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
      const ticket = await new AxeBuilder({ page }).withTags(tags).analyze();
      await page.getByRole("button", { name: /start without tearing/i }).click();
      await page.waitForSelector('[aria-label="Options"] button');
      const exam = await new AxeBuilder({ page }).withTags(tags).analyze();
      const ids = [...ticket.violations, ...exam.violations].map((v: { id: string }) => v.id);
      assert.deepEqual(ids, [], `axe at ${viewport.width}px`);

      // Interaction latency per answer pick, from the Event Timing API (what INP is built from).
      await page.evaluate(() => {
        const w = window as unknown as { picks: number[] };
        w.picks = [];
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEventTiming & { interactionId?: number })[]) if (e.interactionId && e.name === "pointerup") w.picks.push(e.duration);
        }).observe({ type: "event", durationThreshold: 16, buffered: true } as PerformanceObserverInit);
      });
      for (let i = 0; i < 10; i++) {
        await page.locator('[aria-label="Options"] button').nth(i % 3).click();
        await page.keyboard.press("ArrowRight");
      }
      await page.waitForTimeout(300);
      const picks: number[] = await page.evaluate(() => (window as unknown as { picks: number[] }).picks);
      const worst = Math.max(0, ...picks);
      assert.ok(worst < 50, `answer pick took ${worst}ms at ${viewport.width}px`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
});
