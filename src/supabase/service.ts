import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceConfig } from "@/supabase/config";

type CreateClientOptions = Parameters<typeof createSupabaseClient>[2];

export function createServiceRoleClient<Database = any>(options?: CreateClientOptions): SupabaseClient<Database> {
  const { url, serviceRoleKey } = getSupabaseServiceConfig();
  return createSupabaseClient<Database>(url, serviceRoleKey, options);
}
