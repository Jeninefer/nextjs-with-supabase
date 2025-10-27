const REQUIRED_PUBLIC_ENV = {
  NEXT_PUBLIC_SUPABASE_URL:
    "Provide the Supabase project URL found under Settings → API in the Supabase dashboard.",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:
    "Provide the Supabase publishable (anon) key from Settings → API → Project API keys.",
} as const;

type RequiredPublicEnvKey = keyof typeof REQUIRED_PUBLIC_ENV;

const cache = new Map<RequiredPublicEnvKey, string>();

function formatMissingEnvMessage(key: RequiredPublicEnvKey): string {
  const guidance = REQUIRED_PUBLIC_ENV[key];
  return [
    `Environment variable "${key}" is required but was not provided.`,
    guidance,
    "Add the value to your \`.env.local\` file or your hosting provider's environment configuration before starting the application.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function readRequiredPublicEnv(key: RequiredPublicEnvKey): string {
  const cachedValue = cache.get(key);
  if (cachedValue) {
    return cachedValue;
  }

  const rawValue = process.env[key];
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    throw new Error(formatMissingEnvMessage(key));
  }

  const normalizedValue = rawValue.trim();
  cache.set(key, normalizedValue);
  return normalizedValue;
}

const resolvedEnv = Object.freeze({
  NEXT_PUBLIC_SUPABASE_URL: readRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: readRequiredPublicEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
  ),
});

export const env = resolvedEnv;

export const supabasePublicEnv = Object.freeze({
  url: resolvedEnv.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: resolvedEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
});

export function validatePublicEnv(): Readonly<typeof resolvedEnv> {
  return resolvedEnv;
}

export function getRequiredPublicEnv(key: RequiredPublicEnvKey): string {
  return readRequiredPublicEnv(key);
}
