import { NextResponse } from "next/server";
import { QUIZ_LESSON_ID, isLessonOpen } from "@/lib/course";
import { getLesson } from "@/lib/content";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/http";
import { loadRecords } from "@/lib/progress-store";
import { firstError, lessonSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) return jsonError("צריך להתחבר.", 401);

  const body = await request.json().catch(() => null);
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstError(parsed.error));

  const lesson = getLesson(parsed.data.lessonId);
  if (!lesson || lesson.status !== "ready") {
    return jsonError("השיעור לא זמין להשלמה.", 404);
  }

  const records = await loadRecords(session.id);
  if (!isLessonOpen(lesson.id, records)) {
    return jsonError("השיעור עדיין נעול.", 403);
  }

  await prisma.progress.upsert({
    where: {
      userId_moduleId_lessonId: {
        userId: session.id,
        moduleId: lesson.moduleId,
        lessonId: lesson.id,
      },
    },
    update: { completed: true },
    create: {
      userId: session.id,
      moduleId: lesson.moduleId,
      lessonId: lesson.id,
      completed: true,
    },
  });

  return NextResponse.json({ ok: true, lessonId: lesson.id, quizRow: QUIZ_LESSON_ID });
}
