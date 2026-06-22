import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { createSession, sessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });

  try {
    const user = await db.user.create({ data: { ...parsed.data, email: parsed.data.email.toLowerCase(), passwordHash: await hash(parsed.data.password, 12) } });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, nickname: user.nickname } }, { status: 201 });
    response.cookies.set(sessionCookie(await createSession({ userId: user.id, email: user.email, nickname: user.nickname })));
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 409 });
    return NextResponse.json({ message: "회원가입을 완료하지 못했습니다." }, { status: 500 });
  }
}
