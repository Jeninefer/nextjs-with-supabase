import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class value inputs into a single string and resolves Tailwind class conflicts.
 *
 * @param inputs - One or more class value inputs (strings, arrays, objects, etc.) to be combined
 * @returns A single class name string with conflicting Tailwind classes merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const defaultNumberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/**
 * Format a number using the en-US locale, defaulting to at most one fractional digit.
 *
 * @param value - The number to format
 * @param options - Intl.NumberFormatOptions to override defaults; by default `maximumFractionDigits` is 1
 * @returns The formatted number string according to the en-US locale and provided options
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    ...options,
  });
  return formatter.format(value);
}

/**
 * Format a numeric amount as a compact en-US currency string with one decimal digit.
 *
 * @param value - The numeric amount to format
 * @param currency - The ISO 4217 currency code to use (defaults to "USD")
 * @param options - Additional Intl.NumberFormatOptions to override defaults
 * @returns The formatted currency string (for example, "$1.2K")
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  options?: Intl.NumberFormatOptions
) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  });
  return formatter.format(value);
}

/**
 * Format a numeric value as a percentage string using en-US locale.
 *
 * @param value - The numeric value to format (e.g., `0.5` → "50%").
 * @param options - Optional Intl.NumberFormatOptions to override defaults (default: `style: "percent"`, `maximumFractionDigits: 1`, `signDisplay: "auto"`).
 * @returns The formatted percentage string.
 */
export function formatPercent(value: number, options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "auto",
    ...options,
  });
  return formatter.format(value);
}

/**
 * Formats a numeric delta using the shared default number formatter.
 *
 * @param value - The numeric delta to format
 * @returns The formatted number string (en-US locale, up to one decimal place)
 */
export function formatDelta(value: number) {
  return defaultNumberFormat.format(value);
}

/**
 * Formats a parseable date-time string into a localized en-US date and time.
 *
 * @param value - A parseable date-time string (for example, an ISO 8601 string)
 * @returns The formatted date and time using en-US medium date style and short time style
 */
export function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);
