import OpenAI from 'openai';
import { ScrapedData, AnalysisResult } from '@/types/analysis';

export async function analyzeECSite(
  url: string,
  scraped: ScrapedData
): Promise<AnalysisResult> {
  const prompt = `あなたはECサイトのコンバージョン率改善（CVR改善）の専門家です。
以下のECサイトの公開情報をもとに、CVR改善の観点で診断してください。
断定ではなく「仮説」として提案し、売上向上を保証する表現は避けてください。

【診断URL】
${url}

【取得したサイト情報】
■ タイトル: ${scraped.title}
■ メタディスクリプション: ${scraped.description}
■ キーワード: ${scraped.keywords}
■ 主要見出し（H1〜H3）: ${scraped.headings.slice(0, 15).join(' / ') || 'なし'}
■ 本文テキスト（抜粋）: ${scraped.mainText.substring(0, 2000)}
■ 商品らしき情報: ${scraped.products.join(' / ') || 'なし'}
■ CTAテキスト: ${scraped.ctas.join(' / ') || 'なし'}
■ 価格表記: ${scraped.prices.join(' / ') || 'なし'}
■ 送料情報: ${scraped.shipping}
■ 返品情報: ${scraped.returns}
■ FAQ: ${scraped.faq}
■ レビュー・口コミ: ${scraped.reviews}

以下の形式でJSONのみを返してください（マークダウンのコードブロックは不要）:

{
  "siteSummary": "サイトの概要（200文字程度。どんなECサイトか、ジャンル、規模感など）",
  "productEstimate": "取り扱い商品の推定（150文字程度）",
  "targetAudience": "想定ターゲット（150文字程度。年齢層、性別、ライフスタイルなど）",
  "strengths": ["強みや良い点1", "強みや良い点2", "強みや良い点3"],
  "concerns": ["購入前の不安・離脱要因1", "離脱要因2", "離脱要因3", "離脱要因4"],
  "improvements": [
    {
      "title": "改善案タイトル（簡潔に）",
      "priority": "High",
      "reason": "なぜ重要か（仮説として・100文字程度）",
      "example": "具体的な改善例・実装イメージ（100文字程度）"
    }
  ],
  "firstViewAdvice": "ファーストビュー改善案（200文字程度）",
  "productPageAdvice": "商品ページ改善案（200文字程度）",
  "ctaAdvice": "CTA改善案（200文字程度）",
  "trustAdvice": "信頼性向上施策（200文字程度）",
  "summary": "レポートまとめ（300文字程度。全体の総評と次のステップ）"
}

improvements はHigh・Medium・Lowを合わせて10個以上作成してください。
High は即効性・影響度が高いもの3〜4個、Medium は中期施策3〜4個、Low は長期・補完的な施策を含めてください。`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'あなたはECサイトのCVR改善専門家です。与えられたサイト情報をもとに、根拠ある改善提案を日本語でJSONとして出力してください。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content || '{}';
  const parsed = JSON.parse(content);

  return {
    url,
    analyzedAt: new Date().toISOString(),
    siteSummary: parsed.siteSummary || '',
    productEstimate: parsed.productEstimate || '',
    targetAudience: parsed.targetAudience || '',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    firstViewAdvice: parsed.firstViewAdvice || '',
    productPageAdvice: parsed.productPageAdvice || '',
    ctaAdvice: parsed.ctaAdvice || '',
    trustAdvice: parsed.trustAdvice || '',
    summary: parsed.summary || '',
  };
}
