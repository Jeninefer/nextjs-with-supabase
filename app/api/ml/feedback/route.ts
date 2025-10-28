import { ContinueLearning } from "@/lib/ml/continue-learning";
import { FeedbackInputSchema } from "@/types/ml";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const maxDuration = 60;

/**
 * POST /api/ml/feedback
 * 
 * Record actual outcome feedback for a prediction.
 * This is used for model calibration and continued learning.
 * 
 * Request body:
 * {
 *   "predictionId": "uuid-from-prediction",
 *   "loanId": "loan_123",
 *   "outcomeLabel": "DEFAULT",
 *   "outcomeScore": 0.95,
 *   "correct": false,
 *   "comments": "Loan defaulted in month 4 despite low initial score"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = FeedbackInputSchema.parse(body);

        const ml = new ContinueLearning();
        await ml.recordFeedback(input);

        return NextResponse.json(
            {
                success: true,
                message: "Feedback recorded for model learning",
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
            console.error("Feedback error:", error.message);
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
 * GET /api/ml/feedback/metrics?window=30d
 * 
 * Get model performance metrics for a time window.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const window = searchParams.get("window") ?? "30d";

        const ml = new ContinueLearning();
        const metrics = await ml.updateMetrics(parseInt(window));

        return NextResponse.json(
            {
                success: true,
                data: metrics,
                message: "Metrics calculated",
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