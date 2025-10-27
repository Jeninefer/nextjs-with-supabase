import { getRequiredEnvVar, getSupabaseBrowserEnvKeys, getSupabaseServiceRoleKey, hasSupabaseEnvVars } from "@/lib/utils";

type EnvRecord = Partial<Record<string, string | undefined>>;

export interface SupabaseBrowserConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseServiceConfig extends SupabaseBrowserConfig {
  serviceRoleKey: string;
}

export function getSupabaseBrowserConfig(env: EnvRecord = process.env): SupabaseBrowserConfig {
  const [urlKey, anonKey] = getSupabaseBrowserEnvKeys();
  return {
    url: getRequiredEnvVar(urlKey, env),
    anonKey: getRequiredEnvVar(anonKey, env),
  };
}

export function getSupabaseServiceConfig(env: EnvRecord = process.env): SupabaseServiceConfig {
  const browserConfig = getSupabaseBrowserConfig(env);
  return {
    ...browserConfig,
    serviceRoleKey: getSupabaseServiceRoleKey(env),
  };
}

export { hasSupabaseEnvVars };
