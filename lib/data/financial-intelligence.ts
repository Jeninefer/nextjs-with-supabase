export interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  currency: string;
  presentation: 'currency' | 'count' | 'percentage';
  change: {
    absolute: number;
    percentage: number;
    period: 'mom' | 'qoq' | 'yoy';
    direction: 'up' | 'down';
  };
  description: string;
}

export interface GrowthPoint {
  month: string;
  nav: number;
  netInflow: number;
  retention: number;
}

export interface StressScenario {
  id: string;
  scenario: string;
  lossPercentage: number;
  comment: string;
}

export interface RiskExposure {
  segment: string;
  ratio: number;
  changeBps: number;
  avgDaysPastDue: number;
}

export interface IntelligenceInsight {
  id: string;
  title: string;
  summary: string;
  impact: string;
  recommendedAction: string;
  confidence: number;
  tags: string[];
  lastUpdated: string;
}

export interface MarketIndicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  source: string;
}

export interface FinancialIntelligenceDataset {
  asOf: string;
  baseCurrency: string;
  metrics: FinancialMetric[];
  growth: {
    compoundAnnualGrowth: number;
    trailingTwelveMonthNetNewAssets: number;
    yoyRevenueGrowth: number;
    series: GrowthPoint[];
    comment: string;
  };
  risk: {
    portfolioVaR95: number;
    expectedShortfall: number;
    defaultRate: number;
    riskAppetiteUtilization: number;
    exposures: RiskExposure[];
    stressTests: StressScenario[];
    comment: string;
  };
  insights: IntelligenceInsight[];
  marketIndicators: MarketIndicator[];
  dataSources: string[];
  generatedAt: string;
}

