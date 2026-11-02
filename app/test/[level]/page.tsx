import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Belt } from "@/components/desk/belt";
import { DrillGrid, HubTabs, TestList } from "@/components/test/hub";
import { BLUEPRINTS, INSTRUCTIONS, QUESTION_TYPES } from "@/content/blueprints";
import { drillSets, levelFromParam, testsFor } from "@/lib/content";
import { LEVELS, type Level } from "@/lib/openjlpt";

export async function generateStaticParams() {
  return LEVELS.map((l) => ({ level: l.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/test/[level]">): Promise<Metadata> {
  const level = levelFromParam((await params).level);
  return { title: level ? `${level} practice` : "Level not found" };
}

export default function LevelHubPage({ params }: PageProps<"/test/[level]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      {params.then(({ level }) => (
        <Hub param={level} />
      ))}
    </Suspense>
  );
}

function Hub({ param }: { param: string }) {
  const level = levelFromParam(param);
  if (!level) notFound();
  const bp = BLUEPRINTS[level];
  const sets = drillSets(level);
  const types = [...new Set(sets.map((s) => s.type))];

  return (
    <div className="pt-6 sm:pt-9">
      <nav aria-label="Levels" className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Link
            key={l}
            href={`/test/${l.toLowerCase()}`}
            aria-current={l === level ? "page" : undefined}
            className="rounded-full outline-offset-2 aria-[current=page]:outline-2 aria-[current=page]:outline-ink"
          >
            <Belt level={l} />
          </Link>
        ))}
      </nav>

      <div className="mt-8 max-w-[44rem]">
        <p className="text-xs font-semibold tracking-[0.16em] text-redpen-ink uppercase">Tests / {level}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{level} practice</h1>
        <p className="mt-3 text-ink-2">
          Choose a timed mock test or work on one skill at a time. The {level} exam has {bp.sections.length} timed sections and takes {bp.sections.reduce((m, s) => m + s.minutes, 0)} minutes.
        </p>
      </div>

      <div className="mt-9 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div className="min-w-0">
          <HubTabs
            initial={testsFor(level).length ? "full" : "skill"}
            panels={{
              full: <FullTestPanel level={level} />,
              skill: (
                <div className="space-y-4">
                  <p className="max-w-[44rem] text-sm text-ink-2">Ten questions per set, with the answer and explanation after each one.</p>
                  {types.map((type) => (
                    <section key={type} aria-labelledby={`type-${type}`} className="rounded-2xl border border-edge bg-paper-raised p-5">
                      <h2 id={`type-${type}`} className="text-lg font-semibold">
                        <span lang="ja" className="font-jp">{QUESTION_TYPES[type].ja}</span>{" "}
                        {QUESTION_TYPES[type].en}
                      </h2>
                      <p className="mt-1 mb-4 text-sm text-ink-2">{INSTRUCTIONS[type]}</p>
                      <DrillGrid
                        level={level}
                        href={`/test/${level.toLowerCase()}/drill`}
                        sets={sets.filter((s) => s.type === type).map((s) => ({ id: s.id, number: s.number, size: s.questionIds.length }))}
                      />
                    </section>
                  ))}
                  <p className="text-sm text-ink-2">More skill drills are added as questions are checked.</p>
                </div>
              ),
            }}
          />
        </div>
        <aside aria-label={`${level} exam structure`} className="rounded-2xl border border-edge bg-paper-raised p-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold tracking-[0.14em] text-redpen-ink uppercase">At a glance</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{bp.passMark}<span className="text-sm font-normal text-ink-2"> / 180 to pass</span></p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">Each scored section also has a minimum.</p>
          <ol className="mt-5 space-y-4 border-t border-edge pt-4">
            {bp.sections.map((s, i) => (
              <li key={s.id}>
                <p className="flex items-baseline justify-between gap-2 text-sm font-medium"><span>{i + 1}. <span lang="ja" className="font-jp">{s.title}</span></span><span className="shrink-0 text-xs font-normal text-ink-2 tabular-nums">{s.minutes} min</span></p>
                <p className="mt-1 text-xs text-ink-2">{s.parts.reduce((n, p) => n + p.count, 0)} questions</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function FullTestPanel({ level }: { level: Level }) {
  const bp = BLUEPRINTS[level];
  const list = testsFor(level).map((t) => ({
    id: t.id,
    title: t.title,
    href: `/test/${level.toLowerCase()}/full/${t.id}`,
    questions: t.sections.reduce((n, s) => n + s.questionIds.length, 0),
    minutes: t.sections.reduce((n, s) => n + (bp.sections.find((b) => b.id === s.id)?.minutes ?? 0), 0),
    note: t.note,
  }));
  return (
    <>
      {list.length > 0 ? <TestList tests={list} /> : <p className="text-ink-2">Full {level} mock tests are being written and checked.</p>}
      <p className="mt-5 max-w-[44rem] text-sm leading-relaxed text-ink-2">Mock tests use the {level} section timings. Scores are practice estimates, and answers appear after the test.</p>
    </>
  );
}
