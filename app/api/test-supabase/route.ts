import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test connection with your existing kv_store table
    const { data, error } = await supabase
      .from("kv_store_08a31cde")
      .select("*")
      .limit(1);

    return NextResponse.json({
      status: "connected",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasData: !!data,
      error: error?.message || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
