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
    <>
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

      <h1 className="mt-6 text-3xl font-medium">{level} practice</h1>
      <p className="mt-2 text-ink-2">
        The real {level} test has {bp.sections.length} timed sections, {bp.sections.reduce((m, s) => m + s.minutes, 0)} minutes in
        all. You need {bp.passMark} of 180 and a minimum in every scored section to pass.
      </p>

      <div className="mt-8">
        <HubTabs
          initial={testsFor(level).length ? "full" : "skill"}
          panels={{
            full: <FullTestPanel level={level} />,
            mini: (
              <p className="text-ink-2">
                Mini tests are short timed mixes of every section. They arrive together with the full tests.
              </p>
            ),
            skill: (
              <div className="space-y-8">
                <p className="text-ink-2">Ten questions per set, with the answer and explanation after each one.</p>
                {types.map((type) => (
                  <section key={type} aria-labelledby={`type-${type}`}>
                    <h2 id={`type-${type}`} className="text-lg font-medium">
                      <span lang="ja" className="font-jp">
                        {QUESTION_TYPES[type].ja}
                      </span>{" "}
                      {QUESTION_TYPES[type].en}
                    </h2>
                    <p className="mb-3 text-sm text-ink-2">{INSTRUCTIONS[type]}</p>
                    <DrillGrid
                      level={level}
                      href={`/test/${level.toLowerCase()}/drill`}
                      sets={sets.filter((s) => s.type === type).map((s) => ({ id: s.id, number: s.number, size: s.questionIds.length }))}
                    />
                  </section>
                ))}
                <p className="text-sm text-ink-2">
                  Word-in-context, grammar, reading and listening drills are added as each question is checked.
                </p>
              </div>
            ),
          }}
        />
      </div>
    </>
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
      <p className="mt-8 text-ink-2">Every mock test follows the real {level} test:</p>
      <ol className="mt-4 space-y-5">
        {bp.sections.map((s) => (
          <li key={s.id} className="rounded-lg border border-edge bg-paper-raised p-4">
            <p className="font-medium">
              <span lang="ja" className="font-jp">
                {s.title}
              </span>
              <span className="ml-2 text-sm font-normal text-ink-2 tabular-nums">{s.minutes} min</span>
            </p>
            <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {s.parts.map((p) => (
                <li key={p.type} className="flex justify-between gap-3">
                  <span>
                    <span lang="ja" className="font-jp">
                      {QUESTION_TYPES[p.type].ja}
                    </span>{" "}
                    <span className="text-ink-2">{QUESTION_TYPES[p.type].en}</span>
                  </span>
                  <span className="tabular-nums text-ink-2">{p.count}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
