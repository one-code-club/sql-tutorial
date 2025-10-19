"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/translations';

type HeaderProps = {
  onUploadClick?: () => void;
};

export function Header({ onUploadClick }: HeaderProps = {} as HeaderProps) {
  const router = useRouter();
  const { nickname, language, setLanguage, resetAll } = useAppStore();
  const t = useTranslation(language);
  
  const handleLogout = () => {
    resetAll();
    router.push('/login');
  };
  
  return (
    <header className="flex items-center justify-between border-b border-slate-700/60 bg-slate-900/60 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-bold text-slate-100">{t.appTitle}</Link>
        
        {/* ギャラリーメニュー */}
        {nickname && (
          <>
            <Link
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              📸 {t.gallery}
            </Link>
            
            {/* Upload a screen-shotボタン */}
            {/* {onUploadClick && (
              <button
                onClick={onUploadClick}
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-400 transition shadow-lg shadow-brand-500/20"
              >
                {t.uploadScreenshot}
              </button>
            )} */}
          </>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* 言語切り替えトグル */}
        <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 text-xs rounded ${language === 'en' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ja')}
            className={`px-2 py-1 text-xs rounded ${language === 'ja' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
          >
            日本語
          </button>
        </div>
        {nickname && <span className="text-sm text-slate-300">👤 {nickname}</span>}
        <button
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 hover:bg-slate-700"
          onClick={handleLogout}
        >
          {t.logout}
        </button>
      </div>
    </header>
  );
}


