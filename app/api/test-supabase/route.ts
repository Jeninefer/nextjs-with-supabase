import { createClient } from "@supabase/supabase-js";

export async function GET() {
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

    // Measure query time
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
          // server-timing helps browsers show metrics in DevTools
          "Server-Timing": `db;dur=${queryTimeMs}`,
        },
      });
    }

    const totalMs = Date.now() - startTotal;

    const responseBody = {
      ok: true,
      meta: {
        timings: {
          query_ms: queryTimeMs,
          total_request_ms: totalMs,
        },
        environment: {
          url_present: !!url,
          service_key_present: !!serviceKey,
        },
      },
      count: (data || []).length,
      data,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Query-Time-ms": String(queryTimeMs),
        "X-Total-Time-ms": String(totalMs),
        // Server-Timing header format: <metricname>;dur=<duration-ms>
        "Server-Timing": `db;dur=${queryTimeMs}, total;dur=${totalMs}`,
      },
    });
  } catch (err: unknown) {
    const totalMs = Date.now() - startTotal;
    const body = {
      error: err instanceof Error ? err.message : String(err),
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
