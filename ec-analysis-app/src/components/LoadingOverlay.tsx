'use client';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = '分析中...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-xl">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">{message}</p>
          <p className="mt-1 text-sm text-gray-500">
            サイトの取得とAI分析を行っています。しばらくお待ちください（30〜60秒）
          </p>
        </div>
        <div className="flex gap-2">
          {['サイト取得中', 'AI分析中', 'レポート生成中'].map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700"
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
