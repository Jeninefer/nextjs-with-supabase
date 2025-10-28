'use client';

import type { FinancialMetric } from '@/lib/data/financial-intelligence';

interface FinancialMetricsProps {
  metrics: FinancialMetric[];
  asOf?: string;
  isLoading?: boolean;
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const countFormatter = new Intl.NumberFormat('en-US');

function formatValue(metric: FinancialMetric): string {
  switch (metric.unit) {
    case 'usd':
      return usdFormatter.format(metric.value);
    case 'percentage':
      return percentFormatter.format(metric.value);
    case 'ratio':
      return percentFormatter.format(metric.value);
    case 'days':
      return `${Math.round(metric.value)} days`;
    case 'count':
    default:
      return countFormatter.format(metric.value);
  }
}

function formatChange(change: number): { label: string; tone: 'positive' | 'negative' | 'neutral' } {
  if (change > 0) {
    return { label: `+${percentFormatter.format(change)}`, tone: 'positive' };
  }

  if (change < 0) {
    return { label: percentFormatter.format(change), tone: 'negative' };
  }

  return { label: percentFormatter.format(change), tone: 'neutral' };
}

export default function FinancialMetrics({ metrics, asOf, isLoading }: FinancialMetricsProps) {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white font-['Lato']">Financial Metrics</h3>
          {asOf && (
            <p className="text-xs text-purple-200/70 font-['Poppins']">Data as of {new Date(asOf).toLocaleDateString()}</p>
          )}
        </div>
        {!isLoading && metrics.length === 0 && (
          <span className="text-xs text-red-200 bg-red-500/20 rounded-full px-3 py-1">No metrics available</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-slate-800/40 border border-purple-400/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map(metric => {
            const change = formatChange(metric.change);
            const targetLabel =
              typeof metric.target === 'number'
                ? metric.unit === 'percentage' || metric.unit === 'ratio'
                  ? percentFormatter.format(metric.target)
                  : metric.unit === 'usd'
                    ? usdFormatter.format(metric.target)
                    : countFormatter.format(metric.target)
                : null;

            return (
              <div
                key={metric.id}
                className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20 flex flex-col gap-2"
              >
                <div className="text-xs uppercase tracking-wide text-purple-300 font-['Poppins']">
                  {metric.label}
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-white font-['Lato']">{formatValue(metric)}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold font-['Poppins'] ${
                      change.tone === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : change.tone === 'negative'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-slate-500/20 text-slate-200'
                    }`}
                  >
                    {change.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-purple-200/70 font-['Poppins']">
                  <span>{metric.changeLabel}</span>
                  {targetLabel && <span>Target: {targetLabel}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
