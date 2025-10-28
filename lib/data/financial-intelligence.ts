export type MetricUnit = "usd" | "percentage" | "count" | "ratio" | "days";

export interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  unit: MetricUnit;
  change: number;
  changeLabel: string;
  target?: number;
  /** Whether an upward change is good (default) or downward change is good */
  trendDirection?: 'up' | 'down';
}

export interface GrowthPoint {
  month: string;
  originations: number;
  yoyGrowth: number;
  margin: number;
}

export interface SectorExposure {
  sector: string;
  exposure: number;
  share: number;
  avgDpd: number;
}

export interface RiskOverview {
  avgDpd: number;
  var95: number;
  tailLossProbability: number;
  coverageRatio: number;
  watchlistCount: number;
  concentration: SectorExposure[];
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  impact: string;
  confidence: number;
  supportingMetrics: string[];
}

export interface ProviderStatus {
  id: string;
  name: string;
  status: "online" | "degraded" | "offline";
  lastSync: string;
}

export interface FinancialDashboardPayload {
  asOf: string;
  metrics: FinancialMetric[];
  growth: GrowthPoint[];
  risk: RiskOverview;
  insights: Insight[];
  providers: ProviderStatus[];
}

export const financialDashboardData: FinancialDashboardPayload = {
  asOf: "2024-10-31",
  metrics: [
    {
      id: "aum",
      label: "Assets Under Management",
      value: 48600000,
      unit: "usd",
      change: 0.112,
      changeLabel: "vs. Oct 2023",
      target: 52000000
    },
    {
      id: "utilization",
      label: "Facility Utilization",
      value: 0.742,
      unit: "percentage",
      change: 0.028,
      changeLabel: "MoM",
      target: 0.78
    },
    {
      id: "borrowers",
      label: "Active Borrowers",
      value: 312,
      unit: "count",
      change: 0.074,
      changeLabel: "YoY",
      target: 340
    },
    {
      id: "yield",
      label: "Weighted Yield",
      value: 0.168,
      unit: "percentage",
      change: -0.002,
      changeLabel: "MoM",
      target: 0.175
    },
    {
      id: "chargeOffs",
      label: "Net Charge-off Ratio",
      value: 0.009,
      unit: "percentage",
      change: -0.001,
      changeLabel: "vs. rolling 6M",
      target: 0.012
    },
    {
      id: "conversion",
      label: "Cash Conversion Cycle",
      value: 46,
      unit: "days",
      change: -0.064,
      changeLabel: "MoM",
      target: 42
    }
  ],
  growth: [
    { month: "2024-01", originations: 6450000, yoyGrowth: 0.21, margin: 0.142 },
    { month: "2024-02", originations: 6730000, yoyGrowth: 0.19, margin: 0.146 },
    { month: "2024-03", originations: 7010000, yoyGrowth: 0.18, margin: 0.149 },
    { month: "2024-04", originations: 7320000, yoyGrowth: 0.22, margin: 0.151 },
    { month: "2024-05", originations: 7640000, yoyGrowth: 0.24, margin: 0.153 },
    { month: "2024-06", originations: 7900000, yoyGrowth: 0.26, margin: 0.155 },
    { month: "2024-07", originations: 8120000, yoyGrowth: 0.25, margin: 0.156 },
    { month: "2024-08", originations: 8450000, yoyGrowth: 0.26, margin: 0.157 },
    { month: "2024-09", originations: 8740000, yoyGrowth: 0.28, margin: 0.158 },
    { month: "2024-10", originations: 9180000, yoyGrowth: 0.27, margin: 0.159 }
  ],
  risk: {
    avgDpd: 18.4,
    var95: 1180000,
    tailLossProbability: 0.031,
    coverageRatio: 1.38,
    watchlistCount: 7,
    concentration: [
      { sector: "Manufacturing", exposure: 14300000, share: 0.31, avgDpd: 16.2 },
      { sector: "Wholesale", exposure: 9600000, share: 0.21, avgDpd: 19.8 },
      { sector: "Logistics", exposure: 7800000, share: 0.17, avgDpd: 22.5 },
      { sector: "Healthcare", exposure: 6900000, share: 0.15, avgDpd: 14.1 }
    ]
  },
  insights: [
    {
      id: "utilization-lift",
      title: "Utilization Surge Across Prime Facilities",
      summary: "Twelve prime-rated clients increased draws by USD 2.1M, lifting aggregate utilization to 74.2%.",
      impact: "Positive liquidity impact for Q4 funding plans",
      confidence: 0.91,
      supportingMetrics: [
        "+2.8% month-over-month utilization",
        "Average drawdown size up to USD 420k",
        "Zero delinquencies on the affected cohort"
      ]
    },
    {
      id: "margin-stability",
      title: "Net Margin Holding Despite Rate Compression",
      summary: "Weighted yield eased 20 bps while unit economics held due to lower funding costs and improved collections.",
      impact: "Maintain current pricing guidance for November originations",
      confidence: 0.87,
      supportingMetrics: [
        "Funding spread narrowed by 38 bps",
        "Cash conversion cycle shortened by 3 days",
        "Charge-off ratio improved to 0.9%"
      ]
    },
    {
      id: "risk-hotspots",
      title: "Logistics Portfolio Flagged for Review",
      summary: "Five logistics clients crossed the 20-day DPD threshold, accounting for USD 2.3M in exposure.",
      impact: "Schedule covenants review and tighten concentration limits",
      confidence: 0.82,
      supportingMetrics: [
        "Tail-loss probability steady at 3.1%",
        "Watchlist count increased by 2 entities",
        "Exposure concentration at 17% for logistics"
      ]
    }
  ],
  providers: [
    {
      id: "supabase-analytics",
      name: "Supabase Analytics Warehouse",
      status: "online",
      lastSync: "2024-10-31T05:45:00Z"
    },
    {
      id: "risk-engine",
      name: "Risk Engine (Monte Carlo v3)",
      status: "online",
      lastSync: "2024-10-31T03:20:00Z"
    },
    {
      id: "market-intel",
      name: "Market Intelligence Feed",
      status: "degraded",
      lastSync: "2024-10-30T22:10:00Z"
    }
  ]
};

export type FinancialDashboardData = typeof financialDashboardData;
