import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import type { FinancialMetricSummary } from '@/lib/data/financial-intelligence';

type FinancialMetricsProps = {
  metrics: FinancialMetricSummary;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat('en-US');

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const signedPercentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
});

function ChangeIndicator({ value, positiveIsGood }: { value: number; positiveIsGood: boolean }) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.0005) {
    return <span className="text-xs text-slate-400">No change</span>;
  }

  const isPositive = value >= 0;
  const isImproving = positiveIsGood ? isPositive : !isPositive;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={`flex items-center gap-1 text-xs ${isImproving ? 'text-emerald-400' : 'text-rose-400'}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {signedPercentFormatter.format(value)}
    </span>
  );
}

export default function FinancialMetrics({ metrics }: FinancialMetricsProps) {
  const metricCards: Array<{
    label: string;
    display: string;
    change: number;
    positiveIsGood: boolean;
  }> = [
    {
      label: 'Assets Under Management',
      display: currencyFormatter.format(metrics.assetsUnderManagement),
      change: metrics.assetsUnderManagementChange,
      positiveIsGood: true,
    },
    {
      label: 'Active Borrowers',
      display: integerFormatter.format(metrics.activeBorrowers),
      change: metrics.activeBorrowersChange,
      positiveIsGood: true,
    },
    {
      label: 'Default Rate',
      display: percentFormatter.format(metrics.defaultRate),
      change: metrics.defaultRateChange,
      positiveIsGood: false,
    },
    {
      label: 'Weighted APR',
      display: percentFormatter.format(metrics.weightedApr),
      change: metrics.weightedAprChange,
      positiveIsGood: true,
    },
    {
      label: 'Net Interest Margin',
      display: percentFormatter.format(metrics.netInterestMargin),
      change: metrics.netInterestMarginChange,
      positiveIsGood: true,
    },
    {
      label: 'Liquidity Coverage',
      display: `${metrics.liquidityCoverageRatio.toFixed(2)}x`,
      change: metrics.liquidityCoverageChange,
      positiveIsGood: true,
    },
  ];

  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-xl font-semibold text-white font-['Lato']">Financial Metrics</h3>
        <p className="text-sm text-purple-200 font-['Poppins']">
          Revenue expanded {percentFormatter.format(metrics.monthOverMonthRevenueGrowth)} month over month and {percentFormatter.format(metrics.yearOverYearRevenueGrowth)} year over year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricCards.map(({ label, display, change, positiveIsGood }) => (
          <article key={label} className="bg-slate-900/40 p-4 rounded-lg border border-purple-400/20">
            <div className="text-xs uppercase tracking-wide text-purple-300 font-['Poppins']">{label}</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-semibold text-white">{display}</span>
              <ChangeIndicator value={change} positiveIsGood={positiveIsGood} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
