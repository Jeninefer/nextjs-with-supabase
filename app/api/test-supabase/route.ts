import { createClient } from "npm:@supabase/supabase-js";

export async function GET(request: Request) {
  const startTotal = Date.now();

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      const body = {
        error:
          "Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      };

      return new Response(JSON.stringify(body), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
      global: { headers: { "x-application-name": "nextjs-test-supabase" } },
    });

    const queryStart = Date.now();
    const { data, error } = await supabase
      .from("kv_store_08a31cde")
      .select("*")
      .limit(10);
    const queryEnd = Date.now();
    const queryTimeMs = queryEnd - queryStart;

    if (error) {
      const body = { error: error.message, queryTimeMs };

      return new Response(JSON.stringify(body), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Query-Time-ms": String(queryTimeMs),
          "Server-Timing": `db;dur=${queryTimeMs}`,
        },
      });
    }

    const totalMs = Date.now() - startTotal;
    const responseBody = {
      ok: true,
      meta: {
        environment: {
          url_present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          service_key_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
        timings: {
          query_ms: queryTimeMs,
          total_request_ms: totalMs,
        },
      },
      count: data?.length ?? 0,
      data: data ?? [],
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Query-Time-ms": String(queryTimeMs),
        "X-Total-Time-ms": String(totalMs),
        "Server-Timing": `db;dur=${queryTimeMs}, total;dur=${totalMs}`,
      },
    });
  } catch (err) {
    const totalMs = Date.now() - startTotal;
    // Log full error details server-side for debugging
    console.error("Unexpected error in test-supabase endpoint:", err);
    const body = {
      error: "An unexpected error occurred.",
      meta: { timings: { total_request_ms: totalMs } },
    };

    return new Response(JSON.stringify(body), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Total-Time-ms": String(totalMs),
        "Server-Timing": `total;dur=${totalMs}`,
      },
    });
  }
}
