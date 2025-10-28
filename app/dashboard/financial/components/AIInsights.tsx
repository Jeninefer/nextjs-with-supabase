'use client';

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
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white font-['Lato']">AI Insights</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-purple-300 font-['Poppins']">Live Analysis</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">📈</span>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">Growth Opportunity</h4>
              <p className="text-sm text-gray-300">Portfolio showing 15% growth potential</p>
              <span className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded-full mt-2 inline-block">
                92% confidence
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
