import type { GrowthDataPoint } from '@/lib/data/financial-intelligence';

type GrowthChartProps = {
  points: GrowthDataPoint[];
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const signedPercentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
});

const integerFormatter = new Intl.NumberFormat('en-US');

export default function GrowthChart({ points }: GrowthChartProps) {
  const maxRevenue = Math.max(...points.map(point => point.netRevenue));
  const safeMaxRevenue = maxRevenue > 0 ? maxRevenue : 1;

  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <header className="mb-6 space-y-2">
        <h3 className="text-xl font-semibold text-white font-['Lato']">Revenue & Originations</h3>
        <p className="text-sm text-purple-200 font-['Poppins']">
          Trailing six months of portfolio revenue and disbursement activity.
        </p>
      </header>

      <div className="space-y-5">
        {points.map(point => {
          const width = Math.max((point.netRevenue / safeMaxRevenue) * 100, 6);
          const growthColour = point.revenueGrowth === null || point.revenueGrowth >= 0 ? 'bg-emerald-400/80' : 'bg-rose-400/80';

          return (
            <article key={point.month} className="bg-slate-900/40 p-4 rounded-lg border border-purple-400/20">
              <div className="flex items-center justify-between text-sm text-purple-200">
                <span>{point.label}</span>
                <span>{currencyFormatter.format(point.netRevenue)}</span>
              </div>
              <div className="mt-2 h-2 bg-slate-800/60 rounded-full overflow-hidden">
                <div
                  className={`${growthColour} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 text-xs text-slate-300">
                <span>Disbursements {currencyFormatter.format(point.disbursedAmount)}</span>
                <span className="text-right">
                  {point.revenueGrowth === null ? 'Baseline month' : `${signedPercentFormatter.format(point.revenueGrowth)} vs prior`}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-300">New booked accounts: {integerFormatter.format(point.newBookings)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
