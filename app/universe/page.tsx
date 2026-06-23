import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { SpaceBackdrop } from "@/components/universe/space-backdrop";
import { UniverseMap } from "@/components/universe/universe-map";
import { requireUser } from "@/lib/auth";
export default async function UniversePage(){const user=await requireUser();return <main className="relative flex flex-1 overflow-hidden"><SpaceBackdrop/><section className="absolute left-6 top-6 z-20 rounded-2xl border border-white/10 bg-[#0b1026]/80 p-5"><p className="text-[#7BDFF2]">{user.nickname}님의 우주</p><LogoutButton/><Link href="/" className="mt-3 block text-sm text-[#b8b8c8]">메인으로 돌아가기</Link><Link href="/diary/new" className="mt-4 inline-block rounded-xl bg-[#ffd166] px-4 py-2 text-sm font-medium text-[#050510]">오늘의 별 만들기</Link></section><UniverseMap/></main>}
