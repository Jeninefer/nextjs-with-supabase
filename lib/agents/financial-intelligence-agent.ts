import { aitk_get_agent_code_gen_best_practices } from '@aitk/agent';
import { aitk_get_tracing_code_gen_best_practices } from '@aitk/tracing';
import { getCosmosClient, DiagnosticInfo } from '../cosmosdb/client';
import { createPartitionKey } from '../cosmosdb/models';

interface FinancialData {
  customerId: string;
  balance: number;
  creditLimit: number;
  dpd: number;
  industry: string;
  analysisDate: string;
}

interface AgentResponse {
  operationId: string;
  timestamp: string;
  kpis: Record<string, number>;
  insights: string[];
  alerts: Array<{
    customerId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }>;
  performance: {
    processingTimeMs: number;
    recordsProcessed: number;
  };
}

class FinancialIntelligenceAgent {
  private operationId: string;
  private tenantId: string;
  private tracingEnabled: boolean;

  constructor(tenantId: string = 'abaco_financial', tracingEnabled: boolean = true) {
    this.operationId = crypto.randomUUID();
    this.tenantId = tenantId;
    this.tracingEnabled = tracingEnabled;
  }

  private trace(event: string, data?: Record<string, any>): void {
    if (this.tracingEnabled) {
      console.log(`[TRACE] ${this.operationId} - ${event}`, data || '');
    }
  }

  async processFinancialData(data: FinancialData[]): Promise<AgentResponse> {
    const startTime = Date.now();
    this.trace('agent_processing_start', { recordCount: data.length });

    try {
      // Calculate KPIs
      const kpis = this.calculateKPIs(data);
      this.trace('kpis_calculated', { kpiCount: Object.keys(kpis).length });

      // Generate insights using AI
      const insights = await this.generateInsights(kpis, data);
      this.trace('insights_generated', { insightCount: insights.length });

      // Detect alerts
      const alerts = this.detectAlerts(data);
      this.trace('alerts_detected', { alertCount: alerts.length });

      // Store results in Cosmos DB
      await this.storeResults(kpis, insights, alerts);
      this.trace('results_stored');

      const processingTime = Date.now() - startTime;
      this.trace('agent_processing_complete', { processingTimeMs: processingTime });

      return {
        operationId: this.operationId,
        timestamp: new Date().toISOString(),
        kpis,
        insights,
        alerts,
        performance: {
          processingTimeMs: processingTime,
          recordsProcessed: data.length
        }
      };

    } catch (error) {
      this.trace('agent_processing_error', { error: String(error) });
      throw error;
    }
  }

  private calculateKPIs(data: FinancialData[]): Record<string, number> {
    const totalBalance = data.reduce((sum, item) => sum + item.balance, 0);
    const totalCreditLimit = data.reduce((sum, item) => sum + item.creditLimit, 0);
    const delinquentCount = data.filter(item => item.dpd >= 30).length;
    const highRiskCount = data.filter(item => item.dpd >= 90).length;

    return {
      totalAUM: totalBalance,
      customerCount: data.length,
      averageBalance: totalBalance / data.length,
      portfolioUtilization: (totalBalance / totalCreditLimit) * 100,
      delinquencyRate: (delinquentCount / data.length) * 100,
      highRiskRate: (highRiskCount / data.length) * 100,
      averageDPD: data.reduce((sum, item) => sum + item.dpd, 0) / data.length
    };
  }

  private async generateInsights(kpis: Record<string, number>, data: FinancialData[]): Promise<string[]> {
    const insights: string[] = [];

    // Portfolio size insights
    if (kpis.totalAUM > 1000000000) {
      insights.push(`Strong portfolio scale: $${(kpis.totalAUM / 1e9).toFixed(1)}B AUM demonstrates market leadership`);
    } else if (kpis.totalAUM > 100000000) {
      insights.push(`Solid portfolio: $${(kpis.totalAUM / 1e6).toFixed(1)}M AUM indicates good market position`);
    }

    // Risk insights
    if (kpis.highRiskRate > 5) {
      insights.push(`High risk alert: ${kpis.highRiskRate.toFixed(1)}% of portfolio requires immediate attention`);
    } else if (kpis.highRiskRate < 1) {
      insights.push(`Excellent risk profile: ${kpis.highRiskRate.toFixed(1)}% high-risk rate demonstrates strong portfolio health`);
    }

    // Utilization insights
    if (kpis.portfolioUtilization > 80) {
      insights.push(`High utilization warning: ${kpis.portfolioUtilization.toFixed(1)}% may indicate credit pressure`);
    } else if (kpis.portfolioUtilization < 30) {
      insights.push(`Growth opportunity: ${kpis.portfolioUtilization.toFixed(1)}% utilization suggests potential for expansion`);
    }

    // Industry concentration analysis
    const industryDistribution = this.analyzeIndustryConcentration(data);
    const maxConcentration = Math.max(...Object.values(industryDistribution));
    if (maxConcentration > 50) {
      const dominantIndustry = Object.keys(industryDistribution).find(
        key => industryDistribution[key] === maxConcentration
      );
      insights.push(`Industry concentration risk: ${dominantIndustry} represents ${maxConcentration.toFixed(1)}% of portfolio`);
    }

    return insights;
  }

