"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

type ScreenshotUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ScreenshotUploadModal({ isOpen, onClose }: ScreenshotUploadModalProps) {
  const { nickname } = useAppStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // モーダルが閉じたらリセット
      setImageFile(null);
      setPreviewUrl(null);
      setUploadSuccess(false);
    }
  }, [isOpen]);

  // クリップボードから画像を貼り付け
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          // ファイル名を生成
          const fileName = `screenshot-${Date.now()}.png`;
          const file = new File([blob], fileName, { type: blob.type });
          
          setImageFile(file);
          
          // プレビュー用のURLを作成
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
        break;
      }
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !nickname) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('nickname', nickname);

      const response = await fetch('/api/screenshots/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }

      setUploadSuccess(true);
      
      // 2秒後にモーダルを閉じる
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg bg-slate-800 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">スクリーンショットをアップロード</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            disabled={isUploading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* ユーザー名表示 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">アップロード者</label>
            <div className="rounded-md bg-slate-700/50 px-4 py-2 text-white">
              👤 {nickname}
            </div>
          </div>

          {/* 貼り付けエリア */}
          {!uploadSuccess ? (
            <>
              <div
                ref={pasteAreaRef}
                onPaste={handlePaste}
                tabIndex={0}
                className="relative mb-4 min-h-[300px] rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/50 p-6 focus:border-brand-500 focus:outline-none transition"
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="プレビュー"
                      className="max-h-[400px] max-w-full rounded-lg shadow-lg"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setPreviewUrl(null);
                      }}
                      className="mt-4 text-sm text-slate-400 hover:text-white"
                    >
                      画像をクリア
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <svg
                      className="h-16 w-16 text-slate-600 mb-4"
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
                    <p className="text-slate-300 mb-2">このエリアをクリックして、</p>
                    <p className="text-slate-300 mb-4">Ctrl+V（または Cmd+V）で画像を貼り付けてください</p>
                    <p className="text-sm text-slate-500">PNG、JPG、GIF形式に対応</p>
                  </div>
                )}
              </div>

              {/* アップロードボタン */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-md border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
                  disabled={isUploading}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!imageFile || isUploading}
                  className="rounded-md bg-brand-500 px-6 py-2 text-white hover:bg-brand-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? 'アップロード中...' : '送信'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg text-white font-medium">アップロード完了！</p>
              <p className="text-sm text-slate-400 mt-2">ギャラリーで確認できます</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

