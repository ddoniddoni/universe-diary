"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isLoggingOut}
      className="rounded-xl px-3 py-2 text-sm text-[#d8d9e8] transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      {isLoggingOut ? "로그아웃 중" : "로그아웃"}
    </button>
  );
}
