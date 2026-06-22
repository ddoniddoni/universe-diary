"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter(); const [error, setError] = useState(""); const [isPending, setIsPending] = useState(false);
  const signup = mode === "signup";
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setIsPending(true); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const result = await response.json(); setIsPending(false); if (!response.ok) return setError(result.message ?? "다시 시도해주세요."); router.replace("/universe"); router.refresh(); }
  return <form onSubmit={submit} className="space-y-4"><h1 className="text-3xl font-semibold">{signup ? "나만의 우주 만들기" : "다시 만나서 반가워요"}</h1>{signup && <label className="block text-sm">닉네임<input required name="nickname" minLength={2} maxLength={20} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3" /></label>}<label className="block text-sm">이메일<input required name="email" type="email" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3" /></label><label className="block text-sm">비밀번호<input required name="password" type="password" minLength={8} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3" /></label>{error && <p className="text-sm text-[#ffafcc]">{error}</p>}<button disabled={isPending} className="w-full rounded-xl bg-[#ffd166] px-4 py-3 font-medium text-[#050510] disabled:opacity-60">{isPending ? "별을 준비하는 중…" : signup ? "회원가입" : "로그인"}</button><p className="text-center text-sm text-[#b8b8c8]">{signup ? "이미 계정이 있나요?" : "처음 오셨나요?"} <Link className="text-[#7BDFF2]" href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link></p></form>;
}
