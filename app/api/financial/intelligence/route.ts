import { NextResponse } from "next/server";

import { financialIntelligence } from "@/lib/data/financial-intelligence";

export async function GET() {
  return NextResponse.json(financialIntelligence, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
