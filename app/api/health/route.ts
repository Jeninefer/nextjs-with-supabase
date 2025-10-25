import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    checks: {
      supabase: false,
      database: false,
    },
  };

  try {
    // Check Supabase connection
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Test connection with a simple query
      // Use a lightweight system table to check database connectivity
      // Use a lightweight query on a user table to check database connectivity
      const { error } = await supabase
        .from("abaco_customers")
        .select("id")
        .limit(1);

      healthCheck.checks.supabase = !error;
      healthCheck.checks.database = !error;
    }

    // Determine overall status
    const allChecksPass = Object.values(healthCheck.checks).every(
      (check) => check
    );
    healthCheck.status = allChecksPass ? "ok" : "degraded";

    return NextResponse.json(healthCheck, {
      status: allChecksPass ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...healthCheck,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
      }
    );
  }
}
