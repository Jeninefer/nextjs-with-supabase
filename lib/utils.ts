import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// If you have custom color utilities, update them:
// Instead of: import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
// Use: Access colors directly from Tailwind config
