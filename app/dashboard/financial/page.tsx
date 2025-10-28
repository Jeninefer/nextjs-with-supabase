'use client';

import AIInsights from './components/AIInsights';
import FinancialMetrics from './components/FinancialMetrics';
import GrowthChart from './components/GrowthChart';
import RiskAnalysis from './components/RiskAnalysis';
import { useMCPIntegration } from './hooks/useMCPIntegration';

export default function FinancialDashboard() {
  const { metrics, growthSeries, riskProfile, insights, providers, isInitialized, isLoading, error, refresh, data } =
    useMCPIntegration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-['Lato']">ABACO Financial Dashboard</h1>
            <p className="text-purple-300 font-['Poppins']">Enterprise-grade intelligence for secured lending operations</p>
            {data?.asOf && (
              <p className="text-xs text-purple-200/70 font-['Poppins']">Reporting snapshot: {new Date(data.asOf).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full font-semibold font-['Poppins'] ${
                isInitialized ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
              }`}
            >
              {isInitialized ? 'Data providers healthy' : 'Awaiting provider sync'}
            </span>
            <button
              type="button"
              onClick={() => refresh()}
              className="text-xs font-semibold font-['Poppins'] text-purple-200 hover:text-white transition"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing…' : 'Refresh now'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100 font-['Poppins']">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialMetrics metrics={metrics} asOf={data?.asOf} isLoading={isLoading} />
          <GrowthChart series={growthSeries} isLoading={isLoading} />
          <RiskAnalysis risk={riskProfile} isLoading={isLoading} />
          <AIInsights insights={insights} providers={providers} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
