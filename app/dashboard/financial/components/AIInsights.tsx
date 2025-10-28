"use client";

import type { Insight, ProviderStatus } from "@/lib/data/financial-intelligence";

interface AIInsightsProps {
    insights: Insight[];
    providers: ProviderStatus[];
    isLoading: boolean;
    updatedAt: string | null;
    metadata?: {
        queryTimeMs?: number;
        totalTimeMs?: number;
    } | null;
}

const confidencePalette = [
    { threshold: 0.9, className: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40" },
    { threshold: 0.75, className: "bg-amber-500/20 text-amber-100 border border-amber-400/40" },
    { threshold: 0, className: "bg-slate-500/20 text-slate-200 border border-slate-400/30" },
];

function badgeForConfidence(confidence: number): string {
    const palette = confidencePalette.find((entry) => confidence >= entry.threshold);
    return palette?.className ?? confidencePalette[confidencePalette.length - 1].className;
}

function providerBadge(status: ProviderStatus["status"]): string {
    switch (status) {
        case "operational":
            return "bg-emerald-500/10 text-emerald-200";
        case "degraded":
            return "bg-amber-500/10 text-amber-200";
        case "offline":
            return "bg-rose-500/10 text-rose-200";
        default:
            return "bg-slate-600/20 text-slate-200";
    }
}

function renderSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-purple-400/10 bg-slate-900/30 p-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-purple-500/20" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-700/40" />
                    <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-700/40" />
                </div>
            ))}
        </div>
    );
}

export default function AIInsights({ insights, providers, isLoading, updatedAt, metadata }: AIInsightsProps) {
    return (
        <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-purple-950/40 p-6 shadow-lg">
            <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">AI Insights</h3>
                    <p className="text-sm text-purple-200/80">Production-grade recommendations generated from Supabase telemetry and market feeds.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200/70">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                        Live feed
                    </span>
                    {updatedAt && <span>Generated {new Date(updatedAt).toLocaleTimeString()}</span>}
                    {metadata && metadata.totalTimeMs != null && (
                        <span>API {metadata.totalTimeMs.toFixed(1)} ms</span>
                    )}
                </div>
            </header>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                {providers.map((provider) => (
                    <div key={provider.name} className="rounded-lg border border-purple-400/10 bg-slate-900/30 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{provider.name}</span>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${providerBadge(provider.status)}`}>
                                {provider.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-purple-200/70">
                            Latency {provider.responseTimeMs} ms • Sync {new Date(provider.lastSync).toLocaleTimeString()}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-purple-200/60">
                            {provider.coverage.map((item) => (
                                <span key={item} className="rounded-full bg-purple-500/10 px-2 py-1">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isLoading ? (
                renderSkeleton()
            ) : insights.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-400/20 p-6 text-center text-sm text-purple-200/70">
                    No AI insights available. Trigger a new inference job or review MCP integration logs.
                </div>
            ) : (
                <div className="space-y-4">
                    {insights.map((insight) => (
                        <article key={insight.id} className="rounded-lg border border-purple-400/20 bg-slate-900/40 p-5">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-white">{insight.title}</h4>
                                    <p className="mt-2 text-sm text-slate-300/80">{insight.summary}</p>
                                </div>
                                <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${badgeForConfidence(insight.confidence)}`}>
                                    {(insight.confidence * 100).toFixed(0)}% confidence
                                </span>
                            </div>
                            <div className="mt-4 text-sm text-purple-200/80">
                                <span className="font-semibold text-white">Recommended action:</span> {insight.recommendedAction}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-purple-200/70">
                                <span className="rounded-full bg-purple-500/10 px-2 py-1">Impact: {insight.impact}</span>
                                {insight.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-slate-800/70 px-2 py-1">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
