import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditDiaryForm } from "@/components/diary/edit-diary-form";
export default async function EditDiaryPage({params}:{params:Promise<{id:string}>}){const user=await requireUser();const {id}=await params;const diary=await db.diary.findFirst({where:{id,userId:user.userId}});if(!diary)notFound();return <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-12"><EditDiaryForm diary={{id:diary.id,title:diary.title,content:diary.content,emotion:diary.emotion}}/></main>}
