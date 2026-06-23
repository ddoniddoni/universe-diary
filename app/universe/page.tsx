import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth";
import { getSeoulCalendarDate } from "@/lib/date";
import { db } from "@/lib/db";

export default async function UniverseIndexPage() {
  const user = await requireUser();
  const [diaries, galaxies] = await Promise.all([
    db.diary.findMany({ where: { userId: user.userId }, select: { diaryDate: true } }),
    db.galaxy.findMany({ where: { userId: user.userId, isCompleted: true }, select: { year: true } }),
  ]);
  const years = new Map<number, { diaryCount: number; galaxyCount: number }>();
  for (const diary of diaries) {
    const year = diary.diaryDate.getUTCFullYear();
    const summary = years.get(year) ?? { diaryCount: 0, galaxyCount: 0 };
    summary.diaryCount += 1;
    years.set(year, summary);
  }
  for (const galaxy of galaxies) {
    const summary = years.get(galaxy.year) ?? { diaryCount: 0, galaxyCount: 0 };
    summary.galaxyCount += 1;
    years.set(galaxy.year, summary);
  }
  const currentYear = getSeoulCalendarDate().year;
  if (!years.has(currentYear)) years.set(currentYear, { diaryCount: 0, galaxyCount: 0 });
  const universes = [...years.entries()].sort(([left], [right]) => right - left);

  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_top,#23275a_0%,#0b1026_42%,#050510_100%)] px-5 py-7 sm:px-10 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] text-[#7bdff2]">UNIVERSE ARCHIVE</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{user.nickname}님의 우주</h1>
            <p className="mt-2 text-sm text-[#b8b8c8]">기록이 쌓인 해마다 하나의 우주가 만들어집니다.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1026]/70 p-2 backdrop-blur-xl">
            <Link href="/diaries" className="rounded-xl px-3 py-2 text-sm text-[#d8d9e8] transition hover:bg-white/10 hover:text-white">목록으로 보기</Link>
            <LogoutButton />
          </div>
        </header>

        <section className="mt-12 grid gap-5 sm:grid-cols-2">
          {universes.map(([year, summary]) => (
            <Link key={year} href={`/universe/${year}`} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1026]/70 p-7 shadow-2xl transition hover:-translate-y-1 hover:border-[#b8a1ff]/50 hover:bg-[#12183a]">
              <div aria-hidden="true" className="absolute -right-12 -top-12 size-40 rounded-full bg-[#b8a1ff]/15 blur-2xl transition group-hover:bg-[#7bdff2]/20" />
              <p className="relative text-xs font-medium tracking-[0.25em] text-[#7bdff2]">YEARLY UNIVERSE</p>
              <h2 className="relative mt-5 text-4xl font-semibold text-white">{year}년 우주</h2>
              <div className="relative mt-8 flex gap-5 text-sm text-[#c6c8da]">
                <span>별 {summary.diaryCount}개</span>
                <span>은하수 {summary.galaxyCount}개</span>
              </div>
              <p className="relative mt-8 text-sm font-medium text-[#ffd166]">우주 탐험하기 →</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