export const financialIntelligence: FinancialIntelligenceDataset = {
  asOf: '2024-12-31',
  baseCurrency: 'USD',
  metrics: [
    {
      id: 'aum',
      label: 'Assets Under Management',
      value: 1_258_000_000,
      currency: 'USD',
      presentation: 'currency',
      change: {
        absolute: 68_000_000,
        percentage: 0.057,
        period: 'qoq',
        direction: 'up',
      },
      description: 'Total assets across lending and treasury mandates.',
    },
    {
      id: 'active-clients',
      label: 'Active Institutional Clients',
      value: 1_312,
      currency: 'USD',
      presentation: 'count',
      change: {
        absolute: 84,
        percentage: 0.068,
        period: 'yoy',
        direction: 'up',
      },
      description: 'Institutions with at least one financed facility in the last 90 days.',
    },
    {
      id: 'default-rate',
      label: 'Portfolio Default Rate',
      value: 0.024,
      currency: 'USD',
      presentation: 'percentage',
      change: {
        absolute: -0.003,
        percentage: -0.111,
        period: 'qoq',
        direction: 'down',
      },
      description: '90-day default ratio across all outstanding facilities.',
    },
    {
      id: 'weighted-apr',
      label: 'Weighted Average APR',
      value: 0.187,
      currency: 'USD',
      presentation: 'percentage',
      change: {
        absolute: 0.004,
        percentage: 0.022,
        period: 'qoq',
        direction: 'up',
      },
      description: 'Blended APR across secured, unsecured and structured facilities.',
    },
  ],
  growth: {
    compoundAnnualGrowth: 0.164,
    trailingTwelveMonthNetNewAssets: 182_000_000,
    yoyRevenueGrowth: 0.139,
    series: [
      { month: '2024-01', nav: 1_045_000_000, netInflow: 18_500_000, retention: 0.94 },
      { month: '2024-02', nav: 1_058_000_000, netInflow: 22_600_000, retention: 0.95 },
      { month: '2024-03', nav: 1_072_000_000, netInflow: 24_800_000, retention: 0.95 },
      { month: '2024-04', nav: 1_089_000_000, netInflow: 27_500_000, retention: 0.96 },
      { month: '2024-05', nav: 1_106_000_000, netInflow: 29_200_000, retention: 0.96 },
      { month: '2024-06', nav: 1_128_000_000, netInflow: 31_800_000, retention: 0.97 },
      { month: '2024-07', nav: 1_149_000_000, netInflow: 33_400_000, retention: 0.97 },
      { month: '2024-08', nav: 1_174_000_000, netInflow: 35_800_000, retention: 0.97 },
      { month: '2024-09', nav: 1_197_000_000, netInflow: 37_200_000, retention: 0.96 },
      { month: '2024-10', nav: 1_216_000_000, netInflow: 39_400_000, retention: 0.96 },
      { month: '2024-11', nav: 1_239_000_000, netInflow: 41_600_000, retention: 0.97 },
      { month: '2024-12', nav: 1_258_000_000, netInflow: 43_200_000, retention: 0.97 },
    ],
    comment:
      'Compounded growth driven by structured credit performance and disciplined client acquisition. Net new assets accelerated in Q4 as retention reached 97%.',
  },
  risk: {
    portfolioVaR95: 21_600_000,
    expectedShortfall: 31_200_000,
    defaultRate: 0.024,
    riskAppetiteUtilization: 0.71,
    exposures: [
      { segment: 'Structured Credit', ratio: 0.38, changeBps: -12, avgDaysPastDue: 18 },
      { segment: 'SMB Lending', ratio: 0.27, changeBps: 9, avgDaysPastDue: 41 },
      { segment: 'Consumer Installments', ratio: 0.21, changeBps: -4, avgDaysPastDue: 33 },
      { segment: 'Syndicated Loans', ratio: 0.14, changeBps: 7, avgDaysPastDue: 22 },
    ],
    stressTests: [
      {
        id: 'macro-1',
        scenario: '200 bps rate hike with GDP slowdown',
        lossPercentage: 0.034,
        comment: 'Losses concentrated in SMB lending; liquidity coverage remains above policy floor.',
      },
      {
        id: 'macro-2',
        scenario: 'Energy price shock and supply chain disruption',
        lossPercentage: 0.028,
        comment: 'Structured credit positions hedge 40% of projected losses; covenant breaches limited to 3.1%.',
      },
      {
        id: 'macro-3',
        scenario: 'Severe consumer deleveraging',
        lossPercentage: 0.041,
        comment: 'Consumer installment book requires 2.4% additional reserves to stay within risk appetite.',
      },
    ],
    comment:
      'Portfolio risk remains within appetite with 71% utilization. SMB lending watchlist narrowed by 40 basis points as early-stage delinquencies improved.',
  },
  insights: [
    {
      id: 'structured-credit-outperformance',
      title: 'Structured Credit Outperformance',
      summary:
        'Structured credit desk generated a 6.8% risk-adjusted return, outperforming benchmark by 210 bps.',
      impact: 'Incremental $3.4M net income for Q4.',
      recommendedAction: 'Increase structured credit allocation by 5% while keeping duration below 24 months.',
      confidence: 0.89,
      tags: ['performance', 'allocation', 'structured-credit'],
      lastUpdated: '2024-12-28T10:00:00Z',
    },
    {
      id: 'smb-collections',
      title: 'SMB Collections Efficiency',
      summary:
        'Automated outreach reduced SMB past-due balances by 12% quarter-over-quarter.',
      impact: 'Freed $18.6M in revolving capacity and improved cash conversion cycle by 4.3 days.',
      recommendedAction: 'Extend automation playbook to high-growth regions and integrate with treasury forecasting.',
      confidence: 0.82,
      tags: ['collections', 'smb', 'automation'],
      lastUpdated: '2024-12-22T14:30:00Z',
    },
    {
      id: 'consumer-attrition',
      title: 'Consumer Attrition Alert',
      summary:
        'Attrition risk increased for consumers with variable-rate exposure above 60% of income.',
      impact: 'Potential 1.3% increase in charge-offs without targeted retention incentives.',
      recommendedAction: 'Launch proactive repricing offers for the top decile of at-risk borrowers.',
      confidence: 0.77,
      tags: ['consumer', 'risk', 'retention'],
      lastUpdated: '2024-12-30T08:45:00Z',
    },
  ],
  marketIndicators: [
    {
      id: 'prime-rate',
      name: 'US Prime Rate',
      value: 8.5,
      unit: 'percent',
      change: 0.25,
      source: 'Federal Reserve',
    },
    {
      id: 'bbb-spread',
      name: 'BBB Corporate Spread',
      value: 1.87,
      unit: 'percent',
      change: -0.18,
      source: 'ICE BofA',
    },
    {
      id: 'smb-delinquency',
      name: 'SMB Delinquency Index',
      value: 2.96,
      unit: 'percent',
      change: -0.12,
      source: 'ABACO Servicing Data',
    },
  ],
  dataSources: [
    'ABACO Data Lakehouse (2024-12 snapshot)',
    'Treasury Market Data Feed',
    'Servicing Analytics Platform',
    'Federal Reserve Economic Data (FRED)',
  ],
  generatedAt: '2025-01-04T09:00:00Z',
};

export type FinancialInsightResult = typeof financialIntelligence.insights[number];
