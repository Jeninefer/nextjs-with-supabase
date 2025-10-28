import type { RiskIndicator, RiskSummary } from '@/lib/data/financial-intelligence';

type RiskAnalysisProps = {
  risk: RiskSummary;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function formatIndicatorValue(indicator: RiskIndicator): string {
  switch (indicator.units) {
    case 'currency':
      return currencyFormatter.format(indicator.value);
    case 'days':
      return `${indicator.value.toFixed(0)} days`;
    case 'ratio':
      return `${indicator.value.toFixed(2)}x`;
    case 'percentage':
    default:
      return percentFormatter.format(indicator.value);
  }
}

function indicatorStatusColour(indicator: RiskIndicator): string {
  switch (indicator.status) {
    case 'critical':
      return 'text-rose-400';
    case 'watch':
      return 'text-amber-300';
    case 'stable':
    default:
      return 'text-emerald-400';
  }
}

export default function RiskAnalysis({ risk }: RiskAnalysisProps) {
  return (
    <section className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <header className="mb-6 space-y-1">
        <h3 className="text-xl font-semibold text-white font-['Lato']">Risk Analysis</h3>
        <p className="text-sm text-purple-200 font-['Poppins']">
          Average days past due sits at {risk.averageDaysPastDue.toFixed(0)} with loss given default of {percentFormatter.format(risk.lossGivenDefaultRate)}.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <article className="bg-slate-900/40 p-4 rounded-lg border border-purple-400/20">
          <div className="text-xs uppercase tracking-wide text-purple-300 font-['Poppins']">Value at Risk (95%)</div>
          <div className="mt-2 text-2xl font-semibold text-white">{currencyFormatter.format(risk.valueAtRisk)}</div>
          <p className="mt-1 text-xs text-slate-300">
            Stress scenario coverage implies {percentFormatter.format(risk.lossGivenDefaultRate)} of current disbursements at risk, well within board limits.
          </p>
        </article>

        {risk.riskIndicators.map(indicator => (
          <article key={indicator.name} className="bg-slate-900/40 p-4 rounded-lg border border-purple-400/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-purple-300 font-['Poppins']">{indicator.name}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{formatIndicatorValue(indicator)}</div>
              </div>
              <span className={`text-sm font-semibold ${indicatorStatusColour(indicator)}`}>{indicator.status.toUpperCase()}</span>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-snug">{indicator.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
