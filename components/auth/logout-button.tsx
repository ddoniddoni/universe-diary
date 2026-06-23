"use client";
import { useRouter } from "next/navigation";
export function LogoutButton(){const router=useRouter();async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.replace("/");router.refresh()}return <button onClick={logout} className="text-xs text-[#b8b8c8] hover:text-white">로그아웃</button>}
