import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "universe-diary-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { userId: string; email: string; nickname: string };

function getSessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET이 설정되지 않았습니다.");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionKey());
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionKey());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.nickname !== "string") return null;
    return { userId: payload.userId, email: payload.email, nickname: payload.nickname };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function sessionCookie(token: string) {
  return { name: COOKIE_NAME, value: token, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DURATION_SECONDS };
}

export function expiredSessionCookie() {
  return { name: COOKIE_NAME, value: "", httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 };
}
