"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authFormSchema } from "@/lib/validation/auth";

type AuthFormValues = z.infer<typeof authFormSchema>;
const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-[#7BDFF2]";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter(); const signup = mode === "signup";
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<AuthFormValues>({ resolver: zodResolver(authFormSchema), mode: "onBlur" });
  const submit = async (values: AuthFormValues) => { if (signup && !values.nickname) return setError("nickname", { message: "닉네임을 입력해주세요." }); const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const result = await response.json(); if (!response.ok) return setError("root", { message: result.message ?? "잠시 후 다시 시도해주세요." }); router.replace("/universe"); router.refresh(); };
  return <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4"><h1 className="text-3xl font-semibold">{signup ? "나만의 우주 만들기" : "다시 만나서 반가워요"}</h1>{signup && <Field label="닉네임" error={errors.nickname?.message}><input {...register("nickname")} className={inputClass} /></Field>}<Field label="이메일" error={errors.email?.message}><input {...register("email")} type="email" className={inputClass} /></Field><Field label="비밀번호" hint="8자 이상" error={errors.password?.message}><input {...register("password")} type="password" className={inputClass} /></Field>{errors.root && <p role="alert" className="rounded-lg bg-[#ffafcc]/10 px-3 py-2 text-sm text-[#ffafcc]">{errors.root.message}</p>}<button disabled={isSubmitting} className="w-full rounded-xl bg-[#ffd166] px-4 py-3 font-medium text-[#050510] disabled:opacity-60">{isSubmitting ? "별을 준비하는 중…" : signup ? "회원가입" : "로그인"}</button><p className="text-center text-sm text-[#b8b8c8]">{signup ? "이미 계정이 있나요?" : "처음 오셨나요?"} <Link className="text-[#7BDFF2]" href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link></p></form>;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm">{label}{hint && <span className="ml-2 text-xs text-[#b8b8c8]">{hint}</span>}{children}{error && <p role="alert" className="mt-2 text-sm text-[#ffafcc]">{error}</p>}</label>; }
