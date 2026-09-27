import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LessonActions } from "@/components/lesson-actions";
import { getSession } from "@/lib/auth";
import { isLessonOpen, isModuleUnlocked } from "@/lib/course";
import { getLesson, getModule } from "@/lib/content";
import { loadRecords } from "@/lib/progress-store";
import { getTool } from "@/lib/tools";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const mod = getModule(lesson.moduleId);
  if (!mod) notFound();

  const records = await loadRecords(session.id);
  const unlocked = isModuleUnlocked(mod.id, records);
  const open = isLessonOpen(lesson.id, records);
  const completed = records.some((row) => row.lessonId === lesson.id && row.completed);
  const index = mod.lessons.findIndex((item) => item.id === lesson.id);
  const next = mod.lessons[index + 1];
  const nextHref = next ? `/app/lessons/${next.id}` : mod.quiz ? `/app/quiz/${mod.id}` : `/app/modules/${mod.id}`;
  const nextLabel = next ? "לשיעור הבא" : mod.quiz ? "אל המבחן" : "חזרה למודול";
  const tool = lesson.toolId ? getTool(lesson.toolId) : null;

  return (
    <article>
      <p className="text-muted-foreground mb-4 text-sm">
        <Link href={`/app/modules/${mod.id}`} className="underline underline-offset-4">
          מודול {mod.id}: {mod.title}
        </Link>
      </p>
      <p className="text-primary text-sm">
        שיעור {index + 1}
        {lesson.minutes ? ` · ${lesson.minutes} דקות` : ""}
      </p>
      <h1 className="mt-1 text-3xl leading-tight font-medium">{lesson.title}</h1>

      {!unlocked ? (
        <p className="mt-6 text-sm leading-7">
          השיעור נעול. קודם עוברים את המבחן של המודול הקודם.
        </p>
      ) : lesson.status === "skeleton" ? (
        <p className="mt-6 text-sm leading-7">
          הטקסט המלא של השיעור הזה עדיין לא עלה. הכותרת כאן כדי שמבנה המסלול יהיה גלוי. אי אפשר לסמן אותו כהושלם, והמודול הבא נשאר נעול.
        </p>
      ) : !open ? (
        <p className="mt-6 text-sm leading-7">השיעור ייפתח אחרי שתסיימו את השיעור הקודם.</p>
      ) : (
        <>
          <div className="mt-6 space-y-4 text-base leading-8">
            {lesson.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {lesson.points ? (
            <ul className="mt-5 list-disc space-y-2 pe-5 text-sm leading-7">
              {lesson.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          {lesson.example ? (
            <aside className="border-primary mt-6 border-s-2 ps-4">
              <h2 className="text-lg font-medium">{lesson.example.title}</h2>
              <div className="mt-2 space-y-1 text-sm leading-7">
                {lesson.example.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-6">{lesson.example.note}</p>
            </aside>
          ) : null}
          {lesson.takeaway ? (
            <p className="bg-muted mt-6 rounded-xl px-4 py-3 text-sm leading-7">{lesson.takeaway}</p>
          ) : null}
          {tool ? (
            <p className="mt-4 text-sm">
              <Link href={`/app/lab/${tool.id}`} className="text-primary underline underline-offset-4">
                אל המחשבון: {tool.title}
              </Link>
            </p>
          ) : null}
          {lesson.link ? (
            <p className="mt-4 text-sm">
              <Link href={lesson.link.href} className="text-primary underline underline-offset-4">
                {lesson.link.label}
              </Link>
            </p>
          ) : null}
          <LessonActions
            lessonId={lesson.id}
            completed={completed}
            nextHref={nextHref}
            nextLabel={nextLabel}
          />
        </>
      )}
    </article>
  );
}
