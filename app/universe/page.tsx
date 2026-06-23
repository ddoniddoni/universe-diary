import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { UniverseScene } from "@/components/universe/universe-scene";
import { requireUser } from "@/lib/auth";
import { getTodayDiaryDate } from "@/lib/date";
import { db } from "@/lib/db";

export default async function UniversePage() {
  const user = await requireUser();
  const [stars, galaxies, todayDiary] = await Promise.all([
    db.star.findMany({
      where: { userId: user.userId },
      include: { diary: { select: { id: true, title: true, diaryDate: true } } },
    }),
    db.galaxy.findMany({
      where: { userId: user.userId, isCompleted: true },
      select: { id: true, year: true, month: true },
    }),
    db.diary.findUnique({
      where: {
        userId_diaryDate: { userId: user.userId, diaryDate: getTodayDiaryDate() },
      },
      select: { id: true },
    }),
  ]);

  const sceneStars = stars.map((star) => ({
    id: star.id,
    diaryId: star.diary.id,
    title: star.diary.title,
    diaryDate: star.diary.diaryDate.toISOString(),
    color: star.color,
    x: star.x,
    y: star.y,
  }));

  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#02030b]">
      <UniverseScene stars={sceneStars} galaxies={galaxies} />

      {stars.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 text-center sm:left-1/2 sm:w-[30rem] sm:-translate-x-1/2">
          <p className="text-xs font-medium tracking-[0.3em] text-[#7bdff2]">THE FIRST LIGHT</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">아직 당신의 우주에는 별이 없어요.</h2>
          <p className="mt-3 text-sm leading-6 text-[#c9cada]">오늘의 첫 번째 기록으로 가장 먼저 빛나는 별을 만들어보세요.</p>
        </div>
      )}

      <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-6">
        <div className="rounded-2xl border border-white/10 bg-[#080b20]/65 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-5">
          <p className="text-xs font-medium tracking-[0.24em] text-[#7bdff2]">MY UNIVERSE</p>
          <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">{user.nickname}님의 우주</h1>
          {galaxies.length > 0 && (
            <p className="mt-2 text-xs text-[#c9b8ff]">
              ✦ {galaxies[0].year}년 {galaxies[0].month}월의 은하수 완성
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#080b20]/65 p-2 shadow-2xl backdrop-blur-xl">
          <Link href="/diaries" className="rounded-xl px-3 py-2 text-sm text-[#d8d9e8] transition hover:bg-white/10 hover:text-white">
            목록으로 보기
          </Link>
          <Link href="/" className="rounded-xl px-3 py-2 text-sm text-[#d8d9e8] transition hover:bg-white/10 hover:text-white">
            메인으로
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="absolute bottom-5 left-4 z-10 max-w-sm rounded-3xl border border-white/10 bg-[#080b20]/70 p-5 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:left-7 sm:p-6">
        <p className="text-sm leading-6 text-[#c9cada]">
          {todayDiary ? "오늘의 별이 이미 당신의 우주에 떠올랐어요." : "오늘의 별이 아직 떠오르지 않았어요."}
        </p>
        <Link
          href={todayDiary ? `/diary/${todayDiary.id}` : "/diary/new"}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ffd166] px-4 py-3 text-sm font-semibold text-[#171424] shadow-[0_0_28px_rgba(255,209,102,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ffe29a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd166]"
        >
          {todayDiary ? "오늘의 다이어리 보기" : "오늘의 별 만들기"}
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <aside className="pointer-events-none absolute bottom-5 right-5 z-10 hidden rounded-2xl border border-white/10 bg-[#080b20]/55 px-4 py-3 text-xs leading-5 text-white/55 backdrop-blur-xl sm:block">
        <p className="font-medium tracking-[0.18em] text-[#9fb4ff]">DEEP SPACE</p>
        <p className="mt-1">드래그해 성계 사이를 항해하고,</p>
        <p>스크롤해 심우주를 확대·축소하세요.</p>
      </aside>
    </main>
  );
}
