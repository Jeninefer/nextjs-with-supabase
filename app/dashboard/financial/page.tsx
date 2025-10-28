'use client';

import AIInsights from './components/AIInsights';
import FinancialMetrics from './components/FinancialMetrics';
import GrowthChart from './components/GrowthChart';
import RiskAnalysis from './components/RiskAnalysis';

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-['Lato']">
            ABACO Financial Dashboard
          </h1>
          <p className="text-purple-300 font-['Poppins']">
            Next-generation financial intelligence platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialMetrics />
          <GrowthChart />
          <RiskAnalysis />
          <AIInsights />
        </div>
      </div>
    </div>
  );
}
