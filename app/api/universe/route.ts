import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayDiaryDate } from "@/lib/date";
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({message:"로그인이 필요합니다."},{status:401});const [stars,galaxies,today]=await Promise.all([db.star.findMany({where:{userId:user.userId},include:{diary:{select:{id:true,title:true,diaryDate:true}}}}),db.galaxy.findMany({where:{userId:user.userId,isCompleted:true},orderBy:[{year:"desc"},{month:"desc"}]}),db.diary.findUnique({where:{userId_diaryDate:{userId:user.userId,diaryDate:getTodayDiaryDate()}},select:{id:true}})]);return NextResponse.json({user:{id:user.userId,nickname:user.nickname},stars,galaxies,todayDiaryId:today?.id??null});}
