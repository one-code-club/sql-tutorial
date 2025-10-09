"use client";

type ScreenshotGalleryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  nickname: string;
  uploadedAt: string;
};

export function ScreenshotGalleryModal({
  isOpen,
  onClose,
  imageUrl,
  nickname,
  uploadedAt,
}: ScreenshotGalleryModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-slate-300 transition"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 画像 */}
        <img
          src={imageUrl}
          alt={`${nickname}のスクリーンショット`}
          className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
        />

        {/* 情報表示 */}
        <div className="mt-4 rounded-lg bg-slate-800/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              👤 <span className="font-medium text-white">{nickname}</span>
            </span>
            <span className="text-slate-400">{formatDate(uploadedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

