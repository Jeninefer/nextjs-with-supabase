'use client';

import { financialIntelligence } from "@/lib/data/financial-intelligence";

import AIInsights from "./components/AIInsights";
import FinancialMetrics from "./components/FinancialMetrics";
import GrowthChart from "./components/GrowthChart";
import RiskAnalysis from "./components/RiskAnalysis";

/**
 * Renders the ABACO Financial Intelligence dashboard UI driven by the `financialIntelligence` data object.
 *
 * The component displays a header with a data-as-of badge, a responsive grid containing FinancialMetrics,
 * GrowthChart, RiskAnalysis and AIInsights, and a "Market & Data Coverage" section that lists market indicators
 * (formatted by unit and change sign) and data sources from `financialIntelligence`.
 *
 * @returns The JSX element representing the complete financial dashboard.
 */
export default function FinancialDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-4">
          <h1 className="text-4xl font-bold text-white mb-3 font-['Lato']">ABACO Financial Intelligence</h1>
          <div className="flex flex-wrap gap-3 text-sm text-purple-200/80 font-['Poppins']">
            <span>Integrated performance, risk and AI analytics for institutional lending.</span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30">
              Data as of {financialIntelligence.asOf}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialMetrics />
          <GrowthChart />
          <RiskAnalysis />
          <AIInsights />
        </section>

        <section className="bg-slate-900/50 border border-purple-500/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white font-['Lato'] mb-4">Market & Data Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-200/80">
            {financialIntelligence.marketIndicators.map((indicator) => (
              <div key={indicator.id} className="bg-slate-800/40 rounded-lg border border-purple-400/20 p-4">
                <p className="uppercase text-xs tracking-wide text-purple-300 font-semibold">{indicator.name}</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {indicator.unit === 'percent'
                    ? `${indicator.value.toFixed(2)}%`
                    : indicator.value}
                </p>
                <p className={`text-xs mt-1 ${indicator.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {indicator.change >= 0 ? '+' : ''}
                  {indicator.change.toFixed(2)}
                  {indicator.unit === 'percent' ? 'pp' : ''}
                </p>
                <p className="text-[11px] text-purple-200/70 mt-2">Source: {indicator.source}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-purple-200/80">
            <h3 className="text-xs uppercase tracking-wide text-purple-300 font-semibold mb-2">Data Sources</h3>
            <ul className="list-disc list-inside space-y-1">
              {financialIntelligence.dataSources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}