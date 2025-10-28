"use client";

import type { RiskOverview } from "@/lib/data/financial-intelligence";

interface RiskAnalysisProps {
    risk: RiskOverview | null;
    isLoading: boolean;
}

type RiskBand = "low" | "moderate" | "elevated";

function formatPercentage(value: number, fractionDigits = 1): string {
    return `${(value * 100).toFixed(fractionDigits)}%`;
}

function formatChange(change: number): string {
    const prefix = change >= 0 ? "+" : "-";
    return `${prefix}${Math.abs(change * 100).toFixed(1)} pts`;
}

function badgeClass(level: RiskBand): string {
    switch (level) {
        case "low":
            return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40";
        case "moderate":
            return "bg-amber-500/20 text-amber-200 border border-amber-400/40";
        default:
            return "bg-rose-500/20 text-rose-200 border border-rose-400/40";
    }
}

function riskLevelFromOverview(risk: RiskOverview): RiskBand {
    if (
        risk.expectedShortfall95 >= 0.12 ||
        risk.stressLoss >= 0.16 ||
        risk.exposures.some((exposure) => exposure.riskLevel === "elevated")
    ) {
        return "elevated";
    }

    if (
        risk.expectedShortfall95 >= 0.09 ||
        risk.stressLoss >= 0.12 ||
        risk.exposures.some((exposure) => exposure.riskLevel === "moderate")
    ) {
        return "moderate";
    }

    return "low";
}

function renderSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-purple-400/10 bg-slate-900/40 p-4">
                    <div className="h-4 w-40 animate-pulse rounded bg-purple-500/20" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-700/40" />
                    <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-700/40" />
                </div>
            ))}
        </div>
    );
}

export default function RiskAnalysis({ risk, isLoading }: RiskAnalysisProps) {
    const overallLevel = risk ? riskLevelFromOverview(risk) : null;
    const summary = risk
        ? `95% VaR at ${formatPercentage(risk.valueAtRisk95)} with expected shortfall ${formatPercentage(risk.expectedShortfall95)}. Stress testing projects ${formatPercentage(risk.stressLoss)} drawdown and diversification index ${risk.diversificationIndex.toFixed(2)}.`
        : null;

    return (
        <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-purple-950/40 p-6 shadow-lg">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">Risk Analysis</h3>
                    <p className="text-sm text-purple-200/80">Portfolio loss distribution, stress appetite, and concentration monitoring.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${overallLevel ? badgeClass(overallLevel) : "bg-slate-600/30 text-slate-200"}`}>
                    {overallLevel ? `${overallLevel.toUpperCase()} RISK` : "Pending"}
                </span>
            </header>

            {isLoading ? (
                renderSkeleton()
            ) : !risk ? (
                <div className="rounded-lg border border-dashed border-purple-400/20 p-6 text-center text-sm text-purple-200/70">
                    Risk dataset unavailable. Confirm that risk events are flowing into the analytics lakehouse.
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-slate-300/80">{summary}</p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Value at Risk (95%)</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{formatPercentage(risk.valueAtRisk95)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">Portfolio loss threshold</div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Expected Shortfall</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{formatPercentage(risk.expectedShortfall95)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">Conditional tail expectation</div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Stress loss</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{formatPercentage(risk.stressLoss)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">Modelled severe scenario</div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Diversification index</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{risk.diversificationIndex.toFixed(2)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">Higher indicates broader spread</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Sector exposures</h4>
                        <div className="mt-3 space-y-3">
                        {risk.exposures.map((exposure) => (
                                <div key={exposure.sector} className="rounded-lg border border-purple-400/10 bg-slate-900/30 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-medium text-white">{exposure.sector}</div>
                                            <div className="text-xs text-purple-200/70">{formatPercentage(exposure.allocation, 1)} allocation</div>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(exposure.riskLevel)}`}>
                                            {exposure.riskLevel.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-300/80">{exposure.commentary}</p>
                                    <div className="mt-3 flex items-center justify-between text-xs text-purple-200/70">
                                        <span>{formatChange(exposure.change)}</span>
                                        <span>{formatPercentage(exposure.allocation, 2)} share</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full rounded bg-slate-800">
                                        <div
                                            className="h-2 rounded bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300"
                                            style={{ width: `${Math.min(100, exposure.allocation * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
