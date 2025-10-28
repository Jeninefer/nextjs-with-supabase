"use client";

import type { RiskOverview } from "@/lib/data/financial-intelligence";

interface RiskAnalysisProps {
    risk: RiskOverview | null;
    isLoading: boolean;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

function badgeClass(status: RiskOverview["status"]): string {
    switch (status) {
        case "low":
            return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40";
        case "moderate":
            return "bg-amber-500/20 text-amber-200 border border-amber-400/40";
        case "high":
            return "bg-rose-500/20 text-rose-200 border border-rose-400/40";
        default:
            return "bg-slate-500/20 text-slate-200 border border-slate-400/40";
    }
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
    return (
        <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-purple-950/40 p-6 shadow-lg">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">Risk Analysis</h3>
                    <p className="text-sm text-purple-200/80">Portfolio risk posture, stress scenarios, and concentration alerts.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${risk ? badgeClass(risk.status) : "bg-slate-600/30 text-slate-200"}`}>
                    {risk ? `${risk.status.toUpperCase()} RISK` : "Pending"}
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
                    <p className="text-sm leading-relaxed text-slate-300/80">{risk.summary}</p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Value at Risk ({Math.round(risk.valueAtRisk.confidence * 100)}%)</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(risk.valueAtRisk.amount)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">{risk.valueAtRisk.horizon} horizon</div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Expected Shortfall</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(risk.expectedShortfall)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">{formatPercentage(risk.defaultRate)} default rate</div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Stress Score</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{risk.score}</div>
                            <div className="mt-1 text-xs text-purple-200/70">Lower is better</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Sector Exposures</h4>
                        <div className="mt-3 space-y-3">
                            {risk.exposures.map((exposure) => (
                                <div key={exposure.sector} className="rounded-lg border border-purple-400/10 bg-slate-900/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">{exposure.sector}</div>
                                            <div className="text-xs text-purple-200/70">{(exposure.allocation * 100).toFixed(1)}% allocation</div>
                                        </div>
                                        <div className={`text-xs font-medium ${exposure.changeBps >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                            {exposure.changeBps >= 0 ? "+" : ""}
                                            {exposure.changeBps} bps
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 w-full rounded bg-slate-800">
                                        <div
                                            className="h-2 rounded bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300"
                                            style={{ width: `${Math.min(100, exposure.allocation * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Stress Scenarios</h4>
                            <ul className="mt-3 space-y-3 text-sm text-slate-200/80">
                                {risk.stressScenarios.map((scenario) => (
                                    <li key={scenario.scenario} className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-medium text-white">{scenario.scenario}</div>
                                            <div className="text-xs text-purple-200/70">Probability {(scenario.probability * 100).toFixed(0)}%</div>
                                        </div>
                                        <span className="text-xs font-semibold text-rose-300">
                                            {formatPercentage(scenario.lossImpact)} loss
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Early Warnings</h4>
                            <ul className="mt-3 space-y-3 text-sm text-slate-200/80">
                                {risk.earlyWarnings.map((warning) => (
                                    <li key={warning.id} className="rounded-lg border border-purple-400/10 bg-slate-900/40 p-3">
                                        <div className="flex items-start justify-between">
                                            <span className="font-medium text-white">{warning.label}</span>
                                            <span
                                                className={`text-xs font-semibold ${
                                                    warning.severity === "high"
                                                        ? "text-rose-300"
                                                        : warning.severity === "moderate"
                                                          ? "text-amber-300"
                                                          : "text-emerald-300"
                                                }`}
                                            >
                                                {warning.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-purple-200/70">{warning.detail}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
