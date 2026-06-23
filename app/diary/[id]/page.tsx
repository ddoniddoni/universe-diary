import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const emotionLabels: Record<string, string> = { HAPPY: "행복", CALM: "평온", SAD: "슬픔", ANGRY: "분노", EXCITED: "설렘", TIRED: "지침" };

export default async function DiaryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const diary = await db.diary.findFirst({ where: { id, userId: user.userId }, include: { star: true } });
  if (!diary) notFound();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-6 py-12">
      <article className="w-full rounded-3xl border border-white/10 bg-[#0b1026]/80 p-8 shadow-2xl">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/diaries" className="text-[#7bdff2] transition hover:text-white">목록으로 보기</Link>
          <Link href="/universe" className="text-[#b8b8c8] transition hover:text-white">우주로 보기</Link>
        </div>
        <p className="mt-8 text-sm" style={{ color: diary.star?.color }}>{emotionLabels[diary.emotion]}</p>
        <h1 className="mt-2 text-3xl font-semibold">{diary.title}</h1>
        <time className="mt-2 block text-sm text-[#b8b8c8]">{diary.diaryDate.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" })}</time>
        <p className="mt-8 whitespace-pre-wrap leading-8 text-[#e8e8f0]">{diary.content}</p>
        <Link href={`/diary/${diary.id}/edit`} className="mt-8 inline-block rounded-xl border border-[#7bdff2]/50 px-4 py-2 text-sm text-[#7bdff2] transition hover:bg-[#7bdff2]/10">일기 수정하기</Link>
      </article>
    </main>
  );
}
