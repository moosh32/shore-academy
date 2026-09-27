import { NextResponse } from "next/server";
import { QUIZ_LESSON_ID, gradeAnswers, isQuizOpen, questionFeedback } from "@/lib/course";
import { PASS_THRESHOLD } from "@/lib/content";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/http";
import { loadRecords } from "@/lib/progress-store";

type Params = { params: Promise<{ moduleId: string }> };

export async function POST(request: Request, context: Params) {
  const session = await requireUser();
  if (!session) return jsonError("צריך להתחבר.", 401);

  const { moduleId: raw } = await context.params;
  const moduleId = Number(raw);
  if (!Number.isInteger(moduleId)) return jsonError("מודול לא תקין.", 404);

  const records = await loadRecords(session.id);
  if (!isQuizOpen(moduleId, records)) {
    return jsonError("המבחן עדיין נעול. מסיימים את שיעורי המודול קודם.", 403);
  }

  const body = (await request.json().catch(() => null)) as
    | { mode?: string; questionId?: string; optionId?: string; answers?: Record<string, string> }
    | null;

  if (body?.mode === "check") {
    if (!body.questionId || !body.optionId) return jsonError("חסרה תשובה.");
    const feedback = questionFeedback(moduleId, body.questionId, body.optionId);
    if (!feedback) return jsonError("שאלה לא נמצאה.", 404);
    return NextResponse.json(feedback);
  }

  if (!body?.answers || typeof body.answers !== "object") {
    return jsonError("חסרות תשובות.");
  }

  const graded = gradeAnswers(moduleId, body.answers);
  if (!graded) return jsonError("אין מבחן למודול הזה.", 404);

  const existing = await prisma.progress.findUnique({
    where: {
      userId_moduleId_lessonId: {
        userId: session.id,
        moduleId,
        lessonId: QUIZ_LESSON_ID,
      },
    },
  });
  const best = Math.max(existing?.quizScore ?? 0, graded.score);

  await prisma.progress.upsert({
    where: {
      userId_moduleId_lessonId: {
        userId: session.id,
        moduleId,
        lessonId: QUIZ_LESSON_ID,
      },
    },
    update: { quizScore: best, completed: best >= PASS_THRESHOLD },
    create: {
      userId: session.id,
      moduleId,
      lessonId: QUIZ_LESSON_ID,
      quizScore: best,
      completed: best >= PASS_THRESHOLD,
    },
  });

  return NextResponse.json({
    score: graded.score,
    passed: graded.passed,
    best,
    correctCount: graded.correctCount,
    total: graded.total,
    results: graded.results,
  });
}
