# Replace lines 97-106 with real database query# Replace lines 97-106 with real database queryimport { 
ContinueLearning } from "@/lib/ml/continue-learning"; import { PredictionInputSchema } from "@/types/ml"; import { 
NextRequest, NextResponse } from "next/server"; import { ZodError } from "zod";

export const maxDuration = 60; # Step 5: Remove console.logs (already mostly clean, but verify) /** grep -r 
"console\." app/ lib/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" # Should return minimal results; 
only keep essential warnings/errors # Step 5: Remove console.logs (already mostly clean, but verify) # Step 6: Commit 
code fixes git add . git commit -m "fix: standardize environment variables and implement real database queries grep -r 
"console\." app/ lib/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" - Standardize SUPABASE_ANON_KEY to 
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY - Implement real database query in ml/predictions GET handler - Remove 
placeholder comments and return empty arrays" # Step 7: Type checking npm run type-check # Should return minimal 
results; only keep essential warnings/errors # Step 8: Linting npm run lint

# Step 9: Build verification npm run build # Step 6: Commit code fixes # Step 10: Test npm test git add . # Step 11: 
Verify no secrets in git git log --all --oneline | head -20 git log -p --all -S 
"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" 2>&1 | head -5 # Should return: "No matches in history" git commit -m "fix: 
standardize environment variables and implement real database queries * POST /api/ml/predictions
 * * Create a prediction and log it for continued learning. * * Request body: * { * "loanId": "loan_123", * 
 "transferId": "transfer_456", * "features": { * "dpd": 45, * "utilization": 0.85, * "apr": 18.5, * "equifax_score": 
 720, * ... * }, * "predictionType": "pd", * "thresholds": { "high": 0.7, "medium": 0.4 } * } */
- Standardize SUPABASE_ANON_KEY to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
- Implement real database query in ml/predictions GET handler
- Remove placeholder comments and return empty arrays"
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = PredictionInputSchema.parse(body);

        const ml = new ContinueLearning();
        const prediction = await ml.predictAndLog(input);

        return NextResponse.json(
            {
                success: true,
                data: prediction,
                message: "Prediction logged for continued learning",
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation error",
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            console.error("Prediction error:", error.message);
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Unknown error",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ml/predictions?loanId=loan_123
 * 
 * Retrieve predictions for a specific loan.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const loanId = searchParams.get("loanId");

        if (!loanId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "loanId query parameter required",
                },
                { status: 400 }
            );
        }

        // This would query the database - for now return placeholder
        // In production, query ml.predictions table filtered by loan_id
        return NextResponse.json(
            {
                success: true,
                data: [],
                message: "Implement database query in production",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
