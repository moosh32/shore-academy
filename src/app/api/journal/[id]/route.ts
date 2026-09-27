import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/http";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (!session) return jsonError("צריך להתחבר.", 401);

  const { id } = await context.params;
  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId: session.id },
  });
  if (!entry) return jsonError("הרשומה לא נמצאה.", 404);

  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
