// Hierarchical Partition Key Structure: {tenantId}/{customerSegment}/{analysisDate}
export const createPartitionKey = (
  tenantId: string, 
  customerSegment: string, 
  analysisDate: string
): string => {
  return `${tenantId}/${customerSegment}/${analysisDate}`;
};

export interface FinancialDocument {
  id: string;
  partitionKey: string;
  tenantId: string;
  customerSegment: string;
  analysisDate: string;
  documentType: string;
  createdAt: string;
  updatedAt: string;
  ttl?: number;
}

export interface PortfolioAnalysisDocument extends FinancialDocument {
  documentType: 'portfolio_analysis';
  kpis: Record<string, number>;
  insights: Array<{
    category: string;
    message: string;
    severity: string;
    confidence: number;
  }>;
  alerts: Array<{
    customerId: string;
    severity: string;
    message: string;
  }>;
  performance: {
    processingTimeMs: number;
    recordsProcessed: number;
  };
}

export interface CustomerAnalysisDocument extends FinancialDocument {
  documentType: 'customer_analysis';
  customerId: string;
  riskScore: number;
  utilizationRate: number;
  delinquencyDays: number;
  recommendations: string[];
}
