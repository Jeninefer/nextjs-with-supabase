export type TrendDirection = 'up' | 'down' | 'flat';
export type InsightImpact = 'positive' | 'neutral' | 'negative';

interface MonthlyPerformanceRow {
  month: string; // YYYY-MM
  assetsUnderManagement: number;
  activeBorrowers: number;
  newBookings: number;
  netRevenue: number;
  disbursedAmount: number;
  defaultRate: number;
  weightedApr: number;
  netInterestMargin: number;
  liquidityCoverage: number;
  avgDaysPastDue: number;
  valueAtRisk95: number;
  expectedLoss: number;
  earlyDelinquencyRate: number;
  chargeOffRate: number;
  provisioningCoverage: number;
  costOfFunds: number;
  operatingExpenseRatio: number;
}

export interface FinancialMetricSummary {
  assetsUnderManagement: number;
  assetsUnderManagementChange: number;
  activeBorrowers: number;
  activeBorrowersChange: number;
  defaultRate: number;
  defaultRateChange: number;
  weightedApr: number;
  weightedAprChange: number;
  netInterestMargin: number;
  netInterestMarginChange: number;
  liquidityCoverageRatio: number;
  liquidityCoverageChange: number;
  monthOverMonthRevenueGrowth: number;
  yearOverYearRevenueGrowth: number;
}

export interface GrowthDataPoint {
  label: string;
  month: string;
  netRevenue: number;
  disbursedAmount: number;
  newBookings: number;
  revenueGrowth: number | null;
}

export interface RiskIndicator {
  name: string;
  value: number;
  benchmark: number;
  units: 'ratio' | 'percentage' | 'days' | 'currency';
  status: 'stable' | 'watch' | 'critical';
  direction: TrendDirection;
  explanation: string;
}

export interface RiskSummary {
  averageDaysPastDue: number;
  valueAtRisk: number;
  lossGivenDefaultRate: number;
  riskIndicators: RiskIndicator[];
}

export interface InsightSummary {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  impact: InsightImpact;
  tags: string[];
}

export interface FinancialIntelligenceSnapshot {
  generatedAt: string;
  reportingMonth: string;
  metrics: FinancialMetricSummary;
  growth: {
    trailingMonths: GrowthDataPoint[];
  };
  risk: RiskSummary;
  insights: InsightSummary[];
}

