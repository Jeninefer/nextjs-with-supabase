"use client";

import type { FinancialMetric } from "@/lib/data/financial-intelligence";

interface FinancialMetricsProps {
    metrics: FinancialMetric[];
    isLoading: boolean;
    updatedAt: string | null;
}

function formatMetricValue(metric: FinancialMetric): string {
    if (metric.unit === "currency") {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: metric.currency ?? "USD",
            maximumFractionDigits: metric.value >= 1000000 ? 0 : 1,
        });
        return formatter.format(metric.value);
    }

    if (metric.unit === "percentage") {
        return `${metric.value.toFixed(1)}%`;
    }

    return metric.value.toLocaleString("en-US");
}

function formatChange(metric: FinancialMetric): string {
    const { change } = metric;
    const percentage = change.percentage;
    const symbol = percentage > 0 ? "+" : "";
    const percentageDisplay = `${symbol}${percentage.toFixed(1)}% ${change.period}`;

    if (metric.unit === "currency" && change.absolute != null) {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: metric.currency ?? "USD",
            maximumFractionDigits: Math.abs(change.absolute) >= 1 ? 1 : 2,
        });
        const absoluteSymbol = change.absolute > 0 ? "+" : "";
        return `${percentageDisplay} · ${absoluteSymbol}${formatter.format(change.absolute)}`;
    }

    if (change.absolute != null) {
        const absoluteSymbol = change.absolute > 0 ? "+" : "";
        return `${percentageDisplay} · ${absoluteSymbol}${change.absolute}`;
    }

    return percentageDisplay;
}

function changeColor(value: number): string {
    if (value > 0) {
        return "text-emerald-400";
    }
    if (value < 0) {
        return "text-rose-400";
    }
    return "text-slate-200";
}

function renderSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-purple-400/10 bg-slate-900/40 p-4">
                    <div className="h-3 w-32 animate-pulse rounded bg-purple-500/20" />
                    <div className="mt-4 h-6 w-24 animate-pulse rounded bg-slate-600/40" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-700/40" />
                </div>
            ))}
        </div>
    );
}

export default function FinancialMetrics({ metrics, isLoading, updatedAt }: FinancialMetricsProps) {
    return (
        <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-purple-950/40 p-6 shadow-lg">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">Financial Metrics</h3>
                    <p className="text-sm text-purple-200/80">Live production telemetry across core lending KPIs.</p>
                </div>
                <div className="text-xs text-purple-300/80">
                    {updatedAt ? `As of ${new Date(updatedAt).toLocaleString()}` : "Awaiting first sync"}
                </div>
            </header>

            {isLoading ? (
                renderSkeleton()
            ) : metrics.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-400/20 p-6 text-center text-sm text-purple-200/70">
                    No metrics available. Confirm the ingestion pipeline is publishing data to Supabase.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {metrics.map((metric) => (
                        <article key={metric.id} className="rounded-lg border border-purple-400/20 bg-slate-900/40 p-5">
                            <div className="text-xs uppercase tracking-wide text-purple-300/90">{metric.label}</div>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{formatMetricValue(metric)}</span>
                                {metric.target && (
                                    <span className="text-xs text-purple-200/70">target {formatMetricValue({ ...metric, value: metric.target })}</span>
                                )}
                            </div>
                            <p className="mt-3 text-sm text-slate-300/80">{metric.description}</p>
                            <div className={`mt-4 text-sm font-medium ${changeColor(metric.change.percentage)}`}>
                                {formatChange(metric)}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
