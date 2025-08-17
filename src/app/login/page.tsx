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
      setError('Please enter a nickname');
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
        setError('This name is already taken. Please choose a different name.');
      } else {
        router.push('/editor');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-bold">Enter Your Nickname</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. sakura"
          className="w-full rounded-md border px-3 py-2 text-black"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Get Started'}
        </button>
      </form>
    </main>
  );
}