const MONTHLY_PERFORMANCE: MonthlyPerformanceRow[] = [
  {
    month: '2024-03',
    assetsUnderManagement: 21_850_000,
    activeBorrowers: 1_012,
    newBookings: 72,
    netRevenue: 1_185_000,
    disbursedAmount: 6_550_000,
    defaultRate: 0.032,
    weightedApr: 0.181,
    netInterestMargin: 0.092,
    liquidityCoverage: 1.16,
    avgDaysPastDue: 31,
    valueAtRisk95: 1_320_000,
    expectedLoss: 418_000,
    earlyDelinquencyRate: 0.026,
    chargeOffRate: 0.012,
    provisioningCoverage: 1.27,
    costOfFunds: 0.055,
    operatingExpenseRatio: 0.036,
  },
  {
    month: '2024-04',
    assetsUnderManagement: 22_140_000,
    activeBorrowers: 1_036,
    newBookings: 74,
    netRevenue: 1_216_000,
    disbursedAmount: 6_680_000,
    defaultRate: 0.0315,
    weightedApr: 0.182,
    netInterestMargin: 0.093,
    liquidityCoverage: 1.18,
    avgDaysPastDue: 30,
    valueAtRisk95: 1_300_000,
    expectedLoss: 412_000,
    earlyDelinquencyRate: 0.025,
    chargeOffRate: 0.0119,
    provisioningCoverage: 1.28,
    costOfFunds: 0.055,
    operatingExpenseRatio: 0.0355,
  },
  {
    month: '2024-05',
    assetsUnderManagement: 22_560_000,
    activeBorrowers: 1_068,
    newBookings: 78,
    netRevenue: 1_245_000,
    disbursedAmount: 6_820_000,
    defaultRate: 0.0305,
    weightedApr: 0.183,
    netInterestMargin: 0.094,
    liquidityCoverage: 1.19,
    avgDaysPastDue: 29.5,
    valueAtRisk95: 1_290_000,
    expectedLoss: 405_000,
    earlyDelinquencyRate: 0.024,
    chargeOffRate: 0.0116,
    provisioningCoverage: 1.29,
    costOfFunds: 0.054,
    operatingExpenseRatio: 0.035,
  },
  {
    month: '2024-06',
    assetsUnderManagement: 23_020_000,
    activeBorrowers: 1_104,
    newBookings: 82,
    netRevenue: 1_289_000,
    disbursedAmount: 6_950_000,
    defaultRate: 0.03,
    weightedApr: 0.183,
    netInterestMargin: 0.095,
    liquidityCoverage: 1.21,
    avgDaysPastDue: 29,
    valueAtRisk95: 1_270_000,
    expectedLoss: 398_000,
    earlyDelinquencyRate: 0.0235,
    chargeOffRate: 0.0114,
    provisioningCoverage: 1.30,
    costOfFunds: 0.054,
    operatingExpenseRatio: 0.0345,
  },
  {
    month: '2024-07',
    assetsUnderManagement: 23_670_000,
    activeBorrowers: 1_148,
    newBookings: 86,
    netRevenue: 1_331_000,
    disbursedAmount: 7_150_000,
    defaultRate: 0.029,
    weightedApr: 0.184,
    netInterestMargin: 0.097,
    liquidityCoverage: 1.23,
    avgDaysPastDue: 28,
    valueAtRisk95: 1_260_000,
    expectedLoss: 389_000,
    earlyDelinquencyRate: 0.023,
    chargeOffRate: 0.0112,
    provisioningCoverage: 1.32,
    costOfFunds: 0.053,
    operatingExpenseRatio: 0.034,
  },
  {
    month: '2024-08',
    assetsUnderManagement: 24_380_000,
    activeBorrowers: 1_193,
    newBookings: 92,
    netRevenue: 1_374_000,
    disbursedAmount: 7_320_000,
    defaultRate: 0.0288,
    weightedApr: 0.185,
    netInterestMargin: 0.099,
    liquidityCoverage: 1.25,
    avgDaysPastDue: 27,
    valueAtRisk95: 1_250_000,
    expectedLoss: 381_000,
    earlyDelinquencyRate: 0.022,
    chargeOffRate: 0.0108,
    provisioningCoverage: 1.34,
    costOfFunds: 0.053,
    operatingExpenseRatio: 0.0335,
  },
  {
    month: '2024-09',
    assetsUnderManagement: 25_120_000,
    activeBorrowers: 1_241,
    newBookings: 97,
    netRevenue: 1_417_000,
    disbursedAmount: 7_510_000,
    defaultRate: 0.028,
    weightedApr: 0.186,
    netInterestMargin: 0.101,
    liquidityCoverage: 1.27,
    avgDaysPastDue: 26,
    valueAtRisk95: 1_240_000,
    expectedLoss: 372_000,
    earlyDelinquencyRate: 0.0215,
    chargeOffRate: 0.0104,
    provisioningCoverage: 1.36,
    costOfFunds: 0.052,
    operatingExpenseRatio: 0.033,
  },
  {
    month: '2024-10',
    assetsUnderManagement: 25_960_000,
    activeBorrowers: 1_289,
    newBookings: 102,
    netRevenue: 1_468_000,
    disbursedAmount: 7_680_000,
    defaultRate: 0.0272,
    weightedApr: 0.186,
    netInterestMargin: 0.102,
    liquidityCoverage: 1.29,
    avgDaysPastDue: 25,
    valueAtRisk95: 1_230_000,
    expectedLoss: 365_000,
    earlyDelinquencyRate: 0.021,
    chargeOffRate: 0.0101,
    provisioningCoverage: 1.38,
    costOfFunds: 0.052,
    operatingExpenseRatio: 0.0325,
  },
  {
    month: '2024-11',
    assetsUnderManagement: 26_850_000,
    activeBorrowers: 1_336,
    newBookings: 108,
    netRevenue: 1_512_000,
    disbursedAmount: 7_860_000,
    defaultRate: 0.0265,
    weightedApr: 0.187,
    netInterestMargin: 0.104,
    liquidityCoverage: 1.30,
    avgDaysPastDue: 24,
    valueAtRisk95: 1_210_000,
    expectedLoss: 358_000,
    earlyDelinquencyRate: 0.0205,
    chargeOffRate: 0.0098,
    provisioningCoverage: 1.40,
    costOfFunds: 0.051,
    operatingExpenseRatio: 0.032,
  },
  {
    month: '2024-12',
    assetsUnderManagement: 27_620_000,
    activeBorrowers: 1_378,
    newBookings: 114,
    netRevenue: 1_556_000,
    disbursedAmount: 8_020_000,
    defaultRate: 0.0255,
    weightedApr: 0.187,
    netInterestMargin: 0.105,
    liquidityCoverage: 1.31,
    avgDaysPastDue: 23.5,
    valueAtRisk95: 1_200_000,
    expectedLoss: 353_000,
    earlyDelinquencyRate: 0.0202,
    chargeOffRate: 0.0096,
    provisioningCoverage: 1.42,
    costOfFunds: 0.051,
    operatingExpenseRatio: 0.0315,
  },
  {
    month: '2025-01',
    assetsUnderManagement: 28_340_000,
    activeBorrowers: 1_406,
    newBookings: 118,
    netRevenue: 1_602_000,
    disbursedAmount: 8_150_000,
    defaultRate: 0.025,
    weightedApr: 0.188,
    netInterestMargin: 0.106,
    liquidityCoverage: 1.32,
    avgDaysPastDue: 23,
    valueAtRisk95: 1_190_000,
    expectedLoss: 349_000,
    earlyDelinquencyRate: 0.0198,
    chargeOffRate: 0.0094,
    provisioningCoverage: 1.44,
    costOfFunds: 0.051,
    operatingExpenseRatio: 0.0312,
  },
  {
    month: '2025-02',
    assetsUnderManagement: 28_970_000,
    activeBorrowers: 1_421,
    newBookings: 122,
    netRevenue: 1_644_000,
    disbursedAmount: 8_240_000,
    defaultRate: 0.0245,
    weightedApr: 0.1885,
    netInterestMargin: 0.107,
    liquidityCoverage: 1.33,
    avgDaysPastDue: 22.5,
    valueAtRisk95: 1_180_000,
    expectedLoss: 345_000,
    earlyDelinquencyRate: 0.0194,
    chargeOffRate: 0.0092,
    provisioningCoverage: 1.46,
    costOfFunds: 0.050,
    operatingExpenseRatio: 0.031,
  },
  {
    month: '2025-03',
    assetsUnderManagement: 29_740_000,
    activeBorrowers: 1_458,
    newBookings: 129,
    netRevenue: 1_702_000,
    disbursedAmount: 8_370_000,
    defaultRate: 0.024,
    weightedApr: 0.189,
    netInterestMargin: 0.108,
    liquidityCoverage: 1.35,
    avgDaysPastDue: 22,
    valueAtRisk95: 1_170_000,
    expectedLoss: 339_000,
    earlyDelinquencyRate: 0.019,
    chargeOffRate: 0.009,
    provisioningCoverage: 1.48,
    costOfFunds: 0.050,
    operatingExpenseRatio: 0.0308,
  },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function safePercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }

  return (current - previous) / previous;
}

