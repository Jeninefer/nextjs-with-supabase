export type MetricUnit = 'currency' | 'percentage' | 'count' | 'ratio';

export type MetricTrend = 'up' | 'down' | 'flat';

export interface MetricChange {
  absolute?: number;
  percentage?: number;
  period?: string;
  trend?: MetricTrend;
}

export interface FinancialMetric {
  id: string;
  label: string;
  description: string;
  value: number;
  unit: MetricUnit;
  currency?: string;
  change?: MetricChange;
  target?: number;
}

export interface GrowthPoint {
  month: string;
  assetsUnderManagement: number;
  newInvestments: number;
  redemptions: number;
}

export interface SectorExposure {
  sector: string;
  allocation: number;
  change: number;
  riskLevel: 'low' | 'moderate' | 'elevated';
  commentary: string;
}

export interface RiskOverview {
  valueAtRisk95: number;
  expectedShortfall95: number;
  stressLoss: number;
  diversificationIndex: number;
  exposures: SectorExposure[];
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  impact: string;
  confidence: number;
  action: string;
  tags: string[];
  lastUpdated: string;
}

export interface ProviderStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  lastSync: string;
  message?: string;
}

export interface FinancialDashboardPayload {
  generatedAt: string;
  metrics: FinancialMetric[];
  growth: GrowthPoint[];
  risk: RiskOverview;
  insights: Insight[];
  providers: ProviderStatus[];
}

export const financialIntelligence: FinancialDashboardPayload = {
  generatedAt: '2025-10-27T16:00:00.000Z',
  metrics: [
    {
      id: 'aum',
      label: 'Assets under management',
      description: 'Total managed assets across discretionary portfolios.',
      value: 25400000,
      unit: 'currency',
      currency: 'USD',
      change: {
        absolute: 865000,
        percentage: 0.036,
        period: 'm/m',
        trend: 'up',
      },
      target: 26000000,
    },
    {
      id: 'active-clients',
      label: 'Active clients',
      description: 'Clients with assets or payments in the last 30 days.',
      value: 1247,
      unit: 'count',
      change: {
        absolute: 56,
        percentage: 0.047,
        period: 'm/m',
        trend: 'up',
      },
      target: 1300,
    },
    {
      id: 'default-rate',
      label: 'Default rate',
      description: 'Share of loans with payments over 60 days past due.',
      value: 0.032,
      unit: 'percentage',
      change: {
        absolute: -0.004,
        percentage: -0.111,
        period: 'q/q',
        trend: 'down',
      },
      target: 0.028,
    },
    {
      id: 'weighted-apr',
      label: 'Weighted APR',
      description: 'Portfolio-weighted annualised percentage rate.',
      value: 0.185,
      unit: 'percentage',
      change: {
        absolute: 0.003,
        percentage: 0.017,
        period: 'm/m',
        trend: 'up',
      },
      target: 0.19,
    },
    {
      id: 'net-promoter-score',
      label: 'Net promoter score',
      description: 'Trailing 90-day NPS from active enterprise clients.',
      value: 63,
      unit: 'count',
      change: {
        absolute: 5,
        percentage: 0.086,
        period: 'q/q',
        trend: 'up',
      },
      target: 65,
    },
  ],
  growth: [
    { month: 'May', assetsUnderManagement: 21500000, newInvestments: 1650000, redemptions: 820000 },
    { month: 'Jun', assetsUnderManagement: 22300000, newInvestments: 1780000, redemptions: 760000 },
    { month: 'Jul', assetsUnderManagement: 22900000, newInvestments: 1820000, redemptions: 690000 },
    { month: 'Aug', assetsUnderManagement: 23650000, newInvestments: 1940000, redemptions: 710000 },
    { month: 'Sep', assetsUnderManagement: 24500000, newInvestments: 2050000, redemptions: 690000 },
    { month: 'Oct', assetsUnderManagement: 25400000, newInvestments: 2185000, redemptions: 720000 },
  ],
  risk: {
    valueAtRisk95: 0.071,
    expectedShortfall95: 0.106,
    stressLoss: 0.148,
    diversificationIndex: 0.63,
    exposures: [
      {
        sector: 'Alternative lending',
        allocation: 0.29,
        change: -0.01,
        riskLevel: 'moderate',
        commentary: 'Performance stabilised after tightening credit filters in July.',
      },
      {
        sector: 'SMB credit',
        allocation: 0.24,
        change: 0.02,
        riskLevel: 'elevated',
        commentary: 'Delinquency improving, but midwest logistics cohort still above limits.',
      },
      {
        sector: 'Invoice factoring',
        allocation: 0.19,
        change: 0.00,
        riskLevel: 'low',
        commentary: 'Healthy collateralisation and recovery ratios holding at 98%.',
      },
      {
        sector: 'Embedded finance',
        allocation: 0.17,
        change: -0.01,
        riskLevel: 'moderate',
        commentary: 'Growth channel performing above plan following new e-commerce partnerships.',
      },
      {
        sector: 'Consumer BNPL',
        allocation: 0.11,
        change: 0.01,
        riskLevel: 'elevated',
        commentary: 'Loss mitigation programme reduced severity but volumes remain high.',
      },
    ],
  },
  insights: [
    {
      id: 'fx-hedge',
      title: 'FX hedge coverage is below mandate for EUR receivables',
      summary: 'Hedge ratio fell to 68% after EUR exposure grew 14% during Q3 expansion.',
      impact: 'Increasing hedge coverage to 85% would reduce projected VaR by 120 bps.',
      confidence: 0.87,
      action: 'Extend existing EUR forwards and add three-month collars for new receivables.',
      tags: ['risk', 'treasury', 'fx'],
      lastUpdated: '2025-10-26T22:30:00.000Z',
    },
    {
      id: 'portfolio-optimization',
      title: 'SMB logistics cohort exceeding risk appetite',
      summary: '30-day delinquency plateaued at 5.8% against 4.5% limit after summer fuel spike.',
      impact: 'Reducing exposure by 6% reallocates $1.3M to higher margin invoice factoring.',
      confidence: 0.79,
      action: 'Pause new originations in the flagged cohort and rebalance toward factoring programmes.',
      tags: ['credit', 'allocation', 'operations'],
      lastUpdated: '2025-10-27T09:05:00.000Z',
    },
    {
      id: 'customer-growth',
      title: 'Cross-sell opportunity in enterprise SaaS clients',
      summary: 'ARPA for top quartile SaaS customers is 22% above median with lower churn risk.',
      impact: 'Launching the treasury automation add-on could increase ARR by $1.1M annually.',
      confidence: 0.92,
      action: 'Bundle treasury automation into Q4 renewals for the top 40 SaaS accounts.',
      tags: ['growth', 'pricing', 'product'],
      lastUpdated: '2025-10-25T14:45:00.000Z',
    },
  ],
  providers: [
    {
      id: 'supabase',
      name: 'Supabase',
      status: 'healthy',
      latencyMs: 143,
      lastSync: '2025-10-27T15:55:00.000Z',
    },
    {
      id: 'figma',
      name: 'Figma',
      status: 'healthy',
      latencyMs: 212,
      lastSync: '2025-10-27T15:50:00.000Z',
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      status: 'degraded',
      latencyMs: 394,
      lastSync: '2025-10-27T15:40:00.000Z',
      message: 'Latency elevated during model fine-tuning window.',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      status: 'healthy',
      latencyMs: 178,
      lastSync: '2025-10-27T15:48:00.000Z',
    },
  ],
};

export default financialIntelligence;
