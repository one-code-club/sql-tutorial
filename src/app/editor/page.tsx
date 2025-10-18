"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { WorkspaceSvg } from 'blockly/core';
import { Header } from '@/components/Header';
import { LeftPane } from '@/components/LeftPane';
import { BlocklyEditor, cleanupBlocklyWorkspace } from '@/components/BlocklyEditor';
import { SQLEditor } from '@/components/SQLEditor';
import { ResultGrid } from '@/components/ResultGrid';
import { ScreenshotUploadModal } from '@/components/ScreenshotUploadModal';
// QuerySaveModalのインポートを削除
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
    // queries, setQueriesを削除
    language,
  } = useAppStore();

  const t = useTranslation(language);
  const [sql, setSql] = useState<string>('');
  const [editorType, setEditorType] = useState<EditorType>('block');
  // showSave stateを削除
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [blocklyWorkspace, setBlocklyWorkspace] = useState<WorkspaceSvg | null>(null);

  // エディタ領域と結果領域の横幅比率（Left:Right）。初期は 6:4 ≒ 0.6
  const [editorRatio, setEditorRatio] = useState<number>(0.6);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  // Blockly ワークスペースのXMLを保持して、モード切替時にブロック配置を復元する
  const [blockXml, setBlockXml] = useState<string | null>(null);
  // 前回のモードを保持（テキスト→ブロック切替時はSQLから再構築）
  const prevEditorTypeRef = useRef<EditorType>('block');

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function handleStartResize(e: React.MouseEvent | React.TouchEvent) {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleResizing as any);
    window.addEventListener('mouseup', handleEndResize);
    window.addEventListener('touchmove', handleResizing as any, { passive: false });
    window.addEventListener('touchend', handleEndResize);
    // 直ちに 1 回計算
    handleResizing(e as any);
  }

  function getClientX(ev: MouseEvent | TouchEvent): number {
    // TouchEvent 優先
    // eslint-disable-next-line
    // @ts-ignore: Safari などで TouchEvent の型が曖昧なため安全に参照
    const touches = ev.touches as TouchList | undefined;
    if (touches && touches.length > 0) return touches[0].clientX;
    return (ev as MouseEvent).clientX;
  }

  function handleResizing(e: MouseEvent | TouchEvent) {
    if (!isDraggingRef.current) return;
    if (!containerRef.current) return;
    if ('preventDefault' in e) e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = getClientX(e) - rect.left;
    const ratio = clamp(x / rect.width, 0.2, 0.8); // 左右それぞれ最小20%
    setEditorRatio(ratio);
  }

  function handleEndResize() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleResizing as any);
    window.removeEventListener('mouseup', handleEndResize);
    window.removeEventListener('touchmove', handleResizing as any);
    window.removeEventListener('touchend', handleEndResize);
  }

  function handleEditorTypeChange(type: EditorType) {
    if (editorType !== type) {
      // SQLを消さずにモードだけ切り替える（テキスト→ブロック時はSQLからブロック復元を試行）
      setEditorType(type);
    }
  }

  useEffect(() => {
    prevEditorTypeRef.current = editorType;
  }, [editorType]);

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

  // クエリ取得のuseEffectを削除（118-126行目）

  // SQLキーワードは英語のみ
  const keywordBadges = useMemo(
    () => ['SELECT', 'DISTINCT', '*', 'FROM', 'WHERE', 'AND', 'OR', 'MIN', 'MAX', 'COUNT', 'AVG', 'SUM', 'AS', 'GROUP BY', 'LIMIT', 'ORDER BY', 'ASC', 'DESC'],
    []
  );

  async function handleRun() {
    if (!selectedDB) return;
    // Run 前に自動クリーンアップ（確認ダイアログはスキップ）
    cleanupBlocklyWorkspace(blocklyWorkspace, t.cleanupConfirm, true);
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

  function handleCleanup() {
    cleanupBlocklyWorkspace(blocklyWorkspace, t.cleanupConfirm);
  }

  return (
    <div className="flex h-dvh flex-col bg-transparent text-slate-100 overflow-hidden">
      <Header onUploadClick={() => setShowUploadModal(true)} />
      <div className="grid flex-1 grid-cols-12 gap-3 p-3 overflow-hidden min-h-0">
        <LeftPane
          keywordBadges={keywordBadges}
          columns={columns}
          // onSelectQueryを削除
          editorType={editorType}
        />

        {/* 可変リサイズ領域（エディタ + スプリッター + 結果） */}
        <div ref={containerRef} className="col-span-10 flex items-stretch min-h-0">
          {/* 左: エディタ領域 */}
          <div
            className="flex min-w-0 min-h-0 flex-col gap-3"
            style={{ flexBasis: 0, flexGrow: editorRatio }}
          >
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
              <BlocklyEditor
                value={sql}
                initialXml={prevEditorTypeRef.current === 'text' ? undefined : (blockXml ?? undefined)}
                onWorkspaceXmlChange={setBlockXml}
                onChange={setSql}
                onWorkspaceReady={(ws) => setBlocklyWorkspace(ws)}
                onRun={handleRun}
                runLabel={t.run}
                onCleanup={handleCleanup}
                cleanupLabel={t.cleanup}
              />
            ) : (
              <SQLEditor
                value={sql}
                onChange={setSql}
                onRun={handleRun}
                runLabel={t.run}
              />
            )}
          </div>

          {/* スプリッター */}
          <div
            role="separator"
            aria-orientation="vertical"
            title={t?.dragToResize ?? 'Drag to resize'}
            className="mx-3 h-auto w-[6px] cursor-col-resize select-none rounded bg-slate-700 hover:bg-slate-600"
            onMouseDown={handleStartResize}
            onTouchStart={handleStartResize}
          />

          {/* 右: 結果領域 */}
          <div
            className="min-h-0 min-w-0 flex flex-col"
            style={{ flexBasis: 0, flexGrow: 1 - editorRatio }}
          >
            <div className="flex flex-1 overflow-hidden">
              <ResultGrid rows={result ?? []} loading={loading} error={error} />
            </div>
          </div>
        </div>
      </div>

      {/* スクリーンショットアップロードモーダル */}
      <ScreenshotUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}


