import { financialIntelligence } from "@/lib/data/financial-intelligence";
import { NextResponse } from "next/server";
/**
 * Serve the financialIntelligence dataset as a JSON HTTP response.
 * Serve the financialIntelligence dataset as a JSON HTTP response.
 * @returns A Next.js Response containing the `financialIntelligence` payload and a `Cache-Control` header set to `s-maxage=300, stale-while-revalidate=600`.
 */@returns A Next.js Response containing the `financialIntelligence` payload and a `Cache-Control` header set to`s-maxage=300, stale-while-revalidate=600`.
export async function GET() {
    return new Response(JSON.stringify(financialIntelligence), {
        headers: { ponse(JSON.stringify(financialIntelligence), {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    }, "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
  }); },
}   });
}