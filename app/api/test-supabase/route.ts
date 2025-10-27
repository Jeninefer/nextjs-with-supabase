import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getSupabaseServiceRoleKey, supabasePublicEnv } from "../../../lib/env";

export async function GET() {
  try {
    const supabase = createClient(
      supabasePublicEnv.url,
      getSupabaseServiceRoleKey()
    );

    // Test connection with your existing kv_store table
    const { data, error } = await supabase
      .from("kv_store_08a31cde")
      .select("*")
      .limit(1);

    return NextResponse.json({
      status: "connected",
      supabaseUrl: supabasePublicEnv.url,
      hasData: !!data,
      dataCount: data?.length || 0,
      error: error?.message || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
