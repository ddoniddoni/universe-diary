"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const signup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const nickname = String(formData.get("nickname") ?? "").trim();

    if (signup && (nickname.length < 2 || nickname.length > 20)) return setError("닉네임은 2자 이상 20자 이하로 입력해주세요.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("올바른 이메일 주소를 입력해주세요.");
    if (password.length < 8) return setError("비밀번호는 8자 이상으로 설정해주세요.");

    setError("");
    setIsPending(true);
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, ...(signup ? { nickname } : {}) }) });
    const result = await response.json();
    setIsPending(false);
    if (!response.ok) return setError(result.message ?? "다시 시도해주세요.");
    router.replace("/universe");
    router.refresh();
  }

  return <form noValidate onSubmit={submit} className="space-y-4"><h1 className="text-3xl font-semibold">{signup ? "나만의 우주 만들기" : "다시 만나서 반가워요"}</h1>{signup && <label className="block text-sm">닉네임<input name="nickname" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3" /></label>}<label className="block text-sm">이메일<input name="email" type="email" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3" /></label><label className="block text-sm">비밀번호<input name="password" type="password" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3" /></label>{error && <p role="alert" className="rounded-lg bg-[#ffafcc]/10 px-3 py-2 text-sm text-[#ffafcc]">{error}</p>}<button disabled={isPending} className="w-full rounded-xl bg-[#ffd166] px-4 py-3 font-medium text-[#050510] disabled:opacity-60">{isPending ? "별을 준비하는 중…" : signup ? "회원가입" : "로그인"}</button><p className="text-center text-sm text-[#b8b8c8]">{signup ? "이미 계정이 있나요?" : "처음 오셨나요?"} <Link className="text-[#7BDFF2]" href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link></p></form>;
}
