import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth";
import { getSeoulCalendarDate } from "@/lib/date";
import { db } from "@/lib/db";

type UniverseSummary = { year: number; diaryCount: number; galaxyCount: number };

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
  const universes: UniverseSummary[] = [...years.entries()].map(([year, summary]) => ({ year, ...summary })).sort((left, right) => right.year - left.year);
  const currentUniverse = universes.find((universe) => universe.year === currentYear) ?? universes[0];

  return (
    <main className="min-h-svh overflow-hidden bg-[#020611] text-white">
      <section className="relative isolate min-h-[42rem] overflow-hidden border-b border-[#b7d8e6]/10 bg-[radial-gradient(ellipse_75%_85%_at_82%_35%,#09283b_0%,#04152a_34%,#020917_65%,#01040c_100%)] px-5 pb-12 pt-5 sm:px-10 sm:pt-8">
        <div aria-hidden="true" className="absolute -right-[22rem] -top-[28rem] size-[72rem] rounded-full border border-[#5ba4bd]/15" />
        <div aria-hidden="true" className="absolute -right-[18rem] -top-[24rem] size-[61rem] rounded-full border border-[#5ba4bd]/10" />
        <div className="relative mx-auto max-w-6xl">
          <header className="flex items-center justify-between gap-3">
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-[#dce9e9] sm:text-2xl">universe diary</Link>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#04111f]/55 p-1.5 backdrop-blur-md"><Link href="/diaries" className="rounded-full px-3 py-2 text-xs text-[#c6d8df] transition hover:bg-white/10 hover:text-white sm:text-sm">기록 목록</Link><LogoutButton /></div>
          </header>

          <div className="relative grid min-h-[33rem] items-center lg:grid-cols-[.86fr_1.14fr]">
            <div className="relative z-10 max-w-xl pt-12 lg:pt-0">
              <p className="text-[11px] font-medium tracking-[.28em] text-[#72cde8]">PERSONAL COSMOS / {currentYear}</p>
              <h1 className="font-display mt-5 text-5xl font-bold leading-[1.08] text-[#e8f0ee] sm:text-6xl">{user.nickname}님의<br />기록의 궤도</h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#a9bcc7] sm:text-base">매일 남긴 기록은 별이 되고, 별들은 한 해의 우주를 만듭니다. 오늘은 어디에 작은 빛을 남길까요?</p>
              <div className="mt-8 flex flex-wrap items-center gap-3"><Link href={`/universe/${currentUniverse.year}`} className="rounded-full border border-[#86d7ee]/60 bg-[#0b6286] px-5 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(37,156,199,.2)] transition hover:bg-[#117ba6]">{currentUniverse.year}년 우주 탐험하기</Link><Link href="/diary/new" className="rounded-full border border-[#a7d4e3]/25 bg-[#061728]/40 px-5 py-3 text-sm text-[#dbe9ed] transition hover:border-[#85d6ee] hover:bg-[#0a2639]">오늘의 별 남기기</Link></div>
              <div className="mt-10 flex gap-7 border-t border-white/10 pt-5 text-sm"><Metric value={diaries.length} label="기록한 별" /><Metric value={galaxies.length} label="완성한 은하수" /><Metric value={universes.length} label="여행한 해" /></div>
            </div>
            <OrbitalHero />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#020611_0%,#040e19_100%)] px-5 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-medium tracking-[.26em] text-[#6bcbe6]">YEARLY WORLDS</p><h2 className="font-display mt-3 text-3xl font-bold text-[#e8f0ef]">기록으로 이루어진 행성들</h2></div><p className="max-w-xs text-sm leading-6 text-[#8299a5]">한 해를 선택하면 그 안에 떠 있는 별과 은하수를 만날 수 있어요.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{universes.map((universe, index) => <UniverseCard key={universe.year} universe={universe} variant={index % 3} />)}</div></div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) { return <div><p className="text-xl font-semibold text-[#e9f5f7]">{value}</p><p className="mt-1 text-xs text-[#7f9aa9]">{label}</p></div>; }

function OrbitalHero() {
  return <div aria-hidden="true" className="relative hidden h-full min-h-[33rem] lg:block">
    <div className="absolute right-[1%] top-[8%] size-[27rem] overflow-hidden rounded-full bg-[#071321] shadow-[-40px_25px_80px_rgba(0,0,0,.82),0_0_90px_rgba(47,148,184,.12)]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_31%_26%,rgba(225,244,239,.95)_0_1.5%,rgba(119,172,178,.75)_6%,rgba(53,102,120,.9)_18%,rgba(20,49,73,.96)_44%,rgba(3,10,20,1)_72%)]" />
      <div className="absolute inset-0 rounded-full opacity-55 mix-blend-screen bg-[radial-gradient(ellipse_28%_15%_at_38%_30%,rgba(205,241,232,.52),transparent_70%),radial-gradient(ellipse_32%_13%_at_58%_54%,rgba(69,136,150,.48),transparent_72%),radial-gradient(ellipse_21%_10%_at_31%_66%,rgba(180,213,199,.25),transparent_75%)]" />
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(115deg,transparent_20%,rgba(124,191,200,.18)_38%,transparent_48%,rgba(9,24,42,.72)_69%)]" />
      <div className="absolute inset-0 rounded-full shadow-[inset_-38px_-13px_42px_rgba(0,0,0,.85),inset_15px_10px_28px_rgba(159,226,226,.14)]" />
    </div>
    <div className="absolute right-[-7%] top-[20%] h-[12rem] w-[35rem] rotate-[-22deg] rounded-[50%] border border-[#75cde9]/50 shadow-[0_0_15px_rgba(60,184,228,.1)]" />
    <div className="absolute right-[-4%] top-[23%] h-[8rem] w-[31rem] rotate-[-22deg] rounded-[50%] border border-[#9cdcf0]/25" />
    <div className="absolute right-[17%] top-[24%] size-3 rounded-full bg-[#d9f7ff] shadow-[0_0_22px_7px_rgba(100,215,248,.72)]" /><div className="absolute right-[1%] top-[50%] size-9 rounded-full bg-[radial-gradient(circle_at_30%_28%,#dfb998_0_6%,#8c625d_28%,#2f2631_60%,#090b15_82%)] shadow-[0_8px_26px_rgba(0,0,0,.75)]" /><div className="absolute right-[44%] top-[65%] size-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,#b5edff,#27759c_42%,#06121e_76%)] shadow-[0_0_22px_rgba(55,188,236,.55)]" />
  </div>;
}

function UniverseCard({ universe, variant }: { universe: UniverseSummary; variant: number }) {
  const planet = ["bg-[radial-gradient(circle_at_31%_25%,#d4eeea_0_2%,#74aeb0_10%,#315970_28%,#101b31_54%,#050813_75%)]", "bg-[radial-gradient(circle_at_31%_25%,#efd8b7_0_2%,#a87870_13%,#4e3645_34%,#181528_58%,#060812_76%)]", "bg-[radial-gradient(circle_at_31%_25%,#ceeefa_0_2%,#4d91ad_12%,#1e466c_33%,#0a1932_60%,#040611_78%)]"][variant];
  return <Link href={`/universe/${universe.year}`} className="group relative min-h-64 overflow-hidden rounded-2xl border border-[#8acfe6]/15 bg-[linear-gradient(145deg,rgba(5,24,42,.96),rgba(3,11,24,.98))] p-6 shadow-[0_20px_45px_rgba(0,0,0,.25)] transition duration-500 hover:-translate-y-1 hover:border-[#83d8f4]/55 hover:bg-[#08243c]">
    <div aria-hidden="true" className={`absolute -right-8 -top-8 size-44 rounded-full shadow-[-14px_18px_27px_rgba(0,0,0,.66),inset_-13px_-8px_15px_rgba(0,0,0,.62)] transition duration-500 group-hover:scale-110 ${planet}`} /><div aria-hidden="true" className="absolute -right-14 top-7 h-14 w-52 -rotate-[21deg] rounded-[50%] border border-[#76d2ef]/30" />
    <p className="relative text-[10px] font-medium tracking-[.22em] text-[#64cbe9]">YEARLY UNIVERSE</p><h3 className="font-display relative mt-9 text-5xl font-bold text-[#edf5f6]">{universe.year}</h3><p className="relative mt-1 text-sm text-[#86a5b4]">{universe.year}년의 기록</p><div className="relative mt-7 flex items-center gap-4 text-sm text-[#c5d9e1]"><span>별 <strong className="font-semibold text-white">{universe.diaryCount}</strong></span><span className="h-3 w-px bg-white/15" /><span>은하수 <strong className="font-semibold text-white">{universe.galaxyCount}</strong></span></div><span className="relative mt-6 inline-flex items-center text-sm font-medium text-[#86d9f7] transition group-hover:translate-x-1">우주로 들어가기 <span className="ml-2">→</span></span>
  </Link>;
}
