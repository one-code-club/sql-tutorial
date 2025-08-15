"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

type Props = {
  keywordBadges: string[];
  columns: string[];
  onSelectQuery: (text: string) => void;
};

export function LeftPane({ keywordBadges, columns, onSelectQuery }: Props) {
  const { selectedDB, setSelectedDB, queries, setQueries, nickname } = useAppStore();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    async function loadFiles() {
      const res = await fetch('/api/files');
      const data: { files: string[] } = await res.json();
      setFiles(data.files);
    }
    loadFiles();
  }, []);

  function handleDragStart(e: React.DragEvent<HTMLSpanElement>, text: string) {
    e.dataTransfer.setData('text/plain', text);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/queries?id=${encodeURIComponent(id)}&nickname=${encodeURIComponent(nickname ?? '')}`, {
      method: 'DELETE',
    });
    const res = await fetch(`/api/queries?nickname=${encodeURIComponent(nickname ?? '')}`);
    const data = await res.json();
    setQueries(data.queries ?? []);
  }

  return (
    <aside className="col-span-2 flex flex-col gap-3">
      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <label className="mb-2 block text-sm font-medium text-slate-200">DBを選択</label>
        <select
          value={selectedDB ?? ''}
          onChange={(e) => setSelectedDB(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-slate-100"
        >
          <option value="" disabled>選択してください</option>
          {files.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {selectedDB && (
          <div className="mt-2">
            <span
              draggable
              onDragStart={(e) => handleDragStart(e, selectedDB)}
              className="badge badge-db cursor-grab select-none"
              title="ドラッグしてエディタに挿入"
            >
              {selectedDB}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <div className="mb-2 text-sm font-medium text-slate-200">SQLキーワード</div>
        <div className="flex flex-wrap gap-2">
          {keywordBadges.map((k) => (
            <span
              key={k}
              draggable
              onDragStart={(e) => handleDragStart(e, k)}
              className="badge badge-keyword cursor-grab select-none"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <div className="mb-2 text-sm font-medium text-slate-200">カラム</div>
        <div className="flex flex-wrap gap-2">
          {columns.map((c) => (
            <span
              key={c}
              draggable
              onDragStart={(e) => handleDragStart(e, c)}
              className="badge badge-column cursor-grab select-none"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <div className="mb-2 text-sm font-medium text-slate-200">保存済みクエリ</div>
        <ul className="space-y-2 text-slate-100">
          {queries.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-2">
              <button
                className="truncate text-sm text-brand-400 hover:underline text-left"
                onClick={() => onSelectQuery(q.text)}
                title="クリックでエディタに読み込み"
              >
                {q.name}
              </button>
              <button
                onClick={() => handleDelete(q.id)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
              >削除</button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}