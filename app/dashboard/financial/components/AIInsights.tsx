import type { InsightImpact, InsightSummary } from '@/lib/data/financial-intelligence';

type AIInsightsProps = {
  insights: InsightSummary[];
  generatedAt: string;
};

const confidenceFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const impactBadgeStyles: Record<InsightImpact, string> = {
  positive: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
  neutral: 'bg-slate-500/20 text-slate-200 border border-slate-400/40',
  negative: 'bg-rose-500/20 text-rose-200 border border-rose-400/40',
};

export default function AIInsights({ insights, generatedAt }: AIInsightsProps) {
  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white font-['Lato']">AI Insights</h3>
          <p className="text-xs text-purple-200 font-['Poppins']">Refreshed {new Date(generatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden />
          <span className="text-xs text-purple-300 font-['Poppins']">Live intelligence</span>
        </div>
      </header>

      <div className="space-y-4">
        {insights.map(insight => (
          <article key={insight.id} className="bg-slate-900/40 p-4 rounded-lg border border-purple-400/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-white">{insight.title}</h4>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">{insight.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-wide rounded-full ${impactBadgeStyles[insight.impact]}`}>
                    {insight.impact} impact
                  </span>
                  <span className="text-xs text-purple-200">Confidence {confidenceFormatter.format(insight.confidence)}</span>
                  <div className="flex flex-wrap gap-1">
                    {insight.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wide text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
