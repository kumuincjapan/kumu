'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResult } from '@/types/analysis';
import ResultDisplay from '@/components/ResultDisplay';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendError, setSendError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ec-analysis-result');
    const storedEmail = sessionStorage.getItem('ec-analysis-email');
    if (!stored) {
      router.push('/');
      return;
    }
    try {
      setResult(JSON.parse(stored));
      if (storedEmail) setEmail(storedEmail);
    } catch {
      router.push('/');
    }
  }, [router]);

  const generatePdfBlob = async (): Promise<Blob> => {
    if (!resultRef.current || !result) throw new Error('コンテンツが見つかりません');

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(resultRef.current, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let remainingHeight = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
    }

    return pdf.output('blob');
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ec-report-${new URL(result.url).hostname}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF生成に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendPdf = async () => {
    if (!result) return;
    setIsSending(true);
    setSendStatus('idle');
    setSendError('');

    try {
      const blob = await generatePdfBlob();
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const res = await fetch('/api/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pdfBase64, url: result.url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'メール送信に失敗しました');
      setSendStatus('success');
    } catch (err) {
      setSendStatus('error');
      setSendError(err instanceof Error ? err.message : 'メール送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm no-print">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              ← 戻る
            </button>
            <span className="text-sm font-semibold text-gray-800">診断レポート</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isSending}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  生成中...
                </>
              ) : (
                '↓ PDFダウンロード'
              )}
            </button>

            <button
              onClick={handleSendPdf}
              disabled={isGeneratingPdf || isSending}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  送信中...
                </>
              ) : (
                '✉ PDFをメールで受け取る'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* メール送信結果バナー */}
      {sendStatus === 'success' && (
        <div className="border-b border-green-200 bg-green-50 no-print">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <p className="text-sm text-green-700">
              ✓ <span className="font-medium">{email}</span> にPDFレポートを送信しました。
            </p>
          </div>
        </div>
      )}
      {sendStatus === 'error' && (
        <div className="border-b border-red-200 bg-red-50 no-print">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <p className="text-sm text-red-700">✗ {sendError}</p>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div ref={resultRef}>
          <ResultDisplay result={result} />
        </div>

        {/* 下部アクションエリア */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 no-print">
          <h3 className="mb-4 font-semibold text-gray-800">このレポートを共有・保存</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isSending}
              className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {isGeneratingPdf ? 'PDF生成中...' : '↓ PDFをダウンロード'}
            </button>
            <button
              onClick={handleSendPdf}
              disabled={isGeneratingPdf || isSending}
              className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSending ? 'メール送信中...' : `✉ ${email} にPDFを送信`}
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            ブラウザの印刷機能（Ctrl+P / Cmd+P）からPDF保存も可能です。
          </p>
        </div>
      </main>
    </div>
  );
}
