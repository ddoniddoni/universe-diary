import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, sessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, nickname: user.nickname } });
  response.cookies.set(sessionCookie(await createSession({ userId: user.id, email: user.email, nickname: user.nickname })));
  return response;
}
