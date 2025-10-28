"use client";

import type { GrowthPoint } from "@/lib/data/financial-intelligence";

interface GrowthChartProps {
    series: GrowthPoint[];
    isLoading: boolean;
}

function buildPath(series: GrowthPoint[]): string {
    if (series.length === 0) {
        return "";
    }

    const minValue = Math.min(...series.map((point) => point.netAssetValue));
    const maxValue = Math.max(...series.map((point) => point.netAssetValue));
    const range = Math.max(maxValue - minValue, 1);

    return series
        .map((point, index) => {
            const x = (index / (series.length - 1)) * 100;
            const normalised = (point.netAssetValue - minValue) / range;
            const y = 100 - normalised * 100;
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ");
}

function renderSkeleton() {
    return (
        <div className="flex h-64 items-center justify-center rounded-lg border border-purple-400/10 bg-slate-900/30">
            <div className="flex w-3/4 flex-col gap-3">
                <div className="h-4 animate-pulse rounded bg-purple-500/20" />
                <div className="h-4 animate-pulse rounded bg-purple-500/10" />
                <div className="h-32 animate-pulse rounded bg-slate-700/40" />
            </div>
        </div>
    );
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

export default function GrowthChart({ series, isLoading }: GrowthChartProps) {
    const path = buildPath(series);
    const latest = series.at(-1);
    const penultimate = series.length > 1 ? series.at(-2) : undefined;
    const navDelta = latest && penultimate ? latest.netAssetValue - penultimate.netAssetValue : 0;
    const navDeltaSymbol = navDelta >= 0 ? "+" : "";

    return (
        <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-purple-950/40 p-6 shadow-lg">
            <header className="mb-6">
                <h3 className="text-xl font-semibold text-white">Growth &amp; Retention</h3>
                <p className="text-sm text-purple-200/80">Twelve-month net asset value, inflow velocity, and retention trend.</p>
            </header>

            {isLoading ? (
                renderSkeleton()
            ) : series.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-400/20 p-6 text-center text-sm text-purple-200/70">
                    Growth history unavailable. Validate the data warehouse sync configuration.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative h-64">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                            <defs>
                                <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(168 85 247 / 0.35)" />
                                    <stop offset="100%" stopColor="rgb(15 23 42 / 0.2)" />
                                </linearGradient>
                            </defs>
                            <rect width="100" height="100" fill="url(#navGradient)" opacity="0.35" />
                            <path d={path} fill="none" stroke="rgb(192 132 252)" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-purple-200/70">
                            {series.map((point) => (
                                <span key={point.month}>{point.month}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Net Asset Value</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{formatCurrency(latest?.netAssetValue ?? 0)}</div>
                            <div className="mt-1 text-xs text-emerald-400/90">
                                {navDeltaSymbol}
                                {formatCurrency(Math.abs(navDelta))} month change
                            </div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Monthly Inflows</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{formatCurrency(latest?.newAssets ?? 0)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">Avg growth {formatCurrency(series.reduce((acc, point) => acc + point.newAssets, 0) / series.length)}</div>
                        </div>
                        <div className="rounded-lg border border-purple-400/20 bg-slate-900/30 p-4">
                            <div className="text-xs uppercase tracking-wide text-purple-300/80">Retention</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{formatPercentage(latest?.retentionRate ?? 0)}</div>
                            <div className="mt-1 text-xs text-purple-200/70">{formatPercentage(series[0]?.retentionRate ?? 0)} → {formatPercentage(latest?.retentionRate ?? 0)}</div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
