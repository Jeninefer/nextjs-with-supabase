import { createBrowserClient } from "@supabase/ssr";

import { supabasePublicEnv } from "../env";

export function createClient() {
  return createBrowserClient(supabasePublicEnv.url, supabasePublicEnv.anonKey);
}
