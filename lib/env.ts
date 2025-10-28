class MissingEnvironmentVariableError extends Error {
  constructor(variableNames: readonly string[]) {
    const formattedNames = variableNames.map((name) => `\`${name}\``).join(", ");
    super(
      `Missing required environment variable${variableNames.length > 1 ? "s" : ""}: ${formattedNames}`,
    );
    this.name = "MissingEnvironmentVariableError";
  }
}

const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
] as const satisfies readonly string[];

type SupabaseEnvKey = (typeof SUPABASE_ENV_KEYS)[number];

type SupabaseEnvRecord = Record<SupabaseEnvKey, string>;

function readSupabaseEnv(): SupabaseEnvRecord {
  const missingKeys: SupabaseEnvKey[] = [];

  const values = SUPABASE_ENV_KEYS.reduce<Partial<SupabaseEnvRecord>>((acc, key) => {
    const value = process.env[key];

    if (typeof value === "string" && value.length > 0) {
      acc[key] = value;
      return acc;
    }

    missingKeys.push(key);
    return acc;
  }, {});

  if (missingKeys.length > 0) {
    throw new MissingEnvironmentVariableError(missingKeys);
  }

  return values as SupabaseEnvRecord;
}

const {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
} = readSupabaseEnv();

export const supabaseConfig = Object.freeze({
  url: NEXT_PUBLIC_SUPABASE_URL,
  anonKey: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
});

export type SupabaseConfig = typeof supabaseConfig;
