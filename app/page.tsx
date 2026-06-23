import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const decorativeStars = ["left-[9%] top-[20%]", "left-[18%] top-[70%]", "left-[33%] top-[14%]", "right-[23%] top-[27%]", "right-[10%] top-[62%]", "right-[35%] bottom-[14%]"];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_18%,#31205d_0%,#101331_40%,#03040d_78%)] px-6 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a78bfa]/10 shadow-[0_0_120px_30px_rgba(124,58,237,0.18)]" />
        {decorativeStars.map((position, index) => <i key={position} className={`absolute size-1.5 rounded-full bg-white/80 shadow-[0_0_14px_4px_rgba(200,220,255,.45)] ${position}`} style={{ animationDelay: `${index * 0.6}s` }} />)}
      </div>
      <section className="relative max-w-2xl">
        <p className="mb-5 text-xs font-medium tracking-[0.38em] text-[#7bdff2] sm:text-sm">UNIVERSE DIARY</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">하루의 기록이 별이 되는 곳</h1>
        <p className="mt-6 text-base leading-8 text-[#c2c2d2] sm:text-lg">매일의 다이어리로 오직 나만의 우주를 만들어보세요.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link className="rounded-full bg-[#ffd166] px-6 py-3 font-semibold text-[#11111d] shadow-[0_0_32px_rgba(255,209,102,.32)] transition hover:-translate-y-0.5 hover:bg-[#ffe29a]" href="/universe">
              {user.nickname}님의 우주로 가기
            </Link>
          ) : (
            <>
              <Link className="rounded-full bg-[#ffd166] px-6 py-3 font-semibold text-[#11111d] shadow-[0_0_32px_rgba(255,209,102,.32)] transition hover:-translate-y-0.5 hover:bg-[#ffe29a]" href="/signup">우주 만들기</Link>
              <Link className="rounded-full border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10" href="/login">로그인</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
