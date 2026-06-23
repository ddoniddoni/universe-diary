import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const emotionLabels: Record<string, string> = {
  HAPPY: "행복",
  CALM: "평온",
  SAD: "슬픔",
  ANGRY: "분노",
  EXCITED: "설렘",
  TIRED: "지침",
};

type DiarySummary = { id: string; title: string; emotion: string; diaryDate: Date; star: { color: string } | null };

function groupByCalendarMonth(diaries: DiarySummary[]) {
  const years = new Map<number, Map<number, DiarySummary[]>>();
  for (const diary of diaries) {
    const year = diary.diaryDate.getUTCFullYear();
    const month = diary.diaryDate.getUTCMonth() + 1;
    const months = years.get(year) ?? new Map<number, DiarySummary[]>();
    months.set(month, [...(months.get(month) ?? []), diary]);
    years.set(year, months);
  }
  return [...years.entries()].map(([year, months]) => [year, [...months.entries()].sort(([left], [right]) => right - left)] as const);
}

export default async function DiariesPage() {
  const user = await requireUser();
  const diaries = await db.diary.findMany({
    where: { userId: user.userId },
    select: { id: true, title: true, emotion: true, diaryDate: true, star: { select: { color: true } } },
    orderBy: { diaryDate: "desc" },
  });
  const years = groupByCalendarMonth(diaries);

  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_top,#1a1d42_0%,#090b1e_44%,#050510_100%)] px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-[#7bdff2]">DIARY ARCHIVE</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{user.nickname}님의 기록</h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1026]/70 p-2 backdrop-blur-xl">
            <Link href="/universe" className="rounded-xl px-3 py-2 text-sm text-[#d8d9e8] transition hover:bg-white/10 hover:text-white">우주로 보기</Link>
            <LogoutButton />
          </div>
        </header>

        {years.length === 0 ? (
          <section className="mt-16 rounded-3xl border border-white/10 bg-[#0b1026]/70 px-6 py-16 text-center backdrop-blur-xl">
            <p className="text-lg text-white">아직 쌓인 기록이 없어요.</p>
            <p className="mt-2 text-sm text-[#b8b8c8]">첫 번째 기록은 당신의 우주에 별이 됩니다.</p>
            <Link href="/diary/new" className="mt-6 inline-flex rounded-xl bg-[#ffd166] px-4 py-3 text-sm font-semibold text-[#171424] transition hover:bg-[#ffe29a]">오늘의 별 만들기</Link>
          </section>
        ) : (
          <div className="mt-10 space-y-12">
            {years.map(([year, months]) => (
              <section key={year}>
                <div className="flex items-baseline gap-3 border-b border-white/10 pb-3">
                  <h2 className="text-2xl font-semibold text-white">{year}년</h2>
                  <span className="text-sm text-[#aeb0c6]">{months.reduce((total, [, items]) => total + items.length, 0)}개의 기록</span>
                </div>
                <div className="mt-7 space-y-8">
                  {months.map(([month, items]) => (
                    <section key={month}>
                      <h3 className="mb-3 text-base font-medium text-[#c9b8ff]">{month}월</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((diary) => (
                          <Link key={diary.id} href={`/diary/${diary.id}`} className="group rounded-2xl border border-white/10 bg-[#0b1026]/65 p-4 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-[#121838]">
                            <div className="flex items-center justify-between gap-3">
                              <time className="text-sm text-[#b8b8c8]">{month}월 {diary.diaryDate.getUTCDate()}일</time>
                              <span className="size-2.5 rounded-full" style={{ backgroundColor: diary.star?.color ?? "#b8b8c8" }} />
                            </div>
                            <h4 className="mt-5 truncate text-base font-medium text-white group-hover:text-[#ffd166]">{diary.title}</h4>
                            <p className="mt-2 text-xs text-[#aeb0c6]">{emotionLabels[diary.emotion]}</p>
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
