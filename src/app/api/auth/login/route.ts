import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { firstError, loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstError(parsed.error));

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return jsonError("אימייל או סיסמה שגויים.", 401);

  const match = await compare(parsed.data.password, user.passwordHash);
  if (!match) return jsonError("אימייל או סיסמה שגויים.", 401);

  await setSession({ id: user.id, email: user.email, name: user.name });
  return NextResponse.json({ ok: true });
}
