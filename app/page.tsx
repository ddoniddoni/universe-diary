import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#1a103d_0%,#0b1026_38%,#050510_76%)] px-6 text-center">
      <section className="max-w-2xl">
        <p className="mb-5 text-sm tracking-[0.3em] text-[#7BDFF2]">
          UNIVERSE DIARY
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          하루의 기록이 별이 되는 곳
        </h1>
        <p className="mt-6 text-lg leading-8 text-[#b8b8c8]">
          매일의 다이어리로 나만의 우주를 만들어보세요.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            className="rounded-full bg-[#ffd166] px-6 py-3 font-medium text-[#050510] transition hover:bg-[#ffe29a]"
            href="/signup"
          >
            우주 만들기
          </Link>
          <Link
            className="rounded-full border border-white/20 px-6 py-3 font-medium transition hover:bg-white/10"
            href="/login"
          >
            로그인
          </Link>
        </div>
      </section>
    </main>
  );
}
