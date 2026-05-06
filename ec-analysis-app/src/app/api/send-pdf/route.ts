import { NextRequest, NextResponse } from 'next/server';
import { sendReportEmail } from '@/lib/email';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, pdfBase64, url } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください。' }, { status: 400 });
    }
    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      return NextResponse.json({ error: 'PDFデータが見つかりません。' }, { status: 400 });
    }
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URLが見つかりません。' }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    await sendReportEmail({ to: email, url, pdfBuffer });

    return NextResponse.json({ message: 'メールを送信しました。' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'メール送信に失敗しました';
    return NextResponse.json({ error: `メール送信エラー: ${message}` }, { status: 500 });
  }
}

export const maxDuration = 30;