function trendDirection(current: number, previous: number): TrendDirection {
  if (Math.abs(current - previous) < Number.EPSILON) {
    return 'flat';
  }

  return current > previous ? 'up' : 'down';
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

function formatMonthLabel(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  return monthFormatter.format(new Date(year, monthIndex - 1, 1));
}

export function getFinancialIntelligenceSnapshot(): FinancialIntelligenceSnapshot {
  const ordered = [...MONTHLY_PERFORMANCE].sort((a, b) => a.month.localeCompare(b.month));
  const latest = ordered[ordered.length - 1];
  const previous = ordered[ordered.length - 2];
  const yearAgoIndex = ordered.findIndex((entry) => entry.month === `${Number(latest.month.slice(0, 4)) - 1}-${latest.month.slice(5)}`);
  const yearAgo = yearAgoIndex >= 0 ? ordered[yearAgoIndex] : ordered[0];

  const metrics: FinancialMetricSummary = {
    assetsUnderManagement: latest.assetsUnderManagement,
    assetsUnderManagementChange: safePercentChange(latest.assetsUnderManagement, previous.assetsUnderManagement),
    activeBorrowers: latest.activeBorrowers,
    activeBorrowersChange: safePercentChange(latest.activeBorrowers, previous.activeBorrowers),
    defaultRate: latest.defaultRate,
    defaultRateChange: safePercentChange(latest.defaultRate, previous.defaultRate),
    weightedApr: latest.weightedApr,
    weightedAprChange: safePercentChange(latest.weightedApr, previous.weightedApr),
    netInterestMargin: latest.netInterestMargin,
    netInterestMarginChange: safePercentChange(latest.netInterestMargin, previous.netInterestMargin),
    liquidityCoverageRatio: latest.liquidityCoverage,
    liquidityCoverageChange: safePercentChange(latest.liquidityCoverage, previous.liquidityCoverage),
    monthOverMonthRevenueGrowth: safePercentChange(latest.netRevenue, previous.netRevenue),
    yearOverYearRevenueGrowth: safePercentChange(latest.netRevenue, yearAgo.netRevenue),
  };

  const trailingMonths = ordered
    .slice(-6)
    .map((entry, index, array) => {
      const prev = index === 0 ? null : array[index - 1];
      return {
        label: formatMonthLabel(entry.month),
        month: entry.month,
        netRevenue: entry.netRevenue,
        disbursedAmount: entry.disbursedAmount,
        newBookings: entry.newBookings,
        revenueGrowth: prev ? safePercentChange(entry.netRevenue, prev.netRevenue) : null,
      } satisfies GrowthDataPoint;
    });

  const delinquencyDelta = latest.earlyDelinquencyRate - previous.earlyDelinquencyRate;
  const delinquencyDirection = trendDirection(latest.earlyDelinquencyRate, previous.earlyDelinquencyRate);
  const delinquencyNarrative = delinquencyDirection === 'flat'
    ? 'holding flat versus last month.'
    : `${percentFormatter.format(Math.abs(delinquencyDelta))} ${delinquencyDirection === 'up' ? 'increase' : 'reduction'} versus last month.`;

  const riskIndicators: RiskIndicator[] = [
    {
      name: 'Early delinquency (30+ DPD)',
      value: latest.earlyDelinquencyRate,
      benchmark: 0.024,
      units: 'percentage',
      status: latest.earlyDelinquencyRate <= 0.02 ? 'stable' : latest.earlyDelinquencyRate <= 0.024 ? 'watch' : 'critical',
      direction: trendDirection(latest.earlyDelinquencyRate, previous.earlyDelinquencyRate),
      explanation: `Rate sits at ${percentFormatter.format(latest.earlyDelinquencyRate)}, ${delinquencyNarrative}`,
    },
    {
      name: 'Charge-off rate (annualized)',
      value: latest.chargeOffRate,
      benchmark: 0.011,
      units: 'percentage',
      status: latest.chargeOffRate <= 0.0095 ? 'stable' : latest.chargeOffRate <= 0.011 ? 'watch' : 'critical',
      direction: trendDirection(latest.chargeOffRate, previous.chargeOffRate),
      explanation: `Charge-offs closed the month at ${percentFormatter.format(latest.chargeOffRate)} with provisioning coverage of ${percentFormatter.format(latest.provisioningCoverage - 1)} above reserves.`,
    },
    {
      name: 'Liquidity coverage ratio',
      value: latest.liquidityCoverage,
      benchmark: 1.2,
      units: 'ratio',
      status: latest.liquidityCoverage >= 1.3 ? 'stable' : latest.liquidityCoverage >= 1.2 ? 'watch' : 'critical',
      direction: trendDirection(latest.liquidityCoverage, previous.liquidityCoverage),
      explanation: `Liquidity buffer at ${latest.liquidityCoverage.toFixed(2)}x cash outflows, ${percentFormatter.format(metrics.liquidityCoverageChange)} compared with the prior month.`,
    },
    {
      name: 'Net interest margin',
      value: latest.netInterestMargin,
      benchmark: 0.095,
      units: 'percentage',
      status: latest.netInterestMargin >= 0.105 ? 'stable' : latest.netInterestMargin >= 0.095 ? 'watch' : 'critical',
      direction: trendDirection(latest.netInterestMargin, previous.netInterestMargin),
      explanation: `NIM improved to ${percentFormatter.format(latest.netInterestMargin)} while cost of funds held at ${percentFormatter.format(latest.costOfFunds)}.`,
    },
  ];

  const risk: RiskSummary = {
    averageDaysPastDue: latest.avgDaysPastDue,
    valueAtRisk: latest.valueAtRisk95,
    lossGivenDefaultRate: latest.expectedLoss / latest.disbursedAmount,
    riskIndicators,
  };

  let creditQualityStreak = 1;
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const current = ordered[index];
    const previousMonth = ordered[index - 1];
    if (current.defaultRate <= previousMonth.defaultRate && current.avgDaysPastDue <= previousMonth.avgDaysPastDue) {
      creditQualityStreak += 1;
    } else {
      break;
    }
  }

  const insights: InsightSummary[] = [
    {
      id: 'growth-origination-momentum',
      title: 'Origination momentum sustains double-digit revenue growth',
      summary: `Net revenue reached ${currencyFormatter.format(latest.netRevenue)} in ${formatMonthLabel(latest.month)}, representing ${percentFormatter.format(metrics.yearOverYearRevenueGrowth)} year-over-year growth with ${latest.newBookings} new commercial borrowers activated.`,
      confidence: 0.92,
      impact: 'positive',
      tags: ['revenue', 'origination', 'commercial'],
    },
    {
      id: 'credit-quality-improvement',
      title: 'Credit quality continues to strengthen month over month',
      summary: `Portfolio default rate declined to ${percentFormatter.format(latest.defaultRate)} and average days past due improved to ${latest.avgDaysPastDue} days, extending a ${creditQualityStreak}-month positive trend.`,
      confidence: 0.88,
      impact: 'positive',
      tags: ['credit', 'risk'],
    },
    {
      id: 'liquidity-buffer',
      title: 'Liquidity buffer exceeds policy floor by 12%',
      summary: `Liquidity coverage closed at ${latest.liquidityCoverage.toFixed(2)}x against a ${riskIndicators[2].benchmark.toFixed(2)}x policy minimum, positioning the portfolio for planned Q3 expansion without incremental funding.`,
      confidence: 0.83,
      impact: 'neutral',
      tags: ['treasury', 'liquidity'],
    },
    {
      id: 'margin-optimization',
      title: 'Margin optimization offsets higher operating investments',
      summary: `Net interest margin improved ${percentFormatter.format(metrics.netInterestMarginChange)} month over month while operating expense ratio held at ${percentFormatter.format(latest.operatingExpenseRatio)}, preserving profitability on the growth program.`,
      confidence: 0.79,
      impact: 'positive',
      tags: ['profitability', 'operations'],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    reportingMonth: latest.month,
    metrics,
    growth: { trailingMonths },
    risk,
    insights,
  };
}
