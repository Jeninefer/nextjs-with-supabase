import { financialDashboardDataset } from "@/lib/data/financial-intelligence";
import { NextResponse } from "next/server";
import { performance } from "node:perf_hooks";

export const revalidate = 0;

export interface FinancialIntelligenceResponse {
    generatedAt: string;
    metadata: {
        queryTimeMs: number;
        totalTimeMs: number;
    };
}

/**
 * Returns the canonical financial intelligence dataset used by the dashboard.
 * The handler enriches the payload with timing metadata and emits complementary
 * response headers to simplify performance troubleshooting in production.
 */
export async function GET() {
    const startedAt = performance.now();

    // Static dataset lookup is treated as the "query" step for timing purposes.
    const queryStart = performance.now();
    const payload = { ...financialDashboardDataset };
    const queryDuration = performance.now() - queryStart;

    const generatedAt = new Date().toISOString();
    const responseBody = {
        ...payload,
        generatedAt,
        metadata: {
            queryTimeMs: Number(queryDuration.toFixed(2)),
            totalTimeMs: Number((performance.now() - startedAt).toFixed(2)),
        },
    } satisfies typeof payload & FinancialIntelligenceResponse;

    const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
    });

    headers.set("X-Query-Time-ms", responseBody.metadata.queryTimeMs.toString());
    headers.set("X-Total-Time-ms", responseBody.metadata.totalTimeMs.toString());
    headers.set(
        "Server-Timing",
        `query;dur=${responseBody.metadata.queryTimeMs}, total;dur=${responseBody.metadata.totalTimeMs}`,
    );

    return NextResponse.json(responseBody, { headers });
}
