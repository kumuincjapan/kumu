import Anthropic from '@anthropic-ai/sdk';
import { ScrapedData, AnalysisResult } from '@/types/analysis';

const analysisToolSchema = {
  name: 'report_ec_analysis',
  description: 'ECサイトのCVR改善診断レポートを構造化データとして出力する',
  input_schema: {
    type: 'object' as const,
    properties: {
      siteSummary: { type: 'string', description: 'サイトの概要（200文字程度）' },
      productEstimate: { type: 'string', description: '取り扱い商品の推定（150文字程度）' },
      targetAudience: { type: 'string', description: '想定ターゲット（150文字程度）' },
      strengths: { type: 'array', items: { type: 'string' }, description: '強みや良い点（3個以上）' },
      concerns: { type: 'array', items: { type: 'string' }, description: '購入前の不安・離脱要因（4個以上）' },
      improvements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
            reason: { type: 'string' },
            example: { type: 'string' },
          },
          required: ['title', 'priority', 'reason', 'example'],
        },
        description: 'High 3〜4個・Medium 3〜4個・Low 3〜4個、合計10個以上',
      },
      firstViewAdvice: { type: 'string', description: 'ファーストビュー改善案（200文字程度）' },
      productPageAdvice: { type: 'string', description: '商品ページ改善案（200文字程度）' },
      ctaAdvice: { type: 'string', description: 'CTA改善案（200文字程度）' },
      trustAdvice: { type: 'string', description: '信頼性向上施策（200文字程度）' },
      summary: { type: 'string', description: 'レポートまとめ（300文字程度）' },
    },
    required: [
      'siteSummary', 'productEstimate', 'targetAudience', 'strengths', 'concerns',
      'improvements', 'firstViewAdvice', 'productPageAdvice', 'ctaAdvice', 'trustAdvice', 'summary',
    ],
  },
};

export async function analyzeECSite(
  url: string,
  scraped: ScrapedData
): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userPrompt = `以下のECサイトの公開情報をもとに、CVR改善の観点で診断してください。
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

improvements はHigh・Medium・Lowを合わせて10個以上作成してください。
High は即効性・影響度が高いもの3〜4個、Medium は中期施策3〜4個、Low は長期・補完的な施策を含めてください。

report_ec_analysis ツールを使って診断結果を出力してください。`;

  const stream = await client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: 'あなたはECサイトのCVR改善専門家です。与えられたサイト情報をもとに、根拠ある改善提案を日本語で行ってください。',
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [analysisToolSchema],
    tool_choice: { type: 'any' },
    messages: [{ role: 'user', content: userPrompt }],
  });

  const response = await stream.finalMessage();

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('AIからの構造化レスポンスが取得できませんでした');
  }

  const parsed = toolUse.input as Record<string, unknown>;

  return {
    url,
    analyzedAt: new Date().toISOString(),
    siteSummary: (parsed.siteSummary as string) || '',
    productEstimate: (parsed.productEstimate as string) || '',
    targetAudience: (parsed.targetAudience as string) || '',
    strengths: Array.isArray(parsed.strengths) ? (parsed.strengths as string[]) : [],
    concerns: Array.isArray(parsed.concerns) ? (parsed.concerns as string[]) : [],
    improvements: Array.isArray(parsed.improvements)
      ? (parsed.improvements as AnalysisResult['improvements'])
      : [],
    firstViewAdvice: (parsed.firstViewAdvice as string) || '',
    productPageAdvice: (parsed.productPageAdvice as string) || '',
    ctaAdvice: (parsed.ctaAdvice as string) || '',
    trustAdvice: (parsed.trustAdvice as string) || '',
    summary: (parsed.summary as string) || '',
  };
}
