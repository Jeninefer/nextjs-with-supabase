import { financialIntelligence } from '@/lib/data/financial-intelligence';
import { NextResponse } from 'next/server';
import { performance } from 'node:perf_hooks';

export const revalidate = 0;

export interface FinancialIntelligenceResponse {
  generatedAt: string;
  metadata: {
    queryTimeMs: number;
    totalTimeMs: number;
  };
}

export async function GET() {
  const startedAt = performance.now();
  const queryStart = performance.now();
  const payload = { ...financialIntelligence };
  const queryDuration = performance.now() - queryStart;

  const responseBody = {
    ...payload,
    generatedAt: new Date().toISOString(),
    metadata: {
      queryTimeMs: Number(queryDuration.toFixed(2)),
      totalTimeMs: Number((performance.now() - startedAt).toFixed(2)),
    },
  } satisfies typeof payload & FinancialIntelligenceResponse;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });

  headers.set('X-Query-Time-ms', responseBody.metadata.queryTimeMs.toString());
  headers.set('X-Total-Time-ms', responseBody.metadata.totalTimeMs.toString());
  headers.set(
    'Server-Timing',
    `query;dur=${responseBody.metadata.queryTimeMs}, total;dur=${responseBody.metadata.totalTimeMs}`,
  );

  return NextResponse.json(responseBody, { headers });
}
