'use client';

import { financialIntelligence } from "@/lib/data/financial-intelligence";
import { formatDateTime, formatPercent } from "@/lib/utils";

const confidenceColors = [
  { threshold: 0.85, classes: "bg-emerald-500/20 text-emerald-200" },
  { threshold: 0.7, classes: "bg-amber-500/20 text-amber-200" },
  { threshold: 0, classes: "bg-rose-500/20 text-rose-200" },
];

/**
 * Selects the CSS utility classes to style a confidence badge based on the provided score.
 *
 * @param confidence - Confidence score as a decimal between 0 and 1 (e.g., 0.85 for 85%)
 * @returns The CSS class string to apply to the confidence badge; returns a default slate style if no threshold matches.
 */
function getConfidenceClass(confidence: number) {
  const match = confidenceColors.find((item) => confidence >= item.threshold);
  return match?.classes ?? "bg-slate-500/20 text-slate-200";
}

/**
 * Renders a styled "AI Insights" section that lists generated financial insights as individual cards.
 *
 * Each card displays the insight's title, a confidence badge, summary, impact, recommended action, tags, and a last-refreshed timestamp. The section header shows when the dataset was last generated.
 *
 * @returns The JSX element for the AI insights section containing a mapped list of insight cards
 */
export default function AIInsights() {
  const insights = financialIntelligence.insights;

  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white font-['Lato']">AI Insights</h3>
        <div className="flex items-center gap-3 text-xs text-purple-200/80">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Last updated {formatDateTime(financialIntelligence.generatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20 hover:border-purple-300/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white text-lg">{insight.title}</h4>
              <span
                className={`text-[11px] px-2 py-1 rounded-full uppercase tracking-wide ${getConfidenceClass(insight.confidence)}`}
              >
                Confidence {formatPercent(insight.confidence, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{insight.summary}</p>
            <div className="mt-3 grid gap-2 text-xs text-purple-200/80">
              <span className="font-semibold text-purple-200">Impact:</span>
              <p className="text-slate-100">{insight.impact}</p>
              <span className="font-semibold text-purple-200 mt-2">Recommended Action:</span>
              <p className="text-slate-100">{insight.recommendedAction}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-purple-200/70">
              {insight.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                  #{tag}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-slate-400">
                Refreshed {formatDateTime(insight.lastUpdated)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}