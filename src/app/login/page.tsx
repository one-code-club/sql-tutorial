"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function LoginPage() {
  const router = useRouter();
  const { nickname, setNickname } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (data.exists) {
        setError('その名前はすでに使われています。別の名前を入力してください。');
      } else {
        router.push('/editor');
      }
    } catch (err) {
      setError('エラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-bold">ニックネームを入力</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="例: sakura"
          className="w-full rounded-md border px-3 py-2 text-black"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? '確認中…' : 'はじめる'}
        </button>
      </form>
    </main>
  );
}


