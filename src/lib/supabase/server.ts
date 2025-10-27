import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseBrowserConfig } from "@/supabase/config";

const isPromiseLike = (value: unknown): value is Promise<unknown> => {
  return Boolean(value && typeof (value as Record<string, unknown>).then === "function");
};

async function resolveCookieStore(maybePromise: unknown) {
  return isPromiseLike(maybePromise) ? await maybePromise : maybePromise;
}

async function createCookiesAdapter(cookieSource: unknown) {
  const cookieStore = await resolveCookieStore(cookieSource);

  return {
    getAll() {
      if (cookieStore && typeof (cookieStore as Record<string, unknown>).getAll === "function") {
        return (cookieStore as { getAll: () => Array<{ name: string; value: string }> }).getAll();
      }
      if (Array.isArray(cookieStore)) {
        return cookieStore;
      }
      return [] as Array<{ name: string; value: string }>;
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
      try {
        if (cookieStore && typeof (cookieStore as Record<string, unknown>).set === "function") {
          cookiesToSet.forEach(({ name, value, options }) =>
            (cookieStore as { set: (name: string, value: string, options?: Record<string, unknown>) => void }).set(
              name,
              value,
              options,
            ),
          );
        }
      } catch {
        // Ignore write attempts from read-only contexts (e.g. Server Components).
      }
    },
  };
}

export async function createClient() {
  const cookieStore = await cookies();
  const cookiesAdapter = await createCookiesAdapter(cookieStore);
  const { url, anonKey } = getSupabaseBrowserConfig();

  return createServerClient(url, anonKey, { cookies: cookiesAdapter });
}
