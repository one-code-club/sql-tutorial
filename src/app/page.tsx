import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] text-white">SQL Tutorial</h1>
      <p className="text-slate-300">小中学生向けの SQL 学習アプリ</p>
      <Link
        href="/login"
        className="rounded-md bg-brand-500 px-5 py-2.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400 hover:shadow-brand-400/40 transition"
      >
        はじめる
      </Link>
    </main>
  );
}


