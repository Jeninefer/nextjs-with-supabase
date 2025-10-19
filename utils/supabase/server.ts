import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Ensure cookieStoreRef is the actual cookie store object (not a Promise)
const resolveCookieStore = async (maybePromise: unknown) => {
  // If it's a Promise, await it; otherwise return as-is
  if (maybePromise && typeof (maybePromise as any).then === 'function') {
    return await (maybePromise as any);
  }
  return maybePromise;
};

async function createCookiesAdapter(cookieSource: unknown) {
  const cookieStore = await resolveCookieStore(cookieSource);

  return {
    getAll() {
      // Some Next helpers return a ReadonlyRequestCookies synchronously,
      // others may require using .getAll() on the resolved object.
      if (cookieStore?.getAll && typeof cookieStore.getAll === 'function') {
        return cookieStore.getAll();
      }
      // If cookieStore is an array-like object, return it directly
      if (Array.isArray(cookieStore)) {
        return cookieStore;
      }
      // Fallback: empty array
      return [];
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      try {
        if (cookieStore?.set && typeof cookieStore.set === 'function') {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
          return;
        }

        // If cookieStore has a write method with a different name or is readonly,
        // just swallow the call (this happens when called from Server Components).
      } catch (e) {
        // The `setAll` method may be called from a Server Component where writing cookies isn't allowed.
        // Ignore safely.
      }
    },
  };
}

export async function createClient() {
  const cookieStore = cookies();
  const cookiesAdapter = await createCookiesAdapter(cookieStore);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookiesAdapter,
    }
  );
}

// Alternative synchronous version for cases where async is not needed
export function createClientSync() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
