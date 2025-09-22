"use client";

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { LeftPane } from '@/components/LeftPane';
import { BlocklyEditor } from '@/components/BlocklyEditor';
import { SQLEditor } from '@/components/SQLEditor';
import { ResultGrid } from '@/components/ResultGrid';
import { QuerySaveModal } from '@/components/QuerySaveModal';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/translations';

type EditorType = 'block' | 'text';

export default function EditorPage() {
  const {
    nickname,
    selectedDB,
    setSelectedDB,
    columns,
    setColumns,
    queries,
    setQueries,
    language,
  } = useAppStore();

  const t = useTranslation(language);
  const [sql, setSql] = useState<string>('');
  const [editorType, setEditorType] = useState<EditorType>('block');
  const [showSave, setShowSave] = useState(false);
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleEditorTypeChange(type: EditorType) {
    if (editorType !== type) {
      setSql('');
      setEditorType(type);
    }
  }

  useEffect(() => {
    async function loadFiles() {
      const res = await fetch('/api/files');
      const data: { files: string[] } = await res.json();
      if (!selectedDB && data.files[0]) setSelectedDB(data.files[0]);
    }
    loadFiles();
  }, [selectedDB, setSelectedDB]);

  useEffect(() => {
    async function loadColumns() {
      if (!selectedDB) return;
      const res = await fetch(`/api/files?db=${encodeURIComponent(selectedDB)}`);
      const data: { columns: string[] } = await res.json();
      setColumns(data.columns);
    }
    loadColumns();
  }, [selectedDB, setColumns]);

  useEffect(() => {
    async function fetchQueries() {
      if (!nickname) return;
      const res = await fetch(`/api/queries?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      setQueries(data.queries ?? []);
    }
    fetchQueries();
  }, [nickname, setQueries]);

  // SQLキーワードは英語のみ
  const keywordBadges = useMemo(
    () => ['SELECT', 'DISTINCT', '*', 'FROM', 'WHERE', 'AND', 'OR', 'MIN', 'MAX', 'COUNT', 'GROUP BY', 'LIMIT', 'ORDER BY', 'ASC', 'DESC'],
    []
  );

  async function handleRun() {
    if (!selectedDB) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, dbName: selectedDB }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult([]);
        setError(String(data.error ?? t.sqlExecutionError));
      } else {
        setError(null);
        setResult(data.rows ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-transparent text-slate-100">
      <Header />
      <div className="grid flex-1 grid-cols-12 gap-3 p-3">
        <LeftPane
          keywordBadges={keywordBadges}
          columns={columns}
          onSelectQuery={setSql}
          editorType={editorType}
        />

        <div className="col-span-6 flex flex-col gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              {t.editorTypeLabel}
            </label>
            <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 p-1 w-fit">
              <button
                onClick={() => handleEditorTypeChange('block')}
                className={`px-3 py-1 text-sm rounded-md ${editorType === 'block' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                {t.blockEditor}
              </button>
              <button
                onClick={() => handleEditorTypeChange('text')}
                className={`px-3 py-1 text-sm rounded-md ${editorType === 'text' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                {t.textEditor}
              </button>
            </div>
          </div>

          {editorType === 'block' ? (
            <BlocklyEditor value={sql} onChange={setSql} />
          ) : (
            <SQLEditor value={sql} onChange={setSql} />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              className="rounded-md bg-brand-500 px-4 py-2 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400 hover:shadow-brand-400/40 transition"
            >
              {t.run}
            </button>
            <button
              onClick={() => setShowSave(true)}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 hover:bg-slate-700"
            >
              {t.save}
            </button>
          </div>
        </div>

        <div className="col-span-4">
          <ResultGrid rows={result ?? []} loading={loading} error={error} />
        </div>
      </div>

      <QuerySaveModal open={showSave} onOpenChange={setShowSave} sql={sql} />
    </div>
  );
}


