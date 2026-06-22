import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";
export default async function LoginPage() { if (await getCurrentUser()) redirect("/universe"); return <main className="flex flex-1 items-center justify-center px-6"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1026]/80 p-8"><AuthForm mode="login" /></section></main>; }
