"use client";

import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  runLabel?: string;
  saveLabel?: string;
};

export function SQLEditor({ value, onChange, onRun, onSave, runLabel = 'Run', saveLabel = 'Save' }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 初回マウント時にスクロール位置を(0,0)にリセット
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.scrollTop = 0;
    el.scrollLeft = 0;
  }, []);

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    const { selectionStart, selectionEnd } = e.currentTarget;
    const appended = text.endsWith(' ') ? text : `${text} `; // 末尾に半角スペースを1つ付与
    const newValue = value.slice(0, selectionStart) + appended + value.slice(selectionEnd);
    onChange(newValue.replace(/ {2,}/g, ' ')); // 2つ以上のスペースを1つに正規化
  }

  return (
    <div className="relative h-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/ {2,}/g, ' '))}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`w-full h-full rounded-md border border-slate-700 bg-slate-900 px-6 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${onRun || onSave ? 'pt-12' : ''}`}
        spellCheck={false}
      />

      {(onRun || onSave) && (
        <div className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-2">
          {onRun && (
            <button
              onClick={onRun}
              className="pointer-events-auto rounded-md bg-brand-500 px-12 py-1.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400 hover:shadow-brand-400/40 transition text-sm"
            >
              {runLabel}
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="pointer-events-auto rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 hover:bg-slate-700 text-sm"
            >
              {saveLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
