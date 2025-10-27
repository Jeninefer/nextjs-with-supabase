import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple class-name inputs into a single string and merge Tailwind utility classes to resolve conflicts.
 *
 * @param inputs - One or more class-name values (strings, arrays, objects, or booleans) that specify classes to include
 * @returns A single string of normalized class names with Tailwind utility class conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
] as const;

export const hasEnvVars = REQUIRED_ENV_VARS.every((key) => {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
});