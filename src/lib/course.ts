import {
  PASS_THRESHOLD,
  getLesson,
  getModule,
  getQuiz,
  modules,
  type Module,
} from "@/lib/content";

export type ProgressRecord = {
  moduleId: number;
  lessonId: string;
  completed: boolean;
  quizScore: number | null;
};

export const QUIZ_LESSON_ID = "";

export function quizScoreFor(records: ProgressRecord[], moduleId: number) {
  const row = records.find(
    (r) => r.moduleId === moduleId && r.lessonId === QUIZ_LESSON_ID,
  );
  return row?.quizScore ?? null;
}

export function isModuleUnlocked(moduleId: number, records: ProgressRecord[]) {
  if (moduleId <= 1) return true;
  const prev = quizScoreFor(records, moduleId - 1);
  return prev != null && prev >= PASS_THRESHOLD;
}

export function completedLessonIds(records: ProgressRecord[]) {
  return new Set(
    records.filter((r) => r.lessonId !== QUIZ_LESSON_ID && r.completed).map((r) => r.lessonId),
  );
}

export function isLessonOpen(lessonId: string, records: ProgressRecord[]) {
  const lesson = getLesson(lessonId);
  if (!lesson) return false;
  if (!isModuleUnlocked(lesson.moduleId, records)) return false;
  const mod = getModule(lesson.moduleId);
  if (!mod) return false;
  const index = mod.lessons.findIndex((l) => l.id === lessonId);
  if (index <= 0) return true;
  const prev = mod.lessons[index - 1];
  return records.some((r) => r.lessonId === prev.id && r.completed);
}

export function isQuizOpen(moduleId: number, records: ProgressRecord[]) {
  const mod = getModule(moduleId);
  if (!mod?.quiz?.length) return false;
  if (!isModuleUnlocked(moduleId, records)) return false;
  const ready = mod.lessons.filter((l) => l.status === "ready");
  if (ready.length === 0) return false;
  return ready.every((l) => records.some((r) => r.lessonId === l.id && r.completed));
}

export function moduleFraction(mod: Module, records: ProgressRecord[]) {
  const ready = mod.lessons.filter((l) => l.status === "ready");
  if (ready.length === 0) return 0;
  const done = ready.filter((l) =>
    records.some((r) => r.lessonId === l.id && r.completed),
  ).length;
  const quizPart =
    quizScoreFor(records, mod.id) != null &&
    (quizScoreFor(records, mod.id) as number) >= PASS_THRESHOLD
      ? 1
      : 0;
  const steps = ready.length + (mod.quiz ? 1 : 0);
  return (done + quizPart) / steps;
}

export type ModuleStatus = "locked" | "open" | "done" | "skeleton";

export function moduleStatus(mod: Module, records: ProgressRecord[]): ModuleStatus {
  if (!isModuleUnlocked(mod.id, records)) return "locked";
  const ready = mod.lessons.filter((l) => l.status === "ready");
  if (ready.length === 0) return "skeleton";
  const passed =
    (quizScoreFor(records, mod.id) ?? -1) >= PASS_THRESHOLD && Boolean(mod.quiz);
  if (passed) return "done";
  return "open";
}

export function nextStep(records: ProgressRecord[]) {
  for (const mod of modules) {
    if (!isModuleUnlocked(mod.id, records)) break;
    for (const lesson of mod.lessons) {
      if (lesson.status !== "ready") continue;
      const done = records.some((r) => r.lessonId === lesson.id && r.completed);
      if (!done) {
        return {
          href: `/app/lessons/${lesson.id}`,
          label: lesson.title,
          kicker: `מודול ${mod.id}`,
        };
      }
    }
    const score = quizScoreFor(records, mod.id);
    if (mod.quiz && isQuizOpen(mod.id, records) && (score ?? 0) < PASS_THRESHOLD) {
      return {
        href: `/app/quiz/${mod.id}`,
        label: `מבחן: ${mod.title}`,
        kicker: `מודול ${mod.id}`,
      };
    }
  }
  return null;
}

export function courseSnapshot(records: ProgressRecord[]) {
  return modules.map((mod) => ({
    module: mod,
    status: moduleStatus(mod, records),
    fraction: moduleFraction(mod, records),
    quizScore: quizScoreFor(records, mod.id),
    unlocked: isModuleUnlocked(mod.id, records),
  }));
}

export type GradeResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  results: {
    id: string;
    selected: string | undefined;
    correct: boolean;
    correctOptionId: string;
    explanation: string;
  }[];
};

export function gradeAnswers(
  moduleId: number,
  answers: Record<string, string>,
): GradeResult | null {
  const quiz = getQuiz(moduleId);
  if (!quiz) return null;
  const results = quiz.map((q) => {
    const correctOption = q.options.find((o) => o.correct);
    const selected = answers[q.id];
    const correct = Boolean(correctOption && selected === correctOption.id);
    return {
      id: q.id,
      selected,
      correct,
      correctOptionId: correctOption?.id ?? "",
      explanation: q.explanation,
    };
  });
  const correctCount = results.filter((r) => r.correct).length;
  const score = correctCount / quiz.length;
  return {
    score,
    passed: score >= PASS_THRESHOLD,
    correctCount,
    total: quiz.length,
    results,
  };
}

export function questionFeedback(moduleId: number, questionId: string, optionId: string) {
  const quiz = getQuiz(moduleId);
  const question = quiz?.find((q) => q.id === questionId);
  if (!question) return null;
  const correctOption = question.options.find((o) => o.correct);
  return {
    correct: correctOption?.id === optionId,
    correctOptionId: correctOption?.id ?? "",
    explanation: question.explanation,
  };
}
