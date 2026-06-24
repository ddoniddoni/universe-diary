import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth";
import { getSeoulCalendarDate } from "@/lib/date";
import { db } from "@/lib/db";

type UniverseSummary = { year: number; diaryCount: number; galaxyCount: number };

const orbitStyles = [
  "bg-[radial-gradient(circle_at_31%_28%,#d5f3ff_0_3%,#508eb4_12%,#182c52_41%,#050914_73%)]",
  "bg-[radial-gradient(circle_at_32%_25%,#f5e3c2_0_2%,#956f69_16%,#352438_47%,#080a17_75%)]",
  "bg-[radial-gradient(circle_at_33%_25%,#d9f2ff_0_3%,#286897_16%,#102044_48%,#040713_76%)]",
];

export default async function UniverseIndexPage() {
  const user = await requireUser();
  const [diaries, galaxies] = await Promise.all([
    db.diary.findMany({ where: { userId: user.userId }, select: { diaryDate: true } }),
    db.galaxy.findMany({ where: { userId: user.userId, isCompleted: true }, select: { year: true } }),
  ]);
  const years = new Map<number, Omit<UniverseSummary, "year">>();
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
  const universes: UniverseSummary[] = [...years.entries()]
    .map(([year, summary]) => ({ year, ...summary }))
    .sort((left, right) => right.year - left.year);
  const currentUniverse = universes.find((universe) => universe.year === currentYear) ?? universes[0];

  return (
    <main className="min-h-svh overflow-hidden bg-[#030914] text-white">
      <section className="relative isolate min-h-[39rem] overflow-hidden border-b border-[#9ddbf4]/15 bg-[radial-gradient(ellipse_70%_90%_at_88%_25%,#0c4164_0%,#06213d_29%,#040f23_56%,#020713_100%)] px-5 pb-12 pt-5 sm:min-h-[42rem] sm:px-10 sm:pt-8">
        <div aria-hidden="true" className="absolute -right-24 top-[-7rem] size-[38rem] rounded-full border border-[#47b9ef]/25 opacity-55 sm:size-[49rem]" />
        <div aria-hidden="true" className="absolute -right-24 top-[-7rem] size-[38rem] rounded-full border border-[#47b9ef]/15 sm:size-[49rem]" style={{ transform: "scale(.79)" }} />
        <div className="relative mx-auto max-w-6xl">
          <header className="flex items-center justify-between gap-3">
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-[#e6f3f7] sm:text-2xl">universe diary</Link>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#061426]/70 p-1.5 backdrop-blur-md">
              <Link href="/diaries" className="rounded-full px-3 py-2 text-xs text-[#c6d8e1] transition hover:bg-white/10 hover:text-white sm:text-sm">기록 목록</Link>
              <LogoutButton />
            </div>
          </header>

          <div className="relative grid min-h-[31rem] items-center lg:grid-cols-[.88fr_1.12fr]">
            <div className="relative z-10 max-w-xl pt-12 lg:pt-0">
              <p className="text-[11px] font-medium tracking-[.28em] text-[#59c7ee]">PERSONAL COSMOS / {currentYear}</p>
              <h1 className="font-display mt-5 text-5xl font-bold leading-[1.08] text-[#e7f1f3] sm:text-6xl">{user.nickname}님의<br />기록의 궤도</h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#aabecb] sm:text-base">매일 남긴 기록은 별이 되고, 별들은 한 해의 우주를 만듭니다. 오늘은 어디에 작은 빛을 남길까요?</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/universe/${currentUniverse.year}`} className="rounded-full bg-[#1595c6] px-5 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(36,180,234,.25)] transition hover:bg-[#2caddc]">{currentUniverse.year}년 우주 탐험하기</Link>
                <Link href="/diary/new" className="rounded-full border border-[#7bcbe8]/35 bg-[#07182a]/55 px-5 py-3 text-sm text-[#dbeaf0] transition hover:border-[#83daf8] hover:bg-[#0a263e]">오늘의 별 남기기</Link>
              </div>
              <div className="mt-10 flex gap-7 border-t border-white/10 pt-5 text-sm">
                <Metric value={diaries.length} label="기록한 별" />
                <Metric value={galaxies.length} label="완성한 은하수" />
                <Metric value={universes.length} label="여행한 해" />
              </div>
            </div>

            <OrbitalHero />
          </div>
        </div>
      </section>

      <section className="relative bg-[linear-gradient(180deg,#030914_0%,#06111f_100%)] px-5 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[11px] font-medium tracking-[.26em] text-[#53bce5]">YEARLY WORLDS</p><h2 className="font-display mt-3 text-3xl font-bold text-[#ecf3f5]">기록으로 이루어진 행성들</h2></div>
            <p className="max-w-xs text-sm leading-6 text-[#829aa9]">한 해를 선택하면 그 안에 떠 있는 별과 은하수를 만날 수 있어요.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {universes.map((universe, index) => <UniverseCard key={universe.year} universe={universe} styleIndex={index % orbitStyles.length} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div><p className="text-xl font-semibold text-[#e9f5f7]">{value}</p><p className="mt-1 text-xs text-[#7f9aa9]">{label}</p></div>;
}

function OrbitalHero() {
  return (
    <div aria-hidden="true" className="relative hidden h-full min-h-[31rem] lg:block">
      <div className="absolute right-[2%] top-[10%] size-[25rem] rounded-full bg-[radial-gradient(circle_at_34%_28%,#a6d5e7_0_2%,#4f89a8_12%,#1d405c_29%,#0a172c_54%,#020713_71%)] shadow-[-32px_15px_70px_rgba(0,0,0,.65),0_0_80px_rgba(34,151,201,.24)]" />
      <div className="absolute right-[-6%] top-[21%] h-[12rem] w-[34rem] rotate-[-23deg] rounded-[50%] border border-[#65c9ef]/45" />
      <div className="absolute right-[-4%] top-[25%] h-[7rem] w-[30rem] rotate-[-23deg] rounded-[50%] border border-[#87d9f7]/25" />
      <div className="absolute right-[16%] top-[26%] size-4 rounded-full bg-[#bdeeff] shadow-[0_0_22px_6px_rgba(92,203,244,.7)]" />
      <div className="absolute right-[4%] top-[48%] size-9 rounded-full bg-[radial-gradient(circle_at_32%_28%,#d9b99c,#4e3b39_42%,#15111a_72%)] shadow-[0_7px_24px_rgba(0,0,0,.7)]" />
      <div className="absolute right-[43%] top-[65%] size-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,#8fe7ff,#19638e_45%,#071323_75%)] shadow-[0_0_20px_rgba(51,188,236,.5)]" />
    </div>
  );
}

function UniverseCard({ universe, styleIndex }: { universe: UniverseSummary; styleIndex: number }) {
  return (
    <Link href={`/universe/${universe.year}`} className="group relative min-h-60 overflow-hidden rounded-2xl border border-[#75cbed]/16 bg-[linear-gradient(145deg,rgba(7,27,47,.94),rgba(4,12,26,.95))] p-6 shadow-[0_20px_45px_rgba(0,0,0,.2)] transition duration-500 hover:-translate-y-1 hover:border-[#78d8fa]/50 hover:bg-[#09233c]">
      <div aria-hidden="true" className={`absolute -right-7 -top-7 size-40 rounded-full opacity-90 shadow-[-15px_18px_30px_rgba(0,0,0,.55)] transition duration-500 group-hover:scale-110 ${orbitStyles[styleIndex]}`} />
      <div aria-hidden="true" className="absolute -right-12 top-8 h-14 w-48 -rotate-[21deg] rounded-[50%] border border-[#73d2f4]/25" />
      <p className="relative text-[10px] font-medium tracking-[.22em] text-[#57c8ef]">YEARLY UNIVERSE</p>
      <h3 className="font-display relative mt-9 text-5xl font-bold text-[#edf5f6]">{universe.year}</h3>
      <p className="relative mt-1 text-sm text-[#86a5b4]">{universe.year}년의 기록</p>
      <div className="relative mt-7 flex items-center gap-4 text-sm text-[#c5d9e1]"><span>별 <strong className="font-semibold text-white">{universe.diaryCount}</strong></span><span className="h-3 w-px bg-white/15" /><span>은하수 <strong className="font-semibold text-white">{universe.galaxyCount}</strong></span></div>
      <span className="relative mt-6 inline-flex items-center text-sm font-medium text-[#86d9f7] transition group-hover:translate-x-1">우주로 들어가기 <span className="ml-2">→</span></span>
    </Link>
  );
}
