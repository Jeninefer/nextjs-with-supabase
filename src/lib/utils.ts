import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPABASE_BROWSER_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
] as const;

const SUPABASE_SERVICE_ENV_KEY = "SUPABASE_SERVICE_ROLE_KEY" as const;

type EnvRecord = Partial<Record<string, string | undefined>>;

/**
 * Read an environment variable ensuring it is present and not blank.
 * Throws a descriptive error to make local setup issues easier to debug.
 */
export function getRequiredEnvVar(key: string, env: EnvRecord = process.env): string {
  const value = env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable "${key}" is required but was not provided.`);
  }
  return value;
}

/**
 * Return the Supabase environment keys that must be configured for the app to function.
 */
export function getSupabaseBrowserEnvKeys() {
  return [...SUPABASE_BROWSER_ENV_KEYS];
}

/**
 * Determine whether all required Supabase environment variables are configured.
 */
export function hasSupabaseEnvVars(env: EnvRecord = process.env): boolean {
  return SUPABASE_BROWSER_ENV_KEYS.every((key) => {
    const value = env[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/**
 * Backwards compatible boolean used across the legacy pages to decide whether to show setup hints.
 */
export const hasEnvVars = hasSupabaseEnvVars();

/**
 * Retrieve the Supabase service role key when it is required for server-side operations.
 */
export function getSupabaseServiceRoleKey(env: EnvRecord = process.env): string {
  return getRequiredEnvVar(SUPABASE_SERVICE_ENV_KEY, env);
}
