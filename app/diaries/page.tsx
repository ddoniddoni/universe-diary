import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const emotionLabels: Record<string, string> = { HAPPY: "행복", CALM: "평온", SAD: "슬픔", ANGRY: "분노", EXCITED: "설렘", TIRED: "지침" };
type DiarySummary = { id: string; title: string; emotion: string; diaryDate: Date; star: { color: string } | null };

function groupByCalendarMonth(diaries: DiarySummary[]) {
  const years = new Map<number, Map<number, DiarySummary[]>>();
  for (const diary of diaries) { const year = diary.diaryDate.getUTCFullYear(); const month = diary.diaryDate.getUTCMonth() + 1; const months = years.get(year) ?? new Map<number, DiarySummary[]>(); months.set(month, [...(months.get(month) ?? []), diary]); years.set(year, months); }
  return [...years.entries()].map(([year, months]) => [year, [...months.entries()].sort(([left], [right]) => right - left)] as const);
}

export default async function DiariesPage() {
  const user = await requireUser();
  const diaries = await db.diary.findMany({ where: { userId: user.userId }, select: { id: true, title: true, emotion: true, diaryDate: true, star: { select: { color: true } } }, orderBy: { diaryDate: "desc" } });
  const years = groupByCalendarMonth(diaries);
  return <main className="min-h-svh bg-[radial-gradient(ellipse_60%_45%_at_88%_0%,#092437_0%,#041323_42%,#020611_100%)] px-5 py-6 text-white sm:px-10 sm:py-8"><div className="mx-auto max-w-6xl"><header className="flex items-center justify-between gap-4 border-b border-[#9ed5e7]/12 pb-6"><div><p className="text-[11px] font-medium tracking-[.27em] text-[#68c9e7]">PERSONAL LOGBOOK</p><h1 className="font-display mt-3 text-4xl font-bold text-[#e8f0ef]">{user.nickname}의 항해 기록</h1></div><div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#051422]/60 p-1.5 backdrop-blur-md"><Link href="/universe" className="rounded-full px-3 py-2 text-sm text-[#d8e7eb] transition hover:bg-white/10">나의 우주</Link><LogoutButton /></div></header>{years.length === 0 ? <section className="mt-14 rounded-3xl border border-[#84cae1]/16 bg-[#061423]/70 px-6 py-16 text-center"><p className="font-display text-2xl text-[#e7f0f0]">아직 남겨진 항해 기록이 없어요.</p><p className="mt-3 text-sm text-[#92aab5]">첫 번째 기록은 당신의 우주에 별이 됩니다.</p><Link href="/diary/new" className="mt-7 inline-flex rounded-full bg-[#0b7199] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1289b8]">오늘의 별 남기기</Link></section> : <div className="mt-10 space-y-12">{years.map(([year, months]) => <section key={year}><div className="flex items-baseline gap-3"><h2 className="font-display text-4xl font-bold text-[#e7f0ef]">{year}</h2><span className="text-sm text-[#7894a1]">{months.reduce((total, [, items]) => total + items.length, 0)}개의 기록</span></div><div className="mt-6 space-y-7">{months.map(([month, items]) => <section key={month}><p className="mb-3 text-sm font-medium tracking-[.16em] text-[#83d4ed]">{month}월</p><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((diary) => <Link key={diary.id} href={`/diary/${diary.id}`} className="group relative overflow-hidden rounded-2xl border border-[#a0d8e8]/13 bg-[linear-gradient(135deg,rgba(7,27,45,.92),rgba(4,13,26,.92))] p-5 transition hover:-translate-y-0.5 hover:border-[#83d7f1]/48 hover:bg-[#09243c]"><span aria-hidden="true" className="absolute right-5 top-5 size-2 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: diary.star?.color ?? "#9cc6d6", color: diary.star?.color ?? "#9cc6d6" }} /><time className="text-xs text-[#829ba7]">{month}월 {diary.diaryDate.getUTCDate()}일</time><h3 className="mt-7 truncate text-lg font-medium text-[#e9f2f3] group-hover:text-[#91dbf2]">{diary.title}</h3><p className="mt-2 text-sm text-[#90a8b4]">{emotionLabels[diary.emotion]}</p><span className="mt-5 inline-block text-xs text-[#72cae5]">기록 읽기 →</span></Link>)}</div></section>)}</div></section>)}</div>}</div></main>;
}
