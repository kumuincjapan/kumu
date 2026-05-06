'use client';

import { AnalysisResult, Improvement } from '@/types/analysis';
import ImprovementCard from './ImprovementCard';

interface ResultDisplayProps {
  result: AnalysisResult;
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ListItems({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-0.5 flex-shrink-0 text-indigo-500">▸</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AdviceBox({ content }: { content: string }) {
  return (
    <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
      {content}
    </p>
  );
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const analyzedDate = new Date(result.analyzedAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const highPriority = result.improvements.filter((i: Improvement) => i.priority === 'High');
  const mediumPriority = result.improvements.filter((i: Improvement) => i.priority === 'Medium');
  const lowPriority = result.improvements.filter((i: Improvement) => i.priority === 'Low');

  return (
    <div id="result-content" className="space-y-6">
      {/* ヘッダー情報 */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-600 p-6 text-white shadow-sm">
        <p className="mb-1 text-sm text-indigo-200">診断URL</p>
        <p className="mb-4 break-all text-base font-semibold">{result.url}</p>
        <p className="text-sm text-indigo-200">分析日時: {analyzedDate}</p>
      </div>

      {/* サイト概要 */}
      <Section title="サイト概要" icon="🏪">
        <p className="text-sm leading-relaxed text-gray-700">{result.siteSummary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              取り扱い商品（推定）
            </p>
            <p className="text-sm text-gray-700">{result.productEstimate}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              想定ターゲット
            </p>
            <p className="text-sm text-gray-700">{result.targetAudience}</p>
          </div>
        </div>
      </Section>

      {/* 強みと懸念点 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="現在の強み" icon="✅">
          <ListItems items={result.strengths} />
        </Section>
        <Section title="購入前の不安・離脱要因（仮説）" icon="⚠️">
          <ListItems items={result.concerns} />
        </Section>
      </div>

      {/* 改善案 - High */}
      {highPriority.length > 0 && (
        <Section title="改善案 — 優先度 High（即効施策）" icon="🔴">
          <div className="space-y-3">
            {highPriority.map((imp, i) => (
              <ImprovementCard key={i} improvement={imp} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* 改善案 - Medium */}
      {mediumPriority.length > 0 && (
        <Section title="改善案 — 優先度 Medium（中期施策）" icon="🟡">
          <div className="space-y-3">
            {mediumPriority.map((imp, i) => (
              <ImprovementCard key={i} improvement={imp} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* 改善案 - Low */}
      {lowPriority.length > 0 && (
        <Section title="改善案 — 優先度 Low（長期・補完施策）" icon="🔵">
          <div className="space-y-3">
            {lowPriority.map((imp, i) => (
              <ImprovementCard key={i} improvement={imp} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* 各セクション別アドバイス */}
      <Section title="セクション別 改善アドバイス" icon="📝">
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-600">ファーストビュー</p>
            <AdviceBox content={result.firstViewAdvice} />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-600">商品ページ</p>
            <AdviceBox content={result.productPageAdvice} />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-600">CTA（購入ボタン等）</p>
            <AdviceBox content={result.ctaAdvice} />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-600">信頼性向上</p>
            <AdviceBox content={result.trustAdvice} />
          </div>
        </div>
      </Section>

      {/* まとめ */}
      <Section title="診断まとめ" icon="📋">
        <p className="text-sm leading-relaxed text-gray-700">{result.summary}</p>
      </Section>

      {/* 免責事項 */}
      <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
        本レポートはAIが公開情報をもとに生成した仮説・提案です。成果を保証するものではありません。
        施策実施の際は、実際のデータ分析や専門家への相談も合わせてご検討ください。
      </div>
    </div>
  );
}
