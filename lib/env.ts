type EnvDescriptor = {
  readonly description: string;
  readonly fallbacks?: readonly string[];
};

const REQUIRED_PUBLIC_ENV: Record<string, EnvDescriptor> = {
  NEXT_PUBLIC_SUPABASE_URL: {
    description:
      "Provide the Supabase project URL found under Settings → API in the Supabase dashboard.",
  },
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: {
    description:
      "Provide the Supabase publishable (anon) key from Settings → API → Project API keys.",
    fallbacks: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  },
} as const satisfies Record<string, EnvDescriptor>;

const REQUIRED_SERVER_ENV: Record<string, EnvDescriptor> = {
  SUPABASE_SERVICE_ROLE_KEY: {
    description:
      "Provide the Supabase service role key from Settings → API → Project API keys (never expose this to the browser).",
  },
} as const satisfies Record<string, EnvDescriptor>;

type RequiredPublicEnvKey = keyof typeof REQUIRED_PUBLIC_ENV;
type RequiredServerEnvKey = keyof typeof REQUIRED_SERVER_ENV;

const publicCache = new Map<RequiredPublicEnvKey, string>();
const serverCache = new Map<RequiredServerEnvKey, string>();
const fallbackWarningsIssued = new Set<string>();

function emitFallbackWarning(primaryKey: string, fallbackKey: string) {
  const cacheKey = `${primaryKey}<-${fallbackKey}`;
  if (fallbackWarningsIssued.has(cacheKey)) {
    return;
  }

  fallbackWarningsIssued.add(cacheKey);
  console.warn(
    `Using deprecated environment variable "${fallbackKey}". Rename it to "${primaryKey}" to keep future compatibility.`,
  );
}

function formatMissingEnvMessage(key: string, descriptor: EnvDescriptor): string {
  const lines = [
    `Environment variable "${key}" is required but was not provided.`,
    descriptor.description,
  ];

  if (descriptor.fallbacks?.length) {
    lines.push(
      `Legacy aliases checked: ${descriptor.fallbacks.map((alias) => `"${alias}"`).join(", ")}.`,
      `Set "${key}" (preferred) or migrate from the legacy alias before starting the application.`,
    );
  }

  lines.push(
    "Add the value to your `.env.local` file or your hosting provider's environment configuration before starting the application.",
  );

  return lines.filter(Boolean).join("\n\n");
}

function readRequiredEnv<Key extends string>(
  key: Key,
  descriptor: EnvDescriptor,
  cache: Map<Key, string>,
): string {
  const cachedValue = cache.get(key);
  if (cachedValue) {
    return cachedValue;
  }

  const keysToCheck: readonly string[] = [key, ...(descriptor.fallbacks ?? [])];

  for (const candidate of keysToCheck) {
    const rawValue = process.env[candidate];
    if (typeof rawValue === "string" && rawValue.trim().length > 0) {
      const normalizedValue = rawValue.trim();
      cache.set(key, normalizedValue);
      if (candidate !== key) {
        emitFallbackWarning(key, candidate);
      }
      return normalizedValue;
    }
  }

  throw new Error(formatMissingEnvMessage(key, descriptor));
}

const resolvedPublicEnv = Object.freeze({
  NEXT_PUBLIC_SUPABASE_URL: readRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    REQUIRED_PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_URL,
    publicCache,
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: readRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
    REQUIRED_PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    publicCache,
  ),
});

export const env = resolvedPublicEnv;

export const supabasePublicEnv = Object.freeze({
  url: resolvedPublicEnv.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: resolvedPublicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
});

export function validatePublicEnv(): Readonly<typeof resolvedPublicEnv> {
  return resolvedPublicEnv;
}

export function getRequiredPublicEnv(key: RequiredPublicEnvKey): string {
  return readRequiredEnv(key, REQUIRED_PUBLIC_ENV[key], publicCache);
}

function readRequiredServerEnv(key: RequiredServerEnvKey): string {
  return readRequiredEnv(key, REQUIRED_SERVER_ENV[key], serverCache);
}

export function getRequiredServerEnv(key: RequiredServerEnvKey): string {
  return readRequiredServerEnv(key);
}

export function getSupabaseServiceRoleKey(): string {
  return readRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}
