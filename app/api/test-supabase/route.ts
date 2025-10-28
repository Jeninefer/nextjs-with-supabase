import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Helper to mask sensitive values
  const mask = (val?: string) =>
    val ? val.slice(0, 6) + "..." + val.slice(-4) : undefined;

  // Validate env vars
  if (!url || !anonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Supabase environment variables",
        diagnostics: {
          NEXT_PUBLIC_SUPABASE_URL: url ? mask(url) : null,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? mask(anonKey) : null,
        },
        hint: "Check your .env or deployment environment variables.",
      },
      { status: 500 }
    );
  }

  // Validate URL format
  if (!/^https?:\/\/.+\..+/.test(url)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid Supabase URL: Must be a valid HTTP or HTTPS URL.",
        diagnostics: {
          NEXT_PUBLIC_SUPABASE_URL: mask(url),
        },
        hint: "Your Supabase URL should look like https://xyzcompany.supabase.co",
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from("test_table")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase query failed",
          details: error.message,
          diagnostics: {
            NEXT_PUBLIC_SUPABASE_URL: mask(url),
            NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(anonKey),
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase connectivity and query succeeded.",
      sample: data,
      diagnostics: {
        NEXT_PUBLIC_SUPABASE_URL: mask(url),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(anonKey),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected error during Supabase connectivity test",
        details: err instanceof Error ? err.message : String(err),
        diagnostics: {
          NEXT_PUBLIC_SUPABASE_URL: mask(url),
          NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(anonKey),
        },
      },
      { status: 500 }
    );
  }
}
