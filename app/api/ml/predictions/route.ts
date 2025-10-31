import { CONFIG } from "@/lib/config";
import { ContinueLearning } from "@/lib/ml/continue-learning";
import { PredictionInputSchema } from "@/types/ml";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

const ml = new ContinueLearning();

export const maxDuration = 60;

function getAdminClient(): SupabaseClient {
  return createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_SERVICE_ROLE_KEY ?? CONFIG.SUPABASE_ANON_KEY,
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = PredictionInputSchema.parse(body);

    const prediction = await ml.predictAndLog(input);

    return NextResponse.json(
      {
        success: true,
        data: prediction,
        message: "Prediction logged for continued learning",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      console.error("Prediction error:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/ml/predictions?loanId=loan_123&limit=50
 *
 * Retrieve predictions for a specific loan.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");
    const predictionType = searchParams.get("predictionType") ?? undefined;
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const limit = Number.isNaN(limitParam) ? 100 : Math.min(Math.max(limitParam, 1), 500);

    if (!loanId) {
      return NextResponse.json(
        {
          success: false,
          error: "loanId query parameter required",
        },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    let query = supabase
      .from("ml.predictions")
      .select("*")
      .eq("loan_id", loanId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (predictionType) {
      query = query.eq("prediction_type", predictionType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Prediction query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
