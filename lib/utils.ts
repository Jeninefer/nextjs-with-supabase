import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { validatePublicEnv } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// If you have custom color utilities, update them:
// Instead of: import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
// Use: Access colors directly from Tailwind config

let cachedEnvStatus: boolean | null = null;
let cachedEnvError: Error | null = null;

function ensureEnvEvaluated(): void {
  if (cachedEnvStatus !== null) {
    return;
  }

  try {
    validatePublicEnv();
    cachedEnvStatus = true;
    cachedEnvError = null;
  } catch (error) {
    cachedEnvStatus = false;
    cachedEnvError = error instanceof Error ? error : new Error(String(error));

    if (process.env.NODE_ENV !== "production") {
      console.warn(cachedEnvError.message);
    }
  }
}

export const hasEnvVars = (() => {
  ensureEnvEvaluated();
  return cachedEnvStatus === true;
})();

export function ensureEnvVars(): void {
  ensureEnvEvaluated();

  if (cachedEnvStatus) {
    return;
  }

  throw cachedEnvError ?? new Error("Missing required environment variables.");
}

export function getEnvValidationError(): Error | null {
  ensureEnvEvaluated();
  return cachedEnvError;
}
