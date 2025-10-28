import { createBrowserClient } from "@supabase/ssr";

function getRequiredEnvVar(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function createClient() {
  const url = getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  const key = getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY");

  return createBrowserClient(url, key);
}
