"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ScreenshotGalleryModal } from '@/components/ScreenshotGalleryModal';
import { ScreenshotUploadModal } from '@/components/ScreenshotUploadModal';

type Screenshot = {
  id: string;
  nickname: string;
  url: string;
  uploadedAt: string;
  fileName: string;
};

export default function GalleryPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      const response = await fetch('/api/screenshots/list');
      if (!response.ok) throw new Error('取得に失敗しました');
      
      const data = await response.json();
      setScreenshots(data.screenshots || []);
    } catch (error) {
      console.error('スクリーンショット取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // アップロード成功後に一覧を再取得
    fetchScreenshots();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onUploadClick={() => setShowUploadModal(true)} />
      
      <main className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="mx-auto max-w-7xl">
          {/* ページタイトル */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">📸 スクリーンショットギャラリー</h1>
            <p className="text-slate-400">みんなのスクリーンショットを見てみよう</p>
          </div>

          {/* ローディング */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-400">読み込み中...</div>
            </div>
          )}

          {/* スクリーンショットがない場合 */}
          {!loading && screenshots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <svg
                className="h-24 w-24 text-slate-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-slate-400 text-lg">まだスクリーンショットがアップロードされていません</p>
              <p className="text-slate-500 text-sm mt-2">最初のスクリーンショットをアップロードしてみましょう！</p>
            </div>
          )}

          {/* グリッド表示 */}
          {!loading && screenshots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg bg-slate-800 shadow-lg transition hover:shadow-2xl hover:scale-105"
                  onClick={() => setSelectedScreenshot(screenshot)}
                >
                  {/* 画像 */}
                  <div className="aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={screenshot.url}
                      alt={`${screenshot.nickname}のスクリーンショット`}
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  </div>

                  {/* 情報オーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-medium mb-1">👤 {screenshot.nickname}</p>
                      <p className="text-slate-300 text-sm">{formatDate(screenshot.uploadedAt)}</p>
                    </div>
                  </div>

                  {/* カード下部の情報（常に表示） */}
                  <div className="p-3 border-t border-slate-700">
                    <p className="text-white text-sm font-medium truncate">👤 {screenshot.nickname}</p>
                    <p className="text-slate-400 text-xs mt-1">{formatDate(screenshot.uploadedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 拡大表示モーダル */}
      {selectedScreenshot && (
        <ScreenshotGalleryModal
          isOpen={!!selectedScreenshot}
          onClose={() => setSelectedScreenshot(null)}
          imageUrl={selectedScreenshot.url}
          nickname={selectedScreenshot.nickname}
          uploadedAt={selectedScreenshot.uploadedAt}
        />
      )}

      {/* スクリーンショットアップロードモーダル */}
      <ScreenshotUploadModal 
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          handleUploadSuccess();
        }}
      />
    </div>
  );
}

