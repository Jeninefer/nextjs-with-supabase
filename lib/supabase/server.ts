import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Ensure cookieStoreRef is the actual cookie store object (not a Promise)
 */
const resolveCookieStore = async (maybePromise: unknown) => {
  // If it's a Promise, await it; otherwise return as-is
  if (maybePromise && typeof (maybePromise as Record<string, unknown>).then === "function") {
    return await maybePromise;
  }
  return maybePromise;
};

/**
 * Create a cookies adapter that safely handles both synchronous and asynchronous cookie operations
 */
async function createCookiesAdapter(cookieSource: unknown) {
  const cookieStore = await resolveCookieStore(cookieSource);

  return {
    getAll() {
      // Some Next helpers return a ReadonlyRequestCookies synchronously,
      // others may require using .getAll() on the resolved object.
      if (cookieStore && typeof (cookieStore as Record<string, unknown>).getAll === "function") {
        return (cookieStore as { getAll: () => Array<{ name: string; value: string }> }).getAll();
      }
      // If cookieStore is an array-like object, return it directly
      if (Array.isArray(cookieStore)) {
        return cookieStore;
      }
      // Fallback: empty array
      return [];
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
      try {
        if (cookieStore && typeof (cookieStore as Record<string, unknown>).set === "function") {
          cookiesToSet.forEach(({ name, value, options }) =>
            (cookieStore as { set: (name: string, value: string, options?: Record<string, unknown>) => void }).set(name, value, options)
          );
          return;
        }

        // If cookieStore has a write method with a different name or is readonly,
        // just swallow the call (this happens when called from Server Components).
      } catch {
        // The `setAll` method may be called from a Server Component where writing cookies isn't allowed.
        // Ignore safely.
      }
    },
  };
}

/**
 * Create a Supabase server client configured to use Next.js cookies for SSR.
 *
 * Creates and returns a server-side Supabase client whose cookie handling is
 * backed by a cookies adapter derived from Next.js `cookies()`. This function
 * reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
 * environment variables and asserts their presence.
 *
 * Do not reuse the returned client across concurrent requests or long-lived
 * globals; instantiate a new client for each request or compute invocation.
 *
 * @returns A Supabase server client instance configured to use the resolved cookies adapter.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const cookiesAdapter = await createCookiesAdapter(cookieStore);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookiesAdapter,
    },
  );
}