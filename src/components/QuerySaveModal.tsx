"use client";

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sql: string;
};

export function QuerySaveModal({ open, onOpenChange, sql }: Props) {
  const { nickname, setQueries } = useAppStore();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!nickname) return;
    setSaving(true);
    try {
      await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, name, text: sql }),
      });
      const res = await fetch(`/api/queries?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      setQueries(data.queries ?? []);
      onOpenChange(false);
      setName('');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-md bg-white p-4 shadow text-black">
        <h2 className="mb-3 text-lg font-bold">クエリを保存</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="クエリ名"
          className="mb-3 w-full rounded-md border px-3 py-2 text-black placeholder:text-slate-400"
        />
        <div className="flex justify-end gap-2">
          <button
            className="rounded-md border px-3 py-2 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
          >キャンセル</button>
          <button
            className="rounded-md bg-brand-500 px-3 py-2 text-white hover:bg-brand-600 disabled:opacity-60"
            onClick={handleSave}
            disabled={!name || saving}
          >保存</button>
        </div>
      </div>
    </div>
  );
}


