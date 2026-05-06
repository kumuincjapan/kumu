import { Improvement } from '@/types/analysis';

interface ImprovementCardProps {
  improvement: Improvement;
  index: number;
}

const priorityConfig = {
  High: {
    label: 'High',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    border: 'border-l-red-500',
    dot: 'bg-red-500',
  },
  Medium: {
    label: 'Medium',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    border: 'border-l-amber-500',
    dot: 'bg-amber-500',
  },
  Low: {
    label: 'Low',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    border: 'border-l-blue-500',
    dot: 'bg-blue-400',
  },
};

export default function ImprovementCard({ improvement, index }: ImprovementCardProps) {
  const config = priorityConfig[improvement.priority] || priorityConfig['Low'];

  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${config.border}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
            {index + 1}
          </span>
          <h3 className="font-semibold text-gray-800">{improvement.title}</h3>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
        >
          {config.label}
        </span>
      </div>
      <div className="space-y-2 pl-8">
        <div>
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
            理由（仮説）
          </p>
          <p className="text-sm text-gray-600">{improvement.reason}</p>
        </div>
        <div>
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
            改善例
          </p>
          <p className="rounded bg-gray-50 px-3 py-2 text-sm text-gray-700">{improvement.example}</p>
        </div>
      </div>
    </div>
  );
}
