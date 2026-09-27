import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { firstError, registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstError(parsed.error));

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("כבר יש חשבון עם האימייל הזה.", 409);

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await hash(parsed.data.password, 10),
    },
  });

  await setSession({ id: user.id, email: user.email, name: user.name });
  return NextResponse.json({ ok: true });
}
