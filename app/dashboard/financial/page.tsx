'use client';

import FinancialMetrics from './components/FinancialMetrics';
import GrowthChart from './components/GrowthChart';
import RiskAnalysis from './components/RiskAnalysis';
import AIInsights from './components/AIInsights';

export default function FinancialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-['Lato']">
            ABACO Financial Intelligence
          </h1>
          <p className="text-purple-300 text-lg font-['Poppins']">
            Next-Generation Financial Analytics Platform
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <FinancialMetrics />
          <GrowthChart />
          <RiskAnalysis />
          <AIInsights />
        </div>
      </div>
    </div>
  );
}
