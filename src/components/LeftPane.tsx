"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/translations';

type Props = {
  keywordBadges: string[];
  columns: string[];
  editorType: 'block' | 'text';
};

export function LeftPane({ keywordBadges, columns, editorType }: Props) {
  const { selectedDB, setSelectedDB, language } = useAppStore();
  const t = useTranslation(language);
  const [files, setFiles] = useState<string[]>([]);
  const [showKeywords, setShowKeywords] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      const res = await fetch('/api/files');
      const data: { files: string[] } = await res.json();
      setFiles(data.files);
    }
    loadFiles();
  }, []);

  function handleDragStart(e: React.DragEvent<HTMLSpanElement>, text: string, blockType?: 'sql_table' | 'sql_column') {
    if (editorType === 'block' && blockType) {
        const data = JSON.stringify({ blockType, value: text });
        e.dataTransfer.setData('text/plain', data);
    } else {
        e.dataTransfer.setData('text/plain', text);
    }
  }

  return (
    <aside className="col-span-2 flex flex-col gap-3">
      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <label className="mb-2 block text-sm font-medium text-slate-200">{t.selectDB}</label>
        <select
          value={selectedDB ?? ''}
          onChange={(e) => setSelectedDB(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-slate-100"
        >
          <option value="" disabled>{t.selectPlaceholder}</option>
          {files.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {selectedDB && (
          <div className="mt-2">
            <span
              draggable
              onDragStart={(e) => handleDragStart(e, selectedDB, 'sql_table')}
              className="badge badge-db cursor-grab select-none"
              title={t.dragToEditor}
            >
              {selectedDB}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowKeywords((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-slate-200"
            aria-expanded={showKeywords}
            aria-controls="sql-keywords-panel"
         >
            <svg
              viewBox="0 0 12 12"
              className={`h-3 w-3 transform transition-transform ${showKeywords ? 'rotate-90' : ''}`}
              aria-hidden="true"
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.sqlKeywords}
          </button>
        </div>
        {showKeywords && (
          <div id="sql-keywords-panel" className="flex flex-wrap gap-2">
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
        )}
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
        <div className="mb-2 text-sm font-medium text-slate-200">{t.columns}</div>
        <div className="flex flex-wrap gap-2">
          {columns.map((c) => (
            <span
              key={c}
              draggable
              onDragStart={(e) => handleDragStart(e, c, 'sql_column')}
              className="badge badge-column cursor-grab select-none"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}