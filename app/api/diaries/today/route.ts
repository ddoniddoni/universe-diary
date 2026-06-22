import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayDiaryDate } from "@/lib/date";
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({message:"로그인이 필요합니다."},{status:401});const diary=await db.diary.findUnique({where:{userId_diaryDate:{userId:user.userId,diaryDate:getTodayDiaryDate()}},select:{id:true}});return NextResponse.json({written:Boolean(diary),diaryId:diary?.id??null});}
