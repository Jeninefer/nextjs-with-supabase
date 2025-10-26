export interface FinancialMetrics {
  aum: number; // Assets Under Management
  activeClients: number;
  defaultRate: number;
  weightedAPR: number;
  revenue: number;
  ebitda: number;
  concentration: number;
  ltvCac: number; // Lifetime Value to Customer Acquisition Cost
}

export interface GrowthData {
  month: string;
  revenue: number;
  clients: number;
  aum: number;
  newClients: number;
  churnRate: number;
}

export interface RiskMetrics {
  concentration: number;
  defaultRate: number;
  volatility: number;
  varMetric: number; // Value at Risk
  stressTestResult: number;
  delinquencyBuckets: {
    current: number;
    dpd30: number;
    dpd60: number;
    dpd90: number;
    dpd120Plus: number;
  };
}

export interface CustomerSegmentation {
  segmentId: string;
  name: string; // A-F classification
  count: number;
  avgBalance: number;
  riskScore: number;
  profitability: number;
}

export interface MarketIntelligence {
  interestRates: {
    central: number;
    commercial: number;
    trend: 'up' | 'down' | 'stable';
  };
  economicIndicators: {
    gdpGrowth: number;
    inflation: number;
    unemployment: number;
  };
  competitiveAnalysis: {
    marketShare: number;
    competitorCount: number;
    avgAPR: number;
  };
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'risk' | 'opportunity' | 'alert';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  priority: number; // 1-5
  timestamp: Date;
  actionItems?: string[];
  relatedMetrics?: string[];
}

export interface FinancialData {
  metrics: FinancialMetrics;
  growthData: GrowthData[];
  riskMetrics: RiskMetrics;
  customerSegments: CustomerSegmentation[];
  marketIntelligence: MarketIntelligence;
  aiInsights: AIInsight[];
  lastUpdated: Date;
  dataQualityScore: number; // 0-1
}

export interface AbacoConfig {
  theme: {
    primaryColors: string[];
    backgroundColor: string;
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  api: {
    grokApiKey?: string;
    supabaseUrl: string;
    supabaseKey: string;
  };
  features: {
    aiEnhanced: boolean;
    realTimeData: boolean;
    marketIntelligence: boolean;
  };
}

export interface DataUpload {
  fileName: string;
  fileType: 'csv' | 'excel' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadedAt: Date;
  processedAt?: Date;
  recordCount?: number;
  qualityScore?: number;
  errors?: string[];
}

export interface KPIDashboard {
  title: string;
  metrics: {
    label: string;
    value: number | string;
    format: 'currency' | 'percentage' | 'number' | 'text';
    trend?: {
      direction: 'up' | 'down' | 'stable';
      value: number;
      period: string;
    };
    status?: 'good' | 'warning' | 'critical';
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'png' | 'svg' | 'figma';
  resolution?: '1080p' | '4k' | 'print';
  includeCharts: boolean;
  includeSummary: boolean;
  customBranding: boolean;
}
