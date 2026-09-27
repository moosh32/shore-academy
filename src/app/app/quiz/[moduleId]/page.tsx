import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuizRunner } from "@/components/quiz-runner";
import { PageIntro } from "@/components/page-intro";
import { getSession } from "@/lib/auth";
import { isQuizOpen, quizScoreFor } from "@/lib/course";
import { PASS_THRESHOLD, getModule, publicQuiz } from "@/lib/content";
import { loadRecords } from "@/lib/progress-store";

export default async function QuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { moduleId: raw } = await params;
  const moduleId = Number(raw);
  const mod = getModule(moduleId);
  const questions = publicQuiz(moduleId);
  if (!mod || !questions) notFound();

  const records = await loadRecords(session.id);
  const open = isQuizOpen(moduleId, records);
  const next = getModule(moduleId + 1);

  return (
    <div>
      <p className="text-muted-foreground mb-4 text-sm">
        <Link href={`/app/modules/${mod.id}`} className="underline underline-offset-4">
          מודול {mod.id}
        </Link>
      </p>
      <PageIntro kicker="מבחן קצר" title={mod.title}>
        שאלה אחת בכל מסך. אחרי שליחה יש פידבק מיידי. סף המעבר: {Math.round(PASS_THRESHOLD * 100)}%.
      </PageIntro>
      {open ? (
        <QuizRunner
          moduleId={moduleId}
          questions={questions}
          bestScore={quizScoreFor(records, moduleId)}
          nextHref={next ? `/app/modules/${next.id}` : null}
        />
      ) : (
        <p className="text-sm leading-7">
          המבחן נעול. מסיימים קודם את כל השיעורים במודול, והמודול עצמו צריך להיות פתוח.
        </p>
      )}
    </div>
  );
}
