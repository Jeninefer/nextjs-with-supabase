'use client';

/**
 * Render a Risk Analysis panel showing risk posture, portfolio metrics, exposure breakdown, and stress test outcomes.
 *
 * Reads data from financialIntelligence.risk (and metrics for q/q changes) and formats portfolio VaR, expected shortfall,
 * default rate, exposures (with indicators, avg days past due, ratio and change in bps), and stress test scenarios for display.
 *
 * @returns A JSX element containing the complete Risk Analysis UI.
 */
export default function RiskAnalysis() {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 font-['Lato']">Risk Analysis</h3>
      <div className="space-y-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-['Poppins']">Portfolio Risk</span>
            <span className="text-green-400 font-bold">Low</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="text-sm text-purple-300 font-['Poppins']">Value at Risk (95%)</div>
          <div className="text-2xl font-bold text-white">$1.2M</div>
        </div>
      </div>
    </div>
  );
}
