"use client";

import { useMCPIntegration } from "./hooks/useMCPIntegration";

import AIInsights from "./components/AIInsights";
import FinancialMetrics from "./components/FinancialMetrics";
import GrowthChart from "./components/GrowthChart";
import RiskAnalysis from "./components/RiskAnalysis";
import { Button } from "@/components/ui/button";

export default function FinancialDashboard() {
    const { metrics, growthSeries, riskProfile, providers, insights, summary, isLoading, error, refresh, isInitialized } =
        useMCPIntegration();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 p-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <header className="flex flex-col gap-4 rounded-xl border border-purple-500/10 bg-slate-900/60 p-6 shadow-lg lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">ABACO Financial Intelligence</h1>
                        <p className="text-sm text-purple-200/80">
                            Production dashboard consuming the canonical financial-intelligence dataset via the public API endpoint.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-purple-200/60">
                            <span className="rounded-full bg-purple-500/10 px-3 py-1">
                                {summary.updatedAt ? `Data generated ${new Date(summary.updatedAt).toLocaleString()}` : "Awaiting dataset"}
                            </span>
                            {summary.refreshIntervalMinutes && (
                                <span className="rounded-full bg-purple-500/10 px-3 py-1">
                                    Auto-refresh {summary.refreshIntervalMinutes} minutes
                                </span>
                            )}
                            {summary.metadata?.queryTimeMs != null && summary.metadata?.totalTimeMs != null && (
                                <span className="rounded-full bg-purple-500/10 px-3 py-1">
                                    API {summary.metadata.queryTimeMs.toFixed(1)}ms query · {summary.metadata.totalTimeMs.toFixed(1)}ms total
                                </span>
                            )}
                            <span className={`rounded-full px-3 py-1 ${isInitialized ? "bg-emerald-500/10 text-emerald-200" : "bg-slate-600/20 text-slate-200"}`}>
                                {isInitialized ? "Live" : "Starting"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {error && <span className="text-sm text-rose-300">{error}</span>}
                        <Button size="sm" variant="secondary" className="bg-purple-500/20 text-purple-100 hover:bg-purple-500/40" onClick={() => void refresh()}>
                            Refresh now
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <FinancialMetrics metrics={metrics} isLoading={isLoading && metrics.length === 0} updatedAt={summary.updatedAt} />
                    <GrowthChart series={growthSeries} isLoading={isLoading && growthSeries.length === 0} />
                    <RiskAnalysis risk={riskProfile} isLoading={isLoading && !riskProfile} />
                    <AIInsights
                        insights={insights}
                        providers={providers}
                        isLoading={isLoading && insights.length === 0}
                        updatedAt={summary.updatedAt}
                        metadata={summary.metadata}
                    />
                </div>
            </div>
        </div>
    );
}
