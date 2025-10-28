import { createClient } from "@supabase/supabase-js";

type Timings = {
  queryMs?: number;
  totalMs: number;
};

const toMilliseconds = (value: number) => Number(value.toFixed(2));

const buildHeaders = ({ queryMs, totalMs }: Timings) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Total-Time-ms": totalMs.toString(),
  });

  const serverTiming: string[] = [`total;dur=${totalMs}`];

  if (typeof queryMs === "number") {
    headers.set("X-Query-Time-ms", queryMs.toString());
    serverTiming.unshift(`supabaseQuery;dur=${queryMs}`);
  }

  headers.set("Server-Timing", serverTiming.join(", "));

  return headers;
};

const createErrorReference = () => {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  return `err-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

export async function GET(): Promise<Response> {
  const totalStart = performance.now();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const totalMs = toMilliseconds(performance.now() - totalStart);
    const payload = {
      ok: false,
      error: {
        code: "missing_environment_configuration",
        message: "Supabase configuration is incomplete.",
      },
      meta: {
        env: {
          hasSupabaseUrl: Boolean(supabaseUrl),
          hasServiceRoleKey: Boolean(serviceRoleKey),
        },
        timings: {
          total_request_ms: totalMs,
        },
      },
    } satisfies Record<string, unknown>;

    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: buildHeaders({ totalMs }),
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        "x-application-name": "supabase-connectivity-test",
      },
    },
  });

  try {
    const queryStart = performance.now();
    const { data, error } = await supabase
      .from("kv_store_08a31cde")
      .select("*")
      .limit(10);
    const queryMs = toMilliseconds(performance.now() - queryStart);

    if (error) {
      const totalMs = toMilliseconds(performance.now() - totalStart);
      const errorReference = createErrorReference();
      console.error(
        "Supabase connectivity test query failed",
        errorReference,
        error,
      );

      const payload = {
        ok: false,
        error: {
          code: "supabase_query_failed",
          message: "Unable to query Supabase test table.",
          reference: errorReference,
        },
        meta: {
          env: {
            hasSupabaseUrl: true,
            hasServiceRoleKey: true,
          },
          timings: {
            query_ms: queryMs,
            total_request_ms: totalMs,
          },
        },
      } satisfies Record<string, unknown>;

      return new Response(JSON.stringify(payload), {
        status: 502,
        headers: buildHeaders({ queryMs, totalMs }),
      });
    }

    const totalMs = toMilliseconds(performance.now() - totalStart);
    const payload = {
      ok: true,
      data: data ?? [],
      count: data?.length ?? 0,
      meta: {
        env: {
          hasSupabaseUrl: true,
          hasServiceRoleKey: true,
        },
        timings: {
          query_ms: queryMs,
          total_request_ms: totalMs,
        },
      },
    } satisfies Record<string, unknown>;

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: buildHeaders({ queryMs, totalMs }),
    });
  } catch (unknownError) {
    const totalMs = toMilliseconds(performance.now() - totalStart);
    const errorReference = createErrorReference();
    console.error(
      "Supabase connectivity test encountered an unexpected error",
      errorReference,
      unknownError,
    );

    const payload = {
      ok: false,
      error: {
        code: "internal_server_error",
        message: "An unexpected error occurred.",
        reference: errorReference,
      },
      meta: {
        timings: {
          total_request_ms: totalMs,
        },
      },
    } satisfies Record<string, unknown>;

    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: buildHeaders({ totalMs }),
    });
  }
}
