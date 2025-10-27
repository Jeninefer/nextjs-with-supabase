import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates and returns a Supabase client configured for browser usage.
 *
 * The client is initialized using the public Supabase URL and anon key taken from
 * the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.
 *
 * @returns A Supabase client instance configured with the public URL and anon key
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}