import { NextResponse } from "next/server";

import { financialDashboardData } from "@/lib/data/financial-intelligence";

export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    ...financialDashboardData,
    generatedAt: new Date().toISOString()
  });
}
