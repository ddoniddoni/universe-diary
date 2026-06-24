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
    <main className="relative min-h-svh overflow-hidden bg-[#03040e] px-5 py-6 sm:px-10 sm:py-10">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-15%,rgba(88,79,174,.46),transparent_48%),radial-gradient(ellipse_at_0%_60%,rgba(37,102,142,.18),transparent_34%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_0_1px,transparent_1.2px)] [background-size:39px_41px]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6 sm:pb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] text-[#7bdff2]">PERSONAL COSMOS · ARCHIVE</p>
            <h1 className="font-display mt-3 text-4xl font-bold text-white sm:text-5xl">{user.nickname}님의 우주</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#bfc2d9]">기록이 쌓인 해마다 하나의 우주가 만들어집니다.</p>
          </div>
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#080b20]/65 p-1.5 shadow-xl backdrop-blur-xl">
            <Link href="/diaries" className="rounded-xl px-3 py-2 text-sm text-[#d8d9e8] transition hover:bg-white/10 hover:text-white">기록 목록</Link>
            <LogoutButton />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="ARCHIVED YEARS" value={universes.length} suffix="개" />
          <Stat label="RECORDED STARS" value={diaries.length} suffix="개" />
          <Stat label="COMPLETED GALAXIES" value={galaxies.length} suffix="개" />
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-[.25em] text-[#c9b8ff]">SELECT A YEAR</p>
              <h2 className="font-display mt-2 text-2xl font-bold text-white">별이 쌓인 시간들</h2>
            </div>
            <p className="hidden text-sm text-[#aeb3ce] sm:block">연도를 선택해 그 해의 우주로 들어가세요.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {universes.map(([year, summary]) => (
              <Link key={year} href={`/universe/${year}`} className="group relative min-h-72 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(25,31,75,.9),rgba(7,10,28,.9))] p-7 shadow-[0_24px_70px_rgba(0,0,0,.32)] transition duration-500 hover:-translate-y-1 hover:border-[#b8a1ff]/55 hover:shadow-[0_24px_80px_rgba(102,78,181,.26)]">
                <div aria-hidden="true" className="absolute -right-8 -top-8 size-52 rounded-full border border-[#c8c1ff]/20 bg-[radial-gradient(circle_at_35%_35%,rgba(234,229,255,.7),rgba(126,105,220,.24)_20%,transparent_62%)] opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-100" />
                <div aria-hidden="true" className="absolute bottom-7 right-8 size-1.5 rounded-full bg-[#ffd166] shadow-[0_0_20px_7px_rgba(255,209,102,.3)]" />
                <p className="relative text-xs font-medium tracking-[0.25em] text-[#7bdff2]">YEARLY UNIVERSE</p>
                <h3 className="font-display relative mt-7 text-5xl font-bold text-white">{year}<span className="ml-1 text-2xl text-[#d9d8e9]">년</span></h3>
                <div className="relative mt-10 flex gap-6 text-sm text-[#c6c8da]"><span><strong className="mr-1 font-semibold text-white">{summary.diaryCount}</strong>개의 별</span><span><strong className="mr-1 font-semibold text-white">{summary.galaxyCount}</strong>개의 은하수</span></div>
                <p className="relative mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#ffd166] transition group-hover:gap-3">우주 탐험하기 <span aria-hidden="true">→</span></p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-sm"><p className="text-xs tracking-[.16em] text-[#99a2c9]">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}<span className="ml-1 text-sm font-normal text-[#aeb3ce]">{suffix}</span></p></div>;
}
