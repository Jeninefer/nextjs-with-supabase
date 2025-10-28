'use client';

import type { FinancialMetric } from "@/lib/data/financial-intelligence";

interface FinancialMetricsProps {
    metrics: FinancialMetric[];
    isLoading: boolean;
    updatedAt?: string | null;
}

function formatMetricValue(metric: FinancialMetric) {
    if (metric.unit === "currency") {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: metric.currency ?? "USD",
            maximumFractionDigits: 0,
        });
        return formatter.format(metric.value);
    }

    if (metric.unit === "percentage") {
        return `${(metric.value * 100).toFixed(1)}%`;
    }

    if (metric.unit === "ratio") {
        return metric.value.toFixed(2);
    }

    return metric.value.toLocaleString("en-US");
}

function formatChange(metric: FinancialMetric) {
    if (!metric.change) {
        return "No change reported";
    }

    const parts: string[] = [];
    if (typeof metric.change.percentage === "number") {
        const pct = (metric.change.percentage * 100).toFixed(1);
        const prefix = metric.change.percentage > 0 ? "+" : "";
        parts.push(`${prefix}${pct}%`);
    }

    if (typeof metric.change.absolute === "number") {
        const absolute = metric.unit === "currency"
            ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: metric.currency ?? "USD",
                  maximumFractionDigits: 0,
              }).format(metric.change.absolute)
            : metric.change.absolute.toLocaleString("en-US");
        parts.push(`Δ ${absolute}`);
    }

    if (metric.change.period) {
        parts.push(metric.change.period.toUpperCase());
    }

    return parts.join(" · ");
}

function trendBadge(metric: FinancialMetric) {
    if (!metric.change?.trend) {
        return "text-slate-300";
    }

    switch (metric.change.trend) {
        case "up":
            return "text-emerald-400";
        case "down":
            return "text-rose-400";
        default:
            return "text-slate-300";
    }
}

function renderSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 rounded-lg border border-purple-400/20 bg-slate-800/40 p-4">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-purple-500/20" />
                    <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-purple-500/10" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-700/40" />
                </div>
            ))}
        </div>
    );
}

function formatUpdatedAt(updatedAt?: string | null) {
    if (!updatedAt) {
        return "—";
    }

    return new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function FinancialMetrics({ metrics, isLoading, updatedAt }: FinancialMetricsProps) {
    const hasData = metrics.length > 0;

    return (
        <section className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-slate-900/40 p-6 shadow-lg">
            <header className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Financial Metrics</h3>
                <span className="text-xs text-purple-200/70">Data as of {formatUpdatedAt(updatedAt)}</span>
            </header>

            {isLoading && !hasData ? (
                renderSkeleton()
            ) : !hasData ? (
                <div className="rounded-lg border border-dashed border-purple-400/20 p-6 text-center text-sm text-purple-200/70">
                    Metrics unavailable. Ensure the financial intelligence dataset is accessible.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metrics.map((metric) => (
                        <article
                            key={metric.id}
                            className="flex flex-col gap-2 rounded-lg border border-purple-400/20 bg-slate-800/60 p-4 shadow-inner"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm uppercase tracking-wide text-purple-200">{metric.label}</p>
                                <span className={`text-xs font-semibold ${trendBadge(metric)}`}>
                                    {metric.change?.trend === "up" && "▲"}
                                    {metric.change?.trend === "down" && "▼"}
                                    {metric.change?.trend === "flat" && "▬"}
                                </span>
                            </div>

                            <strong className="text-3xl text-white">{formatMetricValue(metric)}</strong>
                            <p className="text-xs text-slate-300/80">{metric.description}</p>
                            <span className="text-[11px] text-purple-200/80">{formatChange(metric)}</span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
