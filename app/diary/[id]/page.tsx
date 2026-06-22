import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const emotionLabel: Record<string,string>={HAPPY:"행복",CALM:"평온",SAD:"슬픔",ANGRY:"화남",EXCITED:"설렘",TIRED:"지침"};
export default async function DiaryDetail({params}:{params:Promise<{id:string}>}){const user=await requireUser();const {id}=await params;const diary=await db.diary.findFirst({where:{id,userId:user.userId},include:{star:true}});if(!diary)notFound();return <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-12"><article className="w-full rounded-3xl border border-white/10 bg-[#0b1026]/80 p-8"><Link href="/universe" className="text-sm text-[#7BDFF2]">← 나의 우주</Link><p className="mt-8 text-sm" style={{color:diary.star?.color}}>{emotionLabel[diary.emotion]}</p><h1 className="mt-2 text-3xl font-semibold">{diary.title}</h1><time className="mt-2 block text-sm text-[#b8b8c8]">{diary.diaryDate.toLocaleDateString("ko-KR",{timeZone:"Asia/Seoul",year:"numeric",month:"long",day:"numeric"})}</time><p className="mt-8 whitespace-pre-wrap leading-8 text-[#e8e8f0]">{diary.content}</p><Link href={`/diary/${diary.id}/edit`} className="mt-8 inline-block rounded-xl border border-[#7BDFF2]/50 px-4 py-2 text-sm text-[#7BDFF2]">이 일기 수정하기</Link></article></main>;}
