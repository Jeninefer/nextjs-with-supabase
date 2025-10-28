'use client';

import type { GrowthPoint } from '@/lib/data/financial-intelligence';

interface GrowthChartProps {
  series: GrowthPoint[];
  isLoading?: boolean;
}

function buildPath(points: GrowthPoint[]): string {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M0,50 L100,50`;
  }

  const originations = points.map(point => point.originations);
  const min = Math.min(...originations);
  const max = Math.max(...originations);
  const range = max - min || 1;

  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const normalized = (point.originations - min) / range;
    const y = 100 - normalized * 80 - 10; // keep margins inside chart
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return `M${coordinates[0]} ` + coordinates.slice(1).map(coord => `L${coord}`).join(' ');
}

function formatMonth(label: string) {
  const [year, month] = label.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export default function GrowthChart({ series, isLoading }: GrowthChartProps) {
  const path = buildPath(series);

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white font-['Lato']">Growth Projections</h3>
          <p className="text-xs text-purple-200/70 font-['Poppins']">Monthly originations and unit economics</p>
        </div>
        {!isLoading && series.length === 0 && (
          <span className="text-xs text-red-200 bg-red-500/20 rounded-full px-3 py-1">No growth data</span>
        )}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-slate-800/40 border border-purple-400/10" />
      ) : (
        <>
          <div className="h-64 bg-slate-800/40 rounded-lg border border-purple-400/10 flex flex-col justify-between p-4">
            <div className="relative h-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <path
                  d={path}
                  fill="none"
                  stroke="url(#growthGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex justify-between text-xs text-purple-200/70 font-['Poppins'] mt-2">
              {series.map(point => (
                <span key={point.month}>{formatMonth(point.month)}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            {series.slice(-3).map(point => (
              <div key={point.month} className="bg-slate-800/40 border border-purple-400/20 rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-purple-300 font-['Poppins']">
                  {new Date(point.month + '-01').toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="mt-2 text-white font-semibold font-['Lato']">
                  {currencyFormatter.format(point.originations)} in new originations
                </div>
                <div className="mt-1 text-purple-200/80 font-['Poppins']">
                  YoY growth {percentFormatter.format(point.yoyGrowth)} · Margin {percentFormatter.format(point.margin)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
