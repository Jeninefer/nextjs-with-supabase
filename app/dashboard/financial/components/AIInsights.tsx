'use client';

import type { Insight, ProviderStatus } from '@/lib/data/financial-intelligence';

interface AIInsightsProps {
  insights: Insight[];
  providers: ProviderStatus[];
  isLoading?: boolean;
}

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export default function AIInsights({ insights, providers, isLoading }: AIInsightsProps) {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white font-['Lato']">AI Insights</h3>
          <p className="text-xs text-purple-200/70 font-['Poppins']">Curated intelligence from live data feeds</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-purple-300 font-['Poppins']">Automated refresh every 5 minutes</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {providers.map(provider => (
              <span
                key={provider.id}
                className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full font-['Poppins'] ${
                  provider.status === 'online'
                    ? 'bg-emerald-500/10 text-emerald-200'
                    : provider.status === 'degraded'
                      ? 'bg-amber-500/10 text-amber-200'
                      : 'bg-red-500/10 text-red-200'
                }`}
                title={`Last sync ${new Date(provider.lastSync).toLocaleString()}`}
              >
                {provider.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-slate-800/40 border border-purple-400/10"
            />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="bg-slate-800/40 border border-purple-400/20 rounded-lg p-6 text-sm text-purple-200/70 font-['Poppins']">
          No AI-generated narratives available for this period. Trigger a manual refresh to rebuild insights.
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => (
            <div key={insight.id} className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1 font-['Lato']">{insight.title}</h4>
                  <p className="text-sm text-gray-200 font-['Poppins'] leading-relaxed">{insight.summary}</p>
                  <div className="mt-2 text-xs text-purple-200/80 font-['Poppins']">{insight.impact}</div>
                  <ul className="mt-3 text-xs text-purple-100/80 font-['Poppins'] list-disc list-inside space-y-1">
                    {insight.supportingMetrics.map(metric => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-semibold font-['Poppins'] bg-slate-500/20 text-slate-100 whitespace-nowrap">
                  Confidence {percentFormatter.format(insight.confidence)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
