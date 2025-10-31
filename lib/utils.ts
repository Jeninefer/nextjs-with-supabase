import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose and normalize CSS class names and resolve Tailwind utility conflicts.
 *
 * @param inputs - Values accepted by `clsx` (strings, arrays, objects, etc.) that contribute class names
 * @returns A single string of normalized class names with Tailwind duplicates and conflicts merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const requiredEnvVars = () => [
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
];

/**
 * Checks that required Supabase environment variables are present and non-empty.
 *
 * Specifically verifies that NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY are defined and contain
 * at least one non-whitespace character.
 *
 * @returns `true` if both environment variables are present and contain non-whitespace characters, `false` otherwise.
 */
export function hasEnvVars(): boolean {
  return requiredEnvVars().every(
    (envVar) => typeof envVar === "string" && envVar.trim().length > 0,
  );
}

// If you have custom color utilities, update them:
// Instead of: import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
// Use: Access colors directly from Tailwind config