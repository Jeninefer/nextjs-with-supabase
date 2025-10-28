'use client';

import type { RiskOverview } from '@/lib/data/financial-intelligence';
import { getRiskIndicator, getRiskLevel } from '@/lib/risk-indicators';

interface RiskAnalysisProps {
  risk: RiskOverview | null;
  isLoading?: boolean;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

export default function RiskAnalysis({ risk, isLoading }: RiskAnalysisProps) {
  const avgDpd = risk?.avgDpd ?? 0;
  const riskIndicator = getRiskIndicator(avgDpd);
  const riskLevel = getRiskLevel(avgDpd);

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white font-['Lato']">Risk Analysis</h3>
          <p className="text-xs text-purple-200/70 font-['Poppins']">Delinquency, loss distribution, and concentration</p>
        </div>
        {!isLoading && !risk && (
          <span className="text-xs text-red-200 bg-red-500/20 rounded-full px-3 py-1">Risk data unavailable</span>
        )}
      </div>

      {isLoading || !risk ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-lg bg-slate-800/40 border border-purple-400/10"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300 font-['Poppins']">Average Days Past Due</span>
              <span className="flex items-center gap-2 text-white font-semibold font-['Lato']">
                {riskIndicator}
                {avgDpd.toFixed(1)} days
              </span>
            </div>
            <div className="text-xs text-purple-200/70 font-['Poppins']">
              Portfolio currently classified as <span className="capitalize">{riskLevel}</span> risk.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
              <div className="text-sm text-purple-300 font-['Poppins']">Value at Risk (95%)</div>
              <div className="text-2xl font-bold text-white font-['Lato']">{currencyFormatter.format(risk.var95)}</div>
              <div className="text-xs text-purple-200/70 font-['Poppins']">Tail-loss probability {percentFormatter.format(risk.tailLossProbability)}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
              <div className="text-sm text-purple-300 font-['Poppins']">Coverage & Watchlist</div>
              <div className="text-2xl font-bold text-white font-['Lato']">{risk.watchlistCount} entities</div>
              <div className="text-xs text-purple-200/70 font-['Poppins']">Coverage ratio {risk.coverageRatio.toFixed(2)}x</div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
            <div className="text-sm text-purple-300 font-['Poppins'] mb-3">Sector Concentration</div>
            <div className="space-y-3">
              {risk.concentration.map(sector => (
                <div key={sector.sector}>
                  <div className="flex items-center justify-between text-sm text-white font-['Poppins']">
                    <span>{sector.sector}</span>
                    <span>{currencyFormatter.format(sector.exposure)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-purple-200/70 font-['Poppins']">
                    <span>{percentFormatter.format(sector.share)} of book</span>
                    <span>{sector.avgDpd.toFixed(1)} day DPD</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(sector.share * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
