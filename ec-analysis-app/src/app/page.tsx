'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@/components/LoadingOverlay';

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validate = () => {
    let valid = true;
    setUrlError('');
    setEmailError('');

    if (!url.trim()) {
      setUrlError('URLを入力してください。');
      valid = false;
    } else if (!isValidUrl(url.trim())) {
      setUrlError('http:// または https:// で始まる正しいURLを入力してください。');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('メールアドレスを入力してください。');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('正しいメールアドレスの形式で入力してください。');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '分析に失敗しました。');
      }

      sessionStorage.setItem('ec-analysis-result', JSON.stringify(data.result));
      sessionStorage.setItem('ec-analysis-email', email.trim());
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay message="ECサイトをAIが診断中..." />}

      <div className="min-h-screen">
        {/* ヘッダー */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                EC
              </div>
              <span className="font-semibold text-gray-800">EC改善診断</span>
            </div>
          </div>
        </header>

        {/* ヒーローセクション */}
        <main className="mx-auto max-w-5xl px-4 py-16">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              AI自動診断 — 無料
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              ECサイトのCVR改善を
              <br />
              <span className="text-indigo-600">AIが自動診断</span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-500">
              URLを入力するだけで、商品・ターゲット・改善ポイントを分析。
              10個以上の具体的な改善案をレポートで受け取れます。
            </p>
          </div>

          {/* フォームカード */}
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-800">無料で診断する</h2>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ECサイトURL
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                    placeholder="https://example.com"
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                      urlError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    メールアドレス
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="your@email.com"
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                      emailError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    PDFレポートの送付目的のみに利用します。
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? '分析中...' : '無料診断する →'}
                </button>
              </form>

              <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  <span className="font-medium text-gray-600">ご注意：</span>
                  取得可能な公開情報をもとにAIが改善案を作成します。結果は仮説であり、成果を保証するものではありません。
                  ログインが必要なページやアクセス制限のあるページは分析できません。
                </p>
              </div>
            </div>

            {/* 特徴 */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '⚡', label: '約30〜60秒', sub: '高速分析' },
                { icon: '🎯', label: '10個以上', sub: '改善案を提案' },
                { icon: '📧', label: 'PDF送付', sub: 'メールで受け取れる' },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-1 text-2xl">{f.icon}</div>
                  <div className="text-sm font-semibold text-gray-800">{f.label}</div>
                  <div className="text-xs text-gray-400">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* フッター */}
        <footer className="mt-20 border-t border-gray-200 bg-white py-6">
          <div className="mx-auto max-w-5xl px-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} EC改善診断 — 本ツールはAIによる自動分析です。
          </div>
        </footer>
      </div>
    </>
  );
}
