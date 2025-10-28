'use client';

import type {
    Insight,
    ProviderStatus,
} from "@/lib/data/financial-intelligence";
import type { FinancialIntelligenceResponse } from "@/app/api/financial-intelligence/route";

interface AIInsightsProps {
    insights: Insight[];
    providers: ProviderStatus[];
    isLoading: boolean;
    updatedAt?: string | null;
    metadata?: FinancialIntelligenceResponse["metadata"];
}

const confidenceColors = [
    { threshold: 0.9, classes: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40" },
    { threshold: 0.75, classes: "bg-amber-500/20 text-amber-200 border border-amber-300/40" },
    { threshold: 0.6, classes: "bg-sky-500/20 text-sky-200 border border-sky-300/40" },
];

const providerStatusStyles: Record<ProviderStatus["status"], string> = {
    healthy: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40",
    degraded: "bg-amber-500/15 text-amber-200 border border-amber-400/40",
    down: "bg-rose-500/15 text-rose-200 border border-rose-400/40",
};

function getConfidenceClass(confidence: number) {
    const match = confidenceColors.find((item) => confidence >= item.threshold);
    return match?.classes ?? "bg-slate-600/20 text-slate-200 border border-slate-400/30";
}

function formatConfidence(confidence: number) {
    return `${Math.round(confidence * 100)}% confidence`;
}

function formatTimestamp(timestamp?: string | null) {
    if (!timestamp) {
        return "—";
    }

    return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function renderSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-purple-400/20 bg-slate-800/60 p-4">
                    <div className="h-4 w-48 animate-pulse rounded bg-purple-500/20" />
                    <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-700/40" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-700/40" />
                </div>
            ))}
        </div>
    );
}

export default function AIInsights({ insights, providers, isLoading, updatedAt, metadata }: AIInsightsProps) {
    const dataAvailable = insights.length > 0;

    return (
        <section className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-slate-900/40 p-6 shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-xl font-semibold text-white">AI Insights</h3>
                    <p className="text-xs text-purple-200/70">Updated {formatTimestamp(updatedAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200/70">
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                        Live analysis
                    </span>
                    {metadata ? (
                        <span className="rounded-full bg-purple-500/10 px-3 py-1">
                            API {metadata.queryTimeMs.toFixed(1)}ms · Total {metadata.totalTimeMs.toFixed(1)}ms
                        </span>
                    ) : null}
                </div>
            </div>

            {isLoading && !dataAvailable ? (
                renderSkeleton()
            ) : !dataAvailable ? (
                <div className="rounded-lg border border-dashed border-purple-400/20 p-6 text-center text-sm text-purple-200/70">
                    Insight feed unavailable. Confirm the MCP integration is initialised and the dataset is hydrated.
                </div>
            ) : (
                <div className="space-y-4">
                    {insights.map((insight) => (
                        <article
                            key={insight.id}
                            className="rounded-lg border border-purple-400/20 bg-slate-800/60 p-4 shadow-inner"
                        >
                            <header className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold text-white">{insight.title}</h4>
                                    <p className="text-sm leading-relaxed text-slate-200/80">{insight.summary}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium ${getConfidenceClass(insight.confidence)}`}>
                                    {formatConfidence(insight.confidence)}
                                </span>
                            </header>

                            <dl className="mt-3 space-y-2 text-sm">
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wide text-purple-200/70">Impact</dt>
                                    <dd className="text-slate-100">{insight.impact}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wide text-purple-200/70">Recommended action</dt>
                                    <dd className="text-slate-100">{insight.action}</dd>
                                </div>
                            </dl>

                            <footer className="mt-4 flex flex-wrap items-center gap-2">
                                {insight.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-xs uppercase tracking-wide text-purple-100"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                <span className="ml-auto text-[11px] text-slate-400">
                                    Refreshed {formatTimestamp(insight.lastUpdated)}
                                </span>
                            </footer>
                        </article>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-purple-200/70">Provider status</h4>
                {providers.length === 0 ? (
                    <p className="mt-3 text-xs text-purple-200/60">No providers registered.</p>
                ) : (
                    <ul className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        {providers.map((provider) => (
                            <li
                                key={provider.id}
                                className={`flex flex-col gap-1 rounded-lg border border-purple-400/20 bg-slate-900/40 p-3 ${providerStatusStyles[provider.status]}`}
                            >
                                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                                    <span>{provider.name}</span>
                                    <span>{provider.status}</span>
                                </div>
                                <div className="text-xs text-purple-100/80">
                                    Latency {provider.latencyMs}ms · Last sync {formatTimestamp(provider.lastSync)}
                                </div>
                                {provider.message ? (
                                    <p className="text-[11px] text-purple-100/80">{provider.message}</p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
