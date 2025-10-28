import { NextResponse } from 'next/server';

import { getFinancialIntelligenceSnapshot } from '@/lib/data/financial-intelligence';

export async function GET() {
  try {
    const snapshot = getFinancialIntelligenceSnapshot();

    return NextResponse.json({
      ok: true,
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to build financial intelligence snapshot';
    return NextResponse.json({
      ok: false,
      error: message,
    }, { status: 500 });
  }
}
