import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  return session;
}
