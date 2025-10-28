/**
 * Serve the financialIntelligence dataset as a JSON HTTP response.
 *
 * @returns A Next.js Response containing the `financialIntelligence` payload and a `Cache-Control` header set to `s-maxage=300, stale-while-revalidate=600`.
 */
export async function GET() {
    return NextResponse.json(financialIntelligence, {
        headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
    });
}