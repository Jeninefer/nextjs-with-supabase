'use client';

import { financialIntelligence } from "@/lib/data/financial-intelligence";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, CircleAlert } from "lucide-react";

/**
 * Format a metric's numeric value for display according to the metric's presentation type.
 *
 * @param metric - Metric object whose `presentation` determines formatting (e.g., "currency", "percentage", "count")
 * @returns The metric value formatted as a display string (currency formatted using the metric's currency when `presentation` is "currency"; percentage with up to 1 decimal when `presentation` is "percentage`; integer-style formatting when `presentation` is "count" or unspecified)
 */
function getMetricValue(metric: (typeof financialIntelligence.metrics)[number]) {
  switch (metric.presentation) {
    case "currency":
      return formatCurrency(metric.value, metric.currency);
    case "percentage":
      return formatPercent(metric.value, { maximumFractionDigits: 1 });
    case "count":
    default:
      return formatNumber(metric.value, { maximumFractionDigits: 0 });
  }
}

/**
 * Format a metric's change into a single display string.
 *
 * @param metric - Metric object whose change will be formatted; uses `metric.change.percentage`, `metric.change.absolute`, `metric.change.period`, `metric.presentation`, and `metric.currency` to determine formatting.
 * @returns A string in the form `<signed percentage> (<PERIOD>) · <signed absolute change>`, where `PERIOD` is uppercased and the absolute change is formatted according to the metric's presentation.
 */
function getMetricChange(metric: (typeof financialIntelligence.metrics)[number]) {
  const formattedPercentage = formatPercent(metric.change.percentage, {
    maximumFractionDigits: 1,
    signDisplay: "always",
  });

  const formattedAbsolute =
    metric.presentation === "percentage"
      ? formatPercent(metric.change.absolute, {
          maximumFractionDigits: 1,
          signDisplay: "always",
        })
      : metric.presentation === "currency"
        ? formatCurrency(metric.change.absolute, metric.currency, {
            notation: "compact",
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
            signDisplay: "always",
          })
        : formatNumber(metric.change.absolute, { signDisplay: "always" });

  return `${formattedPercentage} (${metric.change.period.toUpperCase()}) · ${formattedAbsolute}`;
}

/**
 * Render a styled dashboard section displaying financial metrics, each with its value, description, and change indicator.
 *
 * The section includes an "As of" timestamp and a responsive grid of metric cards showing label, directional icon,
 * formatted value, description, and a formatted change line.
 *
 * @returns A JSX element containing the financial metrics section
 */
export default function FinancialMetrics() {
  const metrics = financialIntelligence.metrics;

  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white font-['Lato']">Financial Metrics</h3>
          <div className="flex items-center gap-2 text-xs text-purple-200/80">
            <CircleAlert size={14} />
            <span>As of {financialIntelligence.asOf}</span>
          </div>
        </div>
        <p className="text-sm text-purple-200/80 font-['Poppins']">
          Quarterly ledger close aggregated from ABACO Data Lakehouse.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.change.direction === "up" ? ArrowUpRight : ArrowDownRight;

          return (
            <div
              key={metric.id}
              className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20 transition-colors hover:border-purple-300/40"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold">
                    {metric.label}
                  </p>
                </div>
                <Icon
                  size={18}
                  className={cn(
                    'text-purple-200',
                    metric.change.direction === 'down' && 'text-red-300'
                  )}
                />
              </div>

              <p className="text-3xl font-bold text-white leading-tight">
                {getMetricValue(metric)}
              </p>
              <p className="text-xs text-purple-200/80 mt-2">{metric.description}</p>
              <p
                className={cn(
                  'text-xs mt-2 font-medium',
                  metric.change.direction === 'up' ? 'text-emerald-300' : 'text-red-300'
                )}
              >
                {getMetricChange(metric)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}