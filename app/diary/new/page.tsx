import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DiaryForm } from "@/components/diary/diary-form";

export default async function NewDiaryPage() { if (!await getCurrentUser()) redirect("/login"); return <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-12"><DiaryForm /></main>; }
