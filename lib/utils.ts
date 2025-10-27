import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assertEnvVar(value: string | undefined, name: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

// If you have custom color utilities, update them:
// Instead of: import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
// Use: Access colors directly from Tailwind config
