import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExamPlayer } from "@/components/test/exam-player";
import { BLUEPRINTS } from "@/content/blueprints";
import { levelFromParam, passageById, questionById, testById, tests } from "@/lib/content";

export async function generateStaticParams() {
  return tests.map((t) => ({ level: t.level.toLowerCase(), test: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/test/[level]/full/[test]">): Promise<Metadata> {
  const t = testById((await params).test);
  return { title: t?.title ?? "Test not found" };
}

export default function FullTestPage({ params }: PageProps<"/test/[level]/full/[test]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      {params.then(({ level, test }) => (
        <Exam param={level} id={test} />
      ))}
    </Suspense>
  );
}

function Exam({ param, id }: { param: string; id: string }) {
  const level = levelFromParam(param);
  const test = testById(id);
  if (!level || !test || test.level !== level) notFound();
  const blueprint = BLUEPRINTS[level].sections;
  const hubHref = `/test/${level.toLowerCase()}`;

  const sections = test.sections.map((s) => {
    const bp = blueprint.find((b) => b.id === s.id)!;
    return {
      id: s.id,
      title: bp.title,
      minutes: bp.minutes,
      questions: s.questionIds.map((qid) => {
        const q = questionById.get(qid)!;
        return {
          id: q.id, type: q.type, stem: q.stem, options: q.options, answer: q.answer,
          explanation: q.explanation, translation: q.translation, passageId: q.passageId, source: q.source,
        };
      }),
    };
  });
  const passages = Object.fromEntries(
    sections
      .flatMap((s) => s.questions.map((q) => q.passageId))
      .filter((pid): pid is string => Boolean(pid))
      .map((pid) => {
        const p = passageById.get(pid)!;
        return [pid, { text: p.text, translation: p.translation }];
      }),
  );

  return (
    <>
      <Link href={hubHref} className="text-sm text-ink-2 underline underline-offset-4">
        {level} tests
      </Link>
      <div className="mt-4">
        <ExamPlayer key={test.id} level={level} testId={test.id} title={test.title} note={test.note} sections={sections} passages={passages} hubHref={hubHref} />
      </div>
    </>
  );
}
