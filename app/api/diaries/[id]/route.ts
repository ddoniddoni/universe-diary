import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EMOTION_STAR_COLORS } from "@/lib/star";
const schema=z.object({title:z.string().trim().min(1).max(50),content:z.string().trim().min(1).max(5000),emotion:z.enum(["HAPPY","CALM","SAD","ANGRY","EXCITED","TIRED"])});
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const user=await getCurrentUser();if(!user)return NextResponse.json({message:"로그인이 필요합니다."},{status:401});const {id}=await params;const diary=await db.diary.findFirst({where:{id,userId:user.userId},include:{star:true}});if(!diary)return NextResponse.json({message:"일기를 찾을 수 없습니다."},{status:404});return NextResponse.json({diary});}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const user=await getCurrentUser();if(!user)return NextResponse.json({message:"로그인이 필요합니다."},{status:401});const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({message:"입력값을 확인해주세요."},{status:400});const {id}=await params;const diary=await db.diary.findFirst({where:{id,userId:user.userId}});if(!diary)return NextResponse.json({message:"일기를 찾을 수 없습니다."},{status:404});const updated=await db.$transaction(async tx=>{const item=await tx.diary.update({where:{id},data:parsed.data});await tx.star.update({where:{diaryId:id},data:{emotion:parsed.data.emotion,color:EMOTION_STAR_COLORS[parsed.data.emotion]}});return item;});return NextResponse.json({diary:updated});}
