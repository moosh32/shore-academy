import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/http";
import { getTool, runTool } from "@/lib/tools";

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) return jsonError("צריך להתחבר.", 401);

  const body = (await request.json().catch(() => null)) as
    | { toolId?: string; inputs?: Record<string, unknown> }
    | null;
  const tool = body?.toolId ? getTool(body.toolId) : null;
  if (!tool) return jsonError("מחשבון לא מוכר.", 404);

  const raw: Record<string, number> = {};
  for (const field of tool.fields) {
    const value = body?.inputs?.[field.key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return jsonError(`חסר ערך תקין בשדה «${field.label}».`);
    }
    raw[field.key] = value;
  }

  const result = runTool(tool.id, raw);
  if (!result.ok) return jsonError(result.error);

  const saved = await prisma.labSave.upsert({
    where: { userId_toolId: { userId: session.id, toolId: tool.id } },
    update: {
      inputs: JSON.stringify(raw),
      result: JSON.stringify(result.view),
    },
    create: {
      userId: session.id,
      toolId: tool.id,
      inputs: JSON.stringify(raw),
      result: JSON.stringify(result.view),
    },
  });

  return NextResponse.json({ ok: true, view: result.view, savedAt: saved.savedAt });
}
