"use client";

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

export function Header() {
  const { nickname, resetAll } = useAppStore();
  return (
    <header className="flex items-center justify-between border-b border-slate-700/60 bg-slate-900/60 backdrop-blur px-4 py-3">
      <Link href="/" className="text-lg font-bold text-slate-100">SQL Tutorial</Link>
      <div className="flex items-center gap-3">
        {nickname && <span className="text-sm text-slate-300">👤 {nickname}</span>}
        <button
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 hover:bg-slate-700"
          onClick={resetAll}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}


