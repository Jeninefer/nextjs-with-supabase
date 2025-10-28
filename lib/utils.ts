import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const defaultNumberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    ...options,
  });

  return formatter.format(value);
}

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
    minimumFractionDigits: 1,
    ...options,
  });

  return formatter.format(value);
}

export function formatPercent(value: number, options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "auto",
    ...options,
  });

  return formatter.format(value);
}

export function formatDelta(value: number) {
  return defaultNumberFormat.format(value);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
