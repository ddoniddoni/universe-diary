import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSeoulCalendarDate, getTodayDiaryDate } from "@/lib/date";
import { isMonthComplete } from "@/lib/galaxy";
import { createStarPosition, EMOTION_STAR_COLORS } from "@/lib/star";

const schema = z.object({ title: z.string().trim().min(1, "제목을 입력해주세요.").max(50), content: z.string().trim().min(1, "오늘의 이야기를 들려주세요.").max(5000), emotion: z.enum(["HAPPY", "CALM", "SAD", "ANGRY", "EXCITED", "TIRED"]) });

export async function POST(request: Request) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const diaryDate = getTodayDiaryDate();
  try {
    const stars = await db.star.findMany({ where: { userId: user.userId }, select: { x: true, y: true } });
    const position = createStarPosition(stars, diaryDate);
    const diary = await db.$transaction(async (tx) => {
      const created = await tx.diary.create({ data: { ...parsed.data, userId: user.userId, diaryDate } });
      await tx.star.create({ data: { userId: user.userId, diaryId: created.id, ...position, color: EMOTION_STAR_COLORS[parsed.data.emotion], emotion: parsed.data.emotion } });
      const { year, month } = getSeoulCalendarDate(); const start = new Date(Date.UTC(year, month - 1, 1)); const end = new Date(Date.UTC(year, month, 1));
      const count = await tx.diary.count({ where: { userId: user.userId, diaryDate: { gte: start, lt: end } } });
      if (isMonthComplete(count, year, month)) await tx.galaxy.upsert({ where: { userId_year_month: { userId: user.userId, year, month } }, create: { userId: user.userId, year, month, isCompleted: true }, update: { isCompleted: true } });
      return created;
    });
    return NextResponse.json({ diary }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "오늘의 별은 이미 당신의 우주에 떠올랐어요." }, { status: 409 });
    return NextResponse.json({ message: "일기를 저장하지 못했습니다." }, { status: 500 });
  }
}
