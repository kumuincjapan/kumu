import { NextRequest, NextResponse } from 'next/server';
import { scrapeECSite } from '@/lib/scraper';
import { analyzeECSite } from '@/lib/openai';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, email } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URLを入力してください。' }, { status: 400 });
    }
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: '有効なURL（http://またはhttps://で始まる形式）を入力してください。' },
        { status: 400 }
      );
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'メールアドレスを入力してください。' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください。' }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'サーバー設定エラー: OpenAI APIキーが設定されていません。' },
        { status: 500 }
      );
    }

    // スクレイピング
    let scrapedData;
    try {
      scrapedData = await scrapeECSite(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'サイト情報の取得に失敗しました';
      return NextResponse.json(
        { error: `サイトの取得に失敗しました: ${message}` },
        { status: 422 }
      );
    }

    // AI分析
    let result;
    try {
      result = await analyzeECSite(url, scrapedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI分析に失敗しました';
      return NextResponse.json({ error: `AI分析エラー: ${message}` }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: '予期しないエラーが発生しました。' }, { status: 500 });
  }
}

export const maxDuration = 60;
