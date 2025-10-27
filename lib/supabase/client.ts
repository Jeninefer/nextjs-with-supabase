import { createBrowserClient } from "@supabase/ssr";

import { supabaseConfig } from "../env";

export function createClient() {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
