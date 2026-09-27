import { prisma } from "@/lib/db";
import type { ProgressRecord } from "@/lib/course";

export async function loadRecords(userId: string): Promise<ProgressRecord[]> {
  const rows = await prisma.progress.findMany({ where: { userId } });
  return rows.map((row) => ({
    moduleId: row.moduleId,
    lessonId: row.lessonId,
    completed: row.completed,
    quizScore: row.quizScore,
  }));
}
