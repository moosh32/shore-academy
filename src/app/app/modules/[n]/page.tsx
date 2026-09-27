import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import {
  isLessonOpen,
  isModuleUnlocked,
  isQuizOpen,
  quizScoreFor,
} from "@/lib/course";
import { PASS_THRESHOLD, getModule } from "@/lib/content";
import { loadRecords } from "@/lib/progress-store";

export default async function ModulePage({ params }: { params: Promise<{ n: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { n } = await params;
  const moduleId = Number(n);
  const mod = getModule(moduleId);
  if (!mod) notFound();

  const records = await loadRecords(session.id);
  const unlocked = isModuleUnlocked(mod.id, records);
  const score = quizScoreFor(records, mod.id);
  const quizReady = isQuizOpen(mod.id, records);

  return (
    <div>
      <p className="text-muted-foreground mb-4 text-sm">
        <Link href="/app" className="underline underline-offset-4">
          לוח
        </Link>
      </p>
      <PageIntro kicker={`מודול ${mod.id}`} title={mod.title}>
        {mod.summary}
      </PageIntro>

      {!unlocked ? (
        <div className="mb-6 flex gap-3 rounded-xl bg-muted px-4 py-3 text-sm leading-6">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>המודול נעול עד מעבר המבחן של המודול הקודם, בציון של {Math.round(PASS_THRESHOLD * 100)}%.</p>
        </div>
      ) : null}

      <ol className="space-y-2">
        {mod.lessons.map((lesson, index) => {
          const done = records.some((row) => row.lessonId === lesson.id && row.completed);
          const open = unlocked && (lesson.status === "skeleton" ? true : isLessonOpen(lesson.id, records));
          const state = !unlocked ? "נעול" : done ? "הושלם" : lesson.status === "skeleton" ? "שלד" : open ? "פתוח" : "ממתין לשיעור הקודם";
          const body = (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs tabular-nums" dir="ltr">
                  {index + 1}
                  {lesson.minutes ? ` · ${lesson.minutes} דק׳` : ""}
                </p>
                <h2 className="mt-1 text-base font-medium">{lesson.title}</h2>
              </div>
              <Badge variant="outline">{state}</Badge>
            </div>
          );
          if (!open || !unlocked) {
            return (
              <li key={lesson.id} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
                {body}
              </li>
            );
          }
          return (
            <li key={lesson.id}>
              <Link href={`/app/lessons/${lesson.id}`} className="block rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
                {body}
              </Link>
            </li>
          );
        })}
      </ol>

      <section className="mt-6 rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10">
        <h2 className="text-base font-medium">מבחן המודול</h2>
        {!mod.quiz ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            אין עדיין מבחן. המודול הזה הוא שלד, והבא אחריו נשאר נעול.
          </p>
        ) : !unlocked ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">המבחן נעול יחד עם המודול.</p>
        ) : !quizReady ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            המבחן נפתח אחרי שכל שיעורי המודול מסומנים כהושלמו.
          </p>
        ) : (
          <div className="mt-3">
            {score != null ? (
              <p className="text-muted-foreground mb-3 text-sm">
                הציון הגבוה: {Math.round(score * 100)}%.
              </p>
            ) : null}
            <Link href={`/app/quiz/${mod.id}`} className="text-primary text-sm underline underline-offset-4">
              {score != null && score >= PASS_THRESHOLD ? "לצפות במבחן שוב" : "אל המבחן"}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
