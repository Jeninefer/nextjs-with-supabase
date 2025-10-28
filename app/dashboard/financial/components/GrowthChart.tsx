'use client';

import { useMemo } from "react";

import { financialIntelligence } from "@/lib/data/financial-intelligence";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function GrowthChart() {
  const { series, compoundAnnualGrowth, trailingTwelveMonthNetNewAssets, yoyRevenueGrowth, comment } =
    financialIntelligence.growth;

  const { path, gradientStops, yTicks, minValue, maxValue } = useMemo(() => {
    const navValues = series.map((point) => point.nav);
    const maxValue = Math.max(...navValues);
    const minValue = Math.min(...navValues);
    const yRange = maxValue - minValue || 1;

    const points = series.map((point, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 100 - ((point.nav - minValue) / yRange) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const areaPath = [`0,100`, ...points, `100,100`].join(" ");

    const stops = [
      { offset: "0%", color: "rgba(168, 85, 247, 0.35)" },
      { offset: "70%", color: "rgba(79, 70, 229, 0.18)" },
      { offset: "100%", color: "rgba(15, 23, 42, 0.01)" },
    ];

    const ticks = Array.from({ length: 4 }).map((_, idx) => {
      const ratio = idx / 3;
      const value = maxValue - ratio * yRange;
      return { value, y: ratio * 100 };
    });

    return { path: areaPath, gradientStops: stops, yTicks: ticks, minValue, maxValue };
  }, [series]);

  const latest = series[series.length - 1];

  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-xl font-semibold text-white font-['Lato']">Growth Performance</h3>
        <p className="text-sm text-purple-200/80 font-['Poppins']">{comment}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-slate-900/40 rounded-xl border border-purple-400/10 p-4">
          <div className="relative h-64">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  {gradientStops.map((stop) => (
                    <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </linearGradient>
              </defs>
              <polyline
                fill="url(#growthGradient)"
                stroke="rgba(192, 132, 252, 0.8)"
                strokeWidth="0.6"
                points={path}
              />
              {series.map((point, index) => {
                const x = (index / (series.length - 1)) * 100;
                const y = 100 - ((point.nav - minValue) / (maxValue - minValue || 1)) * 100;

                return (
                  <circle key={point.month} cx={x} cy={y} r={index === series.length - 1 ? 1.4 : 0.9} fill="#C084FC" />
                );
              })}
              {yTicks.map((tick, idx) => (
                <g key={idx}>
                  <line x1="0" x2="100" y1={tick.y} y2={tick.y} stroke="rgba(148, 163, 184, 0.1)" strokeWidth="0.3" />
                  <text
                    x="1"
                    y={tick.y - 1}
                    fontSize="3"
                    fill="rgba(226, 232, 240, 0.5)"
                  >
                    {formatCurrency(tick.value, financialIntelligence.baseCurrency, {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    })}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-300">
            {series.slice(-6).map((point) => (
              <div key={point.month} className="flex flex-col">
                <span className="font-semibold text-purple-200/80">{point.month}</span>
                <span>{formatCurrency(point.nav, financialIntelligence.baseCurrency)}</span>
                <span className="text-[11px] text-slate-400">
                  Net Inflow {formatCurrency(point.netInflow, financialIntelligence.baseCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 grid gap-4">
          <div className="bg-slate-800/50 rounded-lg border border-purple-400/20 p-4">
            <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold">Compound Annual Growth</p>
            <p className="text-3xl font-bold text-white mt-2">{formatPercent(compoundAnnualGrowth)}</p>
            <p className="text-xs text-purple-200/80 mt-1">
              Based on NAV progression from Jan through Dec 2024.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg border border-purple-400/20 p-4">
            <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold">TTM Net New Assets</p>
            <p className="text-3xl font-bold text-white mt-2">
              {formatCurrency(trailingTwelveMonthNetNewAssets, financialIntelligence.baseCurrency)}
            </p>
            <p className="text-xs text-purple-200/80 mt-1">
              Revenue expanded {formatPercent(yoyRevenueGrowth)} year over year.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg border border-purple-400/20 p-4">
            <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold">Latest Month NAV</p>
            <p className="text-3xl font-bold text-white mt-2">
              {formatCurrency(latest.nav, financialIntelligence.baseCurrency)}
            </p>
            <p className="text-xs text-purple-200/80 mt-1">
              Retention {formatPercent(latest.retention, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
