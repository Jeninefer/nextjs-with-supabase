import AIInsights from './components/AIInsights';
import FinancialMetrics from './components/FinancialMetrics';
import GrowthChart from './components/GrowthChart';
import RiskAnalysis from './components/RiskAnalysis';

import { getFinancialIntelligenceSnapshot } from '@/lib/data/financial-intelligence';

export default async function FinancialDashboard() {
  const snapshot = getFinancialIntelligenceSnapshot();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-['Lato']">
            ABACO Financial Dashboard
          </h1>
          <p className="text-purple-300 font-['Poppins']">
            Next-generation financial intelligence platform refreshed {new Date(snapshot.generatedAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialMetrics metrics={snapshot.metrics} />
          <GrowthChart points={snapshot.growth.trailingMonths} />
          <RiskAnalysis risk={snapshot.risk} />
          <AIInsights insights={snapshot.insights} generatedAt={snapshot.generatedAt} />
        </div>
      </div>
    </div>
  );
}
