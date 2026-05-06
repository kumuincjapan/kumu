import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ECサイト改善診断 | AIが自動分析',
  description:
    'ECサイトのURLを入力するだけで、AIがCVR改善のポイントを自動診断。改善案10個以上をレポート形式で提供します。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
