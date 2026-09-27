import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/http";
import { firstError, profileSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  const session = await requireUser();
  if (!session) return jsonError("צריך להתחבר.", 401);

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstError(parsed.error));

  const user = await prisma.user.update({
    where: { id: session.id },
    data: { name: parsed.data.name },
  });
  await setSession({ id: user.id, email: user.email, name: user.name });
  return NextResponse.json({ ok: true, name: user.name });
}
