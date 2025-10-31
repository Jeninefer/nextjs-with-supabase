'use client';

import { financialIntelligence } from "@/lib/data/financial-intelligence";
import { getRiskIndicator, getRiskLevel } from "@/lib/risk-indicators";
import { formatCurrency, formatPercent } from "@/lib/utils";

/**
 * Render a Risk Analysis panel showing risk posture, portfolio metrics, exposure breakdown, and stress test outcomes.
 *
 * Reads data from financialIntelligence.risk (and metrics for q/q changes) and formats portfolio VaR, expected shortfall,
 * default rate, exposures (with indicators, avg days past due, ratio and change in bps), and stress test scenarios for display.
 *
 * @returns A JSX element containing the complete Risk Analysis UI.
 */
export default function RiskAnalysis() {
  const { risk } = financialIntelligence;

  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-xl font-semibold text-white font-['Lato']">Risk Posture</h3>
        <p className="text-sm text-purple-200/80 font-['Poppins']">{risk.comment}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-['Poppins']">Value at Risk (95%)</span>
            <span className="text-sm text-purple-200/70">
              {formatPercent(risk.riskAppetiteUtilization, { maximumFractionDigits: 0 })} of appetite
            </span>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(risk.portfolioVaR95, financialIntelligence.baseCurrency)}
          </div>
          <p className="text-xs text-purple-200/80 mt-2">
            Expected shortfall {formatCurrency(risk.expectedShortfall, financialIntelligence.baseCurrency)}.
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-['Poppins']">Portfolio Default Rate</span>
            <span className="text-emerald-300 font-semibold">
              {formatPercent(1 - risk.defaultRate, { maximumFractionDigits: 1 })} performing
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{formatPercent(risk.defaultRate)}</div>
          <p className="text-xs text-purple-200/80 mt-2">
            Default rate improved {formatPercent(financialIntelligence.metrics.find((m) => m.id === 'default-rate')?.change.percentage ?? 0)} q/q.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-slate-900/40 rounded-lg border border-purple-400/10 p-4">
        <h4 className="text-sm font-semibold text-purple-200 mb-3">Exposure Breakdown</h4>
        <div className="space-y-3">
          {risk.exposures.map((exposure) => {
            const indicator = getRiskIndicator(exposure.avgDaysPastDue);
            const riskLevel = getRiskLevel(exposure.avgDaysPastDue);

            return (
              <div key={exposure.segment} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm text-white">
                  <span className="font-semibold text-purple-200/90">{exposure.segment}</span>
                  <span>
                    {formatPercent(exposure.ratio, { maximumFractionDigits: 1 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-purple-200/80">
                  <span>
                    {indicator} {riskLevel.toUpperCase()} risk · Avg DPD {Math.round(exposure.avgDaysPastDue)}
                  </span>
                  <span className={exposure.changeBps >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {exposure.changeBps >= 0 ? '+' : ''}
                    {exposure.changeBps} bps
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-300"
                    style={{ width: `${Math.min(exposure.ratio * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-3">Stress Test Outcomes</h4>
        <div className="grid gap-3">
          {risk.stressTests.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-slate-800/40 border border-purple-400/10 rounded-lg p-4"
            >
              <div className="flex justify-between text-sm text-white">
                <span className="font-semibold text-purple-200/90">{scenario.scenario}</span>
                <span className="text-red-300 font-semibold">
                  {formatPercent(scenario.lossPercentage, { maximumFractionDigits: 1 })} loss
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-2">{scenario.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}