  private analyzeIndustryConcentration(data: FinancialData[]): Record<string, number> {
    const industryTotals: Record<string, number> = {};
    const totalAUM = data.reduce((sum, item) => sum + item.balance, 0);

    data.forEach(item => {
      industryTotals[item.industry] = (industryTotals[item.industry] || 0) + item.balance;
    });

    // Convert to percentages
    Object.keys(industryTotals).forEach(industry => {
      industryTotals[industry] = (industryTotals[industry] / totalAUM) * 100;
    });

    return industryTotals;
  }

  private detectAlerts(data: FinancialData[]): Array<{ customerId: string; severity: 'low' | 'medium' | 'high' | 'critical'; message: string }> {
    const alerts: Array<{ customerId: string; severity: 'low' | 'medium' | 'high' | 'critical'; message: string }> = [];

    data.forEach(item => {
      const utilizationRate = item.balance / item.creditLimit;

      // Critical alerts
      if (item.dpd >= 120) {
        alerts.push({
          customerId: item.customerId,
          severity: 'critical',
          message: `Severe delinquency: ${item.dpd} days past due`
        });
      }

      // High severity alerts
      if (item.dpd >= 90 && item.dpd < 120) {
        alerts.push({
          customerId: item.customerId,
          severity: 'high',
          message: `High delinquency risk: ${item.dpd} days past due`
        });
      }

      if (utilizationRate > 0.95) {
        alerts.push({
          customerId: item.customerId,
          severity: 'high',
          message: `Credit limit utilization: ${(utilizationRate * 100).toFixed(1)}%`
        });
      }

      // Medium severity alerts
      if (item.dpd >= 30 && item.dpd < 90) {
        alerts.push({
          customerId: item.customerId,
          severity: 'medium',
          message: `Early delinquency: ${item.dpd} days past due`
        });
      }

      // Low severity alerts
      if (utilizationRate > 0.80 && utilizationRate <= 0.95) {
        alerts.push({
          customerId: item.customerId,
          severity: 'low',
          message: `Approaching credit limit: ${(utilizationRate * 100).toFixed(1)}% utilization`
        });
      }
    });

    return alerts;
  }

  private async storeResults(
    kpis: Record<string, number>,
    insights: string[],
    alerts: Array<{ customerId: string; severity: string; message: string }>
  ): Promise<void> {
    try {
      const cosmosClient = getCosmosClient(this.logDiagnostics);
      const container = await cosmosClient.getContainer();

      const analysisDate = new Date().toISOString().split('T')[0];
      const partitionKey = createPartitionKey(this.tenantId, 'PORTFOLIO', analysisDate);

      const document = {
        id: `portfolio_analysis_${this.operationId}`,
        partitionKey,
        tenantId: this.tenantId,
        customerSegment: 'PORTFOLIO',
        analysisDate,
        documentType: 'portfolio_analysis',
        kpis,
        insights,
        alerts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ttl: 31536000 // 1 year retention
      };

      await cosmosClient.executeWithDiagnostics('storeResults', async () => {
        const response = await container.items.create(document, { partitionKey });
        return {
          resource: response.resource,
          statusCode: response.statusCode,
          requestCharge: response.requestCharge,
          diagnostics: response.diagnostics
        };
      });

      this.trace('cosmos_storage_success', { documentId: document.id });

    } catch (error) {
      this.trace('cosmos_storage_error', { error: String(error) });
      // Don't throw - storage failure shouldn't fail the entire operation
      console.error('Failed to store results in Cosmos DB:', error);
    }
  }

  private logDiagnostics = (info: DiagnosticInfo): void => {
    this.trace('cosmos_diagnostic', info);
  };
}

export { FinancialIntelligenceAgent };
export type { FinancialData, AgentResponse };
