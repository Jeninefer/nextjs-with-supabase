import { ContinueLearning } from "@/lib/ml/continue-learning";
import { PredictionInputSchema } from "@/types/ml";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const maxDuration = 60;

/**
 * POST /api/ml/predictions
 * 
 * Create a prediction and log it for continued learning.
 * 
 * Request body:
 * {
 *   "loanId": "loan_123",
 *   "transferId": "transfer_456",
 *   "features": {
 *     "dpd": 45,
 *     "utilization": 0.85,
 *     "apr": 18.5,
 *     "equifax_score": 720,
 *     ...
 *   },
 *   "predictionType": "pd",
 *   "thresholds": { "high": 0.7, "medium": 0.4 }
 * }
 */
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