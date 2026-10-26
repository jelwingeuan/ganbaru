import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DrillPlayer } from "@/components/test/drill-player";
import { INSTRUCTIONS, QUESTION_TYPES } from "@/content/blueprints";
import { drillSet, drillSets, levelFromParam, questionById } from "@/lib/content";
import { LEVELS } from "@/lib/openjlpt";

export async function generateStaticParams() {
  return LEVELS.flatMap((l) => drillSets(l).map((s) => ({ level: l.toLowerCase(), set: s.id })));
}

export async function generateMetadata({ params }: PageProps<"/test/[level]/drill/[set]">): Promise<Metadata> {
  const { level: param, set: id } = await params;
  const level = levelFromParam(param);
  const set = level && drillSet(level, id);
  return { title: set ? `${level} ${QUESTION_TYPES[set.type].en} set ${set.number}` : "Drill not found" };
}

export default function DrillPage({ params }: PageProps<"/test/[level]/drill/[set]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      {params.then(({ level, set }) => (
        <Drill param={level} id={set} />
      ))}
    </Suspense>
  );
}

function Drill({ param, id }: { param: string; id: string }) {
  const level = levelFromParam(param);
  const set = level && drillSet(level, id);
  if (!level || !set) notFound();
  const hubHref = `/test/${level.toLowerCase()}`;
  const sameType = drillSets(level).filter((s) => s.type === set.type);
  const next = sameType.find((s) => s.number === set.number + 1);
  const type = QUESTION_TYPES[set.type];

  return (
    <>
      <Link href={hubHref} className="text-sm text-ink-2 underline underline-offset-4">
        {level} drills
      </Link>
      <div className="mt-4">
        <DrillPlayer
          key={set.id}
          level={level}
          setId={set.id}
          title={`${type.ja} ${type.en} · Set ${set.number}`}
          instruction={INSTRUCTIONS[set.type] ?? ""}
          hubHref={hubHref}
          nextSetHref={next && `${hubHref}/drill/${next.id}`}
          questions={set.questionIds.map((qid) => {
            const q = questionById.get(qid)!;
            return { id: q.id, stem: q.stem, options: q.options, answer: q.answer, explanation: q.explanation, translation: q.translation };
          })}
        />
      </div>
    </>
  );
}
