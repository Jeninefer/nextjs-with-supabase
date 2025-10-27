import { createBrowserClient } from "@supabase/ssr";

import { assertEnvVar } from "../utils";

export function createClient() {
  const supabaseUrl = assertEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
  const supabaseAnonKey = assertEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
  );

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
