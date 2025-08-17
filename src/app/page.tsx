"use client";

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/translations';

export default function HomePage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] text-white">{t.homeTitle}</h1>
      <p className="text-slate-300">{t.homeSubtitle}</p>
      <Link
        href="/login"
        className="rounded-md bg-brand-500 px-5 py-2.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400 hover:shadow-brand-400/40 transition"
      >
        {t.getStarted}
      </Link>
    </main>
  );
}


