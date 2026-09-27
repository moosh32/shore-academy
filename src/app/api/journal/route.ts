import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/http";
import { firstError, journalSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) return jsonError("צריך להתחבר.", 401);

  const body = await request.json().catch(() => null);
  const parsed = journalSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstError(parsed.error));

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.id,
      date: parsed.data.date,
      ticker: parsed.data.ticker,
      plannedR: parsed.data.plannedR,
      actualR: parsed.data.actualR,
      notes: parsed.data.notes,
      tags: JSON.stringify(parsed.data.tags),
    },
  });

  return NextResponse.json({ ok: true, id: entry.id });
}
