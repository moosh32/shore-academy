import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  readToken,
  sessionCookieOptions,
  signSession,
  type SessionUser,
} from "@/lib/session";

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readToken(token);
}

export async function setSession(user: SessionUser) {
  const jar = await cookies();
  const token = await signSession(user);
  jar.set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}
