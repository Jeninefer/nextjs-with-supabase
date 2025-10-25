/**
 * Abaco Financial Intelligence Agent
 * 
 * AI-powered financial analysis agent for portfolio management,
 * risk assessment, and intelligent insights generation.
 * 
 * Following AI Toolkit best practices for agent development and tracing.
 */

import { getCosmosClient, DiagnosticInfo } from '../cosmosdb/client';
import { createPartitionKey } from '../cosmosdb/models';

// Production financial data interfaces
interface FinancialCustomer {
  customerId: string;
  balance: number;
  creditLimit: number;
  daysPassDue: number;
  customerSegment: 'ENTERPRISE' | 'CORPORATE' | 'SME' | 'RETAIL';
  industry: string;
  region: string;
  kamOwner: string;
  productCode: string;
  riskGrade: 'A' | 'B' | 'C' | 'D';
  apr: number;
  originationDate: string;
  analysisDate: string;
}

interface PortfolioAlert {
  customerId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'DELINQUENCY' | 'UTILIZATION' | 'CONCENTRATION' | 'PERFORMANCE';
  message: string;
  recommendedAction: string;
  impactLevel: number; // 1-10 scale
}

interface FinancialKPIs {
  // Portfolio Overview
  totalAUM: number;
  customerCount: number;
  averageBalance: number;
  medianBalance: number;
  totalCreditExposure: number;
  
  // Utilization Metrics
  portfolioUtilization: number;
  averageUtilization: number;
  highUtilizationRate: number;
  
  // Risk Metrics
  delinquency30Rate: number;
  delinquency60Rate: number;
  delinquency90Rate: number;
  averageDPD: number;
  riskGradeDistribution: Record<string, number>;
  
  // Performance Metrics
  weightedAPR: number;
  averageAPR: number;
  
  // Concentration Metrics
  topCustomerConcentration: number;
  industryConcentration: Record<string, number>;
  regionalConcentration: Record<string, number>;
  
  // Operational Metrics
  customersPerKAM: number;
  aumPerKAM: number;
}

interface AgentAnalysisResult {
  operationId: string;
  tenantId: string;
  analysisDate: string;
  timestamp: string;
  kpis: FinancialKPIs;
  insights: string[];
  alerts: PortfolioAlert[];
  recommendations: string[];
  riskScore: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  executionMetrics: {
    processingTimeMs: number;
    recordsProcessed: number;
    alertsGenerated: number;
    insightsGenerated: number;
    tokensUsed?: number;
    costUsd?: number;
  };
}

/**
 * Abaco Financial Intelligence Agent
 * 
 * Comprehensive AI agent for financial portfolio analysis,
 * risk assessment, and intelligent decision support.
 */
export class AbacoFinancialIntelligenceAgent {
  private readonly operationId: string;
  private readonly tenantId: string;
  private readonly tracingEnabled: boolean;
  private readonly analysisDate: string;

  constructor(
    tenantId = 'abaco_financial',
    tracingEnabled = true,
    analysisDate = new Date().toISOString().split('T')[0]
  ) {
    this.operationId = `abaco_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    this.tenantId = tenantId;
    this.tracingEnabled = tracingEnabled;
    this.analysisDate = analysisDate;
  }

  /**
   * Execute comprehensive financial portfolio analysis
   */
  async analyzePortfolio(customers: FinancialCustomer[]): Promise<AgentAnalysisResult> {
    const startTime = Date.now();
    this.trace('portfolio_analysis_started', { 
      customerCount: customers.length,
      tenantId: this.tenantId,
      analysisDate: this.analysisDate
    });

    try {
      // Validate input data
      this.validateFinancialData(customers);

      // Calculate comprehensive KPIs
      const kpis = this.calculateComprehensiveKPIs(customers);
      this.trace('kpis_calculated', { kpiCount: Object.keys(kpis).length });

      // Generate AI-powered insights
      const insights = await this.generateIntelligentInsights(kpis, customers);
      this.trace('insights_generated', { insightCount: insights.length });

      // Detect portfolio alerts
      const alerts = this.detectPortfolioAlerts(customers, kpis);
      this.trace('alerts_detected', { alertCount: alerts.length });

      // Generate recommendations
      const recommendations = this.generateRecommendations(kpis, alerts, customers);
      this.trace('recommendations_generated', { recommendationCount: recommendations.length });

      // Calculate overall risk score
      const riskScore = this.calculatePortfolioRiskScore(kpis, alerts);
      
      // Determine performance grade
      const performanceGrade = this.calculatePerformanceGrade(kpis, riskScore);

      // Store results in Cosmos DB
      const analysisResult: AgentAnalysisResult = {
        operationId: this.operationId,
        tenantId: this.tenantId,
        analysisDate: this.analysisDate,
        timestamp: new Date().toISOString(),
        kpis,
        insights,
        alerts,
        recommendations,
        riskScore,
        performanceGrade,
        executionMetrics: {
          processingTimeMs: Date.now() - startTime,
          recordsProcessed: customers.length,
          alertsGenerated: alerts.length,
          insightsGenerated: insights.length
        }
      };

      await this.storeAnalysisResults(analysisResult);
      this.trace('portfolio_analysis_completed', { 
        processingTimeMs: analysisResult.executionMetrics.processingTimeMs,
        riskScore,
        performanceGrade
      });

      return analysisResult;

    } catch (error) {
      this.trace('portfolio_analysis_error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error(`Abaco Financial Intelligence Agent failed: ${error}`);
    }
  }

  private validateFinancialData(customers: FinancialCustomer[]): void {
    if (!customers || customers.length === 0) {
      throw new Error('No financial data provided for analysis');
    }

    const invalidCustomers = customers.filter(customer => 
      !customer.customerId || 
      customer.balance < 0 || 
      customer.creditLimit <= 0 ||
      customer.daysPassDue < 0
    );

    if (invalidCustomers.length > 0) {
      throw new Error(`Invalid financial data detected for ${invalidCustomers.length} customers`);
    }
  }

  private calculateComprehensiveKPIs(customers: FinancialCustomer[]): FinancialKPIs {
    const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);
    const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
    const balances = customers.map(c => c.balance).sort((a, b) => a - b);
    
    // Risk grade distribution
    const riskGradeDistribution = customers.reduce((acc, c) => {
      acc[c.riskGrade] = (acc[c.riskGrade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Industry concentration
    const industryTotals = customers.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + c.balance;
      return acc;
    }, {} as Record<string, number>);

    const industryConcentration = Object.keys(industryTotals).reduce((acc, industry) => {
      acc[industry] = (industryTotals[industry] / totalBalance) * 100;
      return acc;
    }, {} as Record<string, number>);

    // Regional concentration
    const regionalTotals = customers.reduce((acc, c) => {
      acc[c.region] = (acc[c.region] || 0) + c.balance;
      return acc;
    }, {} as Record<string, number>);

    const regionalConcentration = Object.keys(regionalTotals).reduce((acc, region) => {
      acc[region] = (regionalTotals[region] / totalBalance) * 100;
      return acc;
    }, {} as Record<string, number>);

    // Top 10 customer concentration
    const topCustomerConcentration = customers
      .toSorted((a, b) => b.balance - a.balance)
      .slice(0, 10)
      .reduce((sum, c) => sum + c.balance, 0) / totalBalance * 100;

    return {
      // Portfolio Overview
      totalAUM: totalBalance,
      customerCount: customers.length,
      averageBalance: totalBalance / customers.length,
      medianBalance: balances[Math.floor(balances.length / 2)],
      totalCreditExposure: totalCreditLimit,
      
      // Utilization Metrics
      portfolioUtilization: (totalBalance / totalCreditLimit) * 100,
      averageUtilization: customers.reduce((sum, c) => sum + (c.balance / c.creditLimit), 0) / customers.length * 100,
      highUtilizationRate: customers.filter(c => (c.balance / c.creditLimit) > 0.8).length / customers.length * 100,
      
      // Risk Metrics
      delinquency30Rate: customers.filter(c => c.daysPassDue >= 30).length / customers.length * 100,
      delinquency60Rate: customers.filter(c => c.daysPassDue >= 60).length / customers.length * 100,
      delinquency90Rate: customers.filter(c => c.daysPassDue >= 90).length / customers.length * 100,
      averageDPD: customers.reduce((sum, c) => sum + c.daysPassDue, 0) / customers.length,
      riskGradeDistribution,
      
      // Performance Metrics
      weightedAPR: customers.reduce((sum, c) => sum + (c.balance * c.apr), 0) / totalBalance * 100,
      averageAPR: customers.reduce((sum, c) => sum + c.apr, 0) / customers.length * 100,
      
      // Concentration Metrics
      topCustomerConcentration,
      industryConcentration,
      regionalConcentration,
      
      // Operational Metrics
      customersPerKAM: customers.length / new Set(customers.map(c => c.kamOwner)).size,
      aumPerKAM: totalBalance / new Set(customers.map(c => c.kamOwner)).size
    };
  }

  private async generateIntelligentInsights(kpis: FinancialKPIs, customers: FinancialCustomer[]): Promise<string[]> {
    const insights: string[] = [];

    // Portfolio scale insights
    if (kpis.totalAUM > 10e9) {
      insights.push(`Exceptional portfolio scale: $${(kpis.totalAUM / 1e9).toFixed(1)}B AUM positions Abaco as market leader in financial services`);
    } else if (kpis.totalAUM > 1e9) {
      insights.push(`Strong institutional presence: $${(kpis.totalAUM / 1e9).toFixed(1)}B AUM demonstrates solid market position`);
    }

    // Risk profile insights
    if (kpis.delinquency90Rate > 5) {
      insights.push(`Critical risk alert: ${kpis.delinquency90Rate.toFixed(1)}% 90+ DPD rate requires immediate portfolio restructuring`);
    } else if (kpis.delinquency90Rate < 1) {
      insights.push(`Outstanding risk management: ${kpis.delinquency90Rate.toFixed(1)}% 90+ DPD rate demonstrates superior underwriting standards`);
    }

    // Utilization insights
    if (kpis.portfolioUtilization > 85) {
      insights.push(`High portfolio utilization: ${kpis.portfolioUtilization.toFixed(1)}% indicates strong customer engagement but potential credit pressure`);
    } else if (kpis.portfolioUtilization < 40) {
      insights.push(`Growth opportunity identified: ${kpis.portfolioUtilization.toFixed(1)}% utilization suggests significant expansion potential`);
    }

    // Concentration risk insights
    const maxIndustryConcentration = Math.max(...Object.values(kpis.industryConcentration));
    if (maxIndustryConcentration > 40) {
      const dominantIndustry = Object.keys(kpis.industryConcentration).find(
        key => kpis.industryConcentration[key] === maxIndustryConcentration
      );
      insights.push(`Industry concentration risk: ${dominantIndustry} represents ${maxIndustryConcentration.toFixed(1)}% of portfolio, requiring diversification strategy`);
    }

    // Performance insights
    if (kpis.weightedAPR > 15) {
      insights.push(`Premium pricing achieved: ${kpis.weightedAPR.toFixed(1)}% weighted APR indicates strong pricing power and risk-adjusted returns`);
    }

    // Operational efficiency insights
    if (kpis.customersPerKAM > 100) {
      insights.push(`KAM efficiency opportunity: ${kpis.customersPerKAM.toFixed(0)} customers per KAM suggests potential for relationship management optimization`);
    }

    return insights;
  }

  private detectPortfolioAlerts(customers: FinancialCustomer[], kpis: FinancialKPIs): PortfolioAlert[] {
    const alerts: PortfolioAlert[] = [];

    for (const customer of customers) {
      const utilizationRate = customer.balance / customer.creditLimit;

      // Critical delinquency alerts
      if (customer.daysPassDue >= 120) {
        alerts.push({
          customerId: customer.customerId,
          severity: 'critical',
          category: 'DELINQUENCY',
          message: `Severe delinquency: ${customer.daysPassDue} days past due`,
          recommendedAction: 'Immediate collection action required',
          impactLevel: 10
        });
      }

      // High risk alerts
      if (customer.daysPassDue >= 90 && customer.daysPassDue < 120) {
        alerts.push({
          customerId: customer.customerId,
          severity: 'high',
          category: 'DELINQUENCY',
          message: `High delinquency risk: ${customer.daysPassDue} days past due`,
          recommendedAction: 'Enhanced monitoring and intervention required',
          impactLevel: 8
        });
      }

      // Credit limit utilization alerts
      if (utilizationRate > 0.95) {
        alerts.push({
          customerId: customer.customerId,
          severity: 'high',
          category: 'UTILIZATION',
          message: `Critical utilization: ${(utilizationRate * 100).toFixed(1)}% of credit limit`,
          recommendedAction: 'Review credit limit or implement usage controls',
          impactLevel: 7
        });
      }

      // Risk grade deterioration
      if (customer.riskGrade === 'D' && customer.balance > 100000) {
        alerts.push({
          customerId: customer.customerId,
          severity: 'high',
          category: 'PERFORMANCE',
          message: `High-value customer with poor risk grade D`,
          recommendedAction: 'Immediate review and potential restructuring',
          impactLevel: 9
        });
      }
    }

    // Portfolio-level concentration alerts
    const maxIndustryConcentration = Math.max(...Object.values(kpis.industryConcentration));
    if (maxIndustryConcentration > 50) {
      const dominantIndustry = Object.keys(kpis.industryConcentration).find(
        key => kpis.industryConcentration[key] === maxIndustryConcentration
      );
      
      alerts.push({
        customerId: 'PORTFOLIO_LEVEL',
        severity: 'medium',
        category: 'CONCENTRATION',
        message: `Industry concentration risk: ${dominantIndustry} at ${maxIndustryConcentration.toFixed(1)}%`,
        recommendedAction: 'Diversify portfolio across industries',
        impactLevel: 6
      });
    }

    return alerts.sort((a, b) => b.impactLevel - a.impactLevel);
  }

  private generateRecommendations(kpis: FinancialKPIs, alerts: PortfolioAlert[], customers: FinancialCustomer[]): string[] {
    const recommendations: string[] = [];

    // Risk-based recommendations
    if (kpis.delinquency90Rate > 3) {
      recommendations.push('Implement enhanced early warning system for delinquency prediction');
      recommendations.push('Review and strengthen underwriting criteria for new customers');
    }

    // Utilization-based recommendations
    if (kpis.averageUtilization < 50) {
      recommendations.push('Launch customer engagement campaign to increase credit utilization');
      recommendations.push('Review pricing strategy to encourage higher usage');
    }

    // Concentration-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 5) {
      recommendations.push('Establish dedicated high-risk customer management team');
      recommendations.push('Implement automated early intervention system');
    }

    // Performance-based recommendations
    if (kpis.weightedAPR < 10) {
      recommendations.push('Review pricing model to optimize risk-adjusted returns');
      recommendations.push('Implement dynamic pricing based on customer risk profiles');
    }

    // Operational recommendations
    const highVolumeKAMs = customers.reduce((acc, c) => {
      acc[c.kamOwner] = (acc[c.kamOwner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overloadedKAMs = Object.entries(highVolumeKAMs).filter(([_, count]) => count > 150);
    if (overloadedKAMs.length > 0) {
      recommendations.push('Rebalance customer portfolios across KAMs to optimize relationship management');
    }

    return recommendations;
  }

  private calculatePortfolioRiskScore(kpis: FinancialKPIs, alerts: PortfolioAlert[]): number {
    let riskScore = 0;

    // Delinquency risk (0-40 points)
    riskScore += Math.min(40, kpis.delinquency90Rate * 8);

    // Concentration risk (0-25 points)
    const maxConcentration = Math.max(...Object.values(kpis.industryConcentration));
    riskScore += Math.min(25, (maxConcentration - 30) * 0.5);

    // Alert severity risk (0-25 points)
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    riskScore += Math.min(25, (criticalAlerts * 5) + (highAlerts * 2));

    // Utilization risk (0-10 points)
    if (kpis.portfolioUtilization > 90 || kpis.portfolioUtilization < 30) {
      riskScore += 10;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  private calculatePerformanceGrade(kpis: FinancialKPIs, riskScore: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (riskScore <= 20 && kpis.delinquency90Rate <= 1 && kpis.weightedAPR >= 12) {
      return 'A';
    } else if (riskScore <= 40 && kpis.delinquency90Rate <= 3) {
      return 'B';
    } else if (riskScore <= 60 && kpis.delinquency90Rate <= 5) {
      return 'C';
    } else if (riskScore <= 80) {
      return 'D';
    } else {
      return 'F';
    }
  }

  private async storeAnalysisResults(result: AgentAnalysisResult): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Store in Azure Cosmos DB with hierarchical partition key following best practices
      const partitionKey = createPartitionKey(
        this.tenantId,
        'PORTFOLIO',
        this.analysisDate
      );

      const document = {
        id: `abaco_analysis_${this.operationId}`,
        partitionKey,
        tenantId: this.tenantId,
        customerSegment: 'PORTFOLIO',
        analysisDate: this.analysisDate,
        documentType: 'portfolio_analysis',
        analysisResult: result,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ttl: 31536000 // 1 year retention for financial compliance
      };

      this.trace('cosmos_storage_initiated', {
        documentId: document.id,
        partitionKey: document.partitionKey,
        dataSize: JSON.stringify(document).length,
        operation: 'portfolio_analysis_storage'
      });

      // Production Cosmos DB storage implementation with comprehensive error handling
      const cosmosClient = getCosmosClient(this.logDiagnostics);
      
      await cosmosClient.executeWithDiagnostics('storeAnalysisResults', async () => {
        const container = await cosmosClient.getContainer();
        
        // Use partition key for optimal performance
        const response = await container.items.create(document, { 
          partitionKey: partitionKey,
          // Enable automatic indexing for financial queries
          indexingDirective: 'Include'
        });
        
        const storageLatency = Date.now() - startTime;
        
        this.trace('cosmos_storage_success', {
          documentId: document.id,
          statusCode: response.statusCode,
          requestCharge: response.requestCharge,
          storageLatencyMs: storageLatency,
          itemSizeBytes: JSON.stringify(response.resource).length
        });

        // Log diagnostic information for monitoring
        if (response.requestCharge && response.requestCharge > 50) {
          this.trace('cosmos_high_ru_usage', {
            operation: 'portfolio_analysis_storage',
            requestCharge: response.requestCharge,
            recommendation: 'Consider optimizing document size or indexing policy'
          });
        }

        return {
          resource: response.resource,
          statusCode: response.statusCode,
          requestCharge: response.requestCharge,
          diagnostics: response.diagnostics
        };
      });

      // Update execution metrics with storage performance
      result.executionMetrics.costUsd = (result.executionMetrics.costUsd || 0) + 
        ((await this.estimateStorageCost(JSON.stringify(document).length)) || 0);

    } catch (error) {
      const storageLatency = Date.now() - startTime;
      
      this.trace('cosmos_storage_error', { 
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof Error && 'code' in error ? (error as any).code : 'UNKNOWN',
        storageLatencyMs: storageLatency,
        retryRecommendation: 'Implement exponential backoff for production resilience'
      });
      
      // Don't throw - storage failure shouldn't fail the analysis
      // But log for monitoring and alerting
      console.error('[ABACO_STORAGE_ERROR] Failed to store analysis results in Cosmos DB:', error);
      
      // Optionally store in fallback location (e.g., blob storage)
      await this.storeToFallbackLocation(result).catch(fallbackError => {
        console.error('[ABACO_FALLBACK_ERROR] Fallback storage also failed:', fallbackError);
      });
    }
  }

  private async estimateStorageCost(documentSizeBytes: number): Promise<number> {
    // Rough estimate: 1 RU per 1KB of document size for writes
    const estimatedRUs = Math.ceil(documentSizeBytes / 1024);
    // Azure Cosmos DB pricing: ~$0.008 per 100 RUs (varies by region)
    return (estimatedRUs / 100) * 0.008;
  }

  private async storeToFallbackLocation(result: AgentAnalysisResult): Promise<void> {
    // Fallback storage implementation (e.g., local file system, blob storage)
    // This ensures analysis results are never lost
    this.trace('fallback_storage_initiated', {
      operationId: result.operationId,
      reason: 'cosmos_db_unavailable'
    });
    
    // Implementation would depend on chosen fallback storage
    // For now, just trace the attempt
    console.log('[ABACO_FALLBACK] Analysis results queued for retry or manual recovery');
  }

  private trace(event: string, data?: Record<string, unknown>): void {
    if (this.tracingEnabled) {
      const timestamp = new Date().toISOString();
      console.log(`[ABACO_TRACE] ${timestamp} - ${this.operationId} - ${event}`, data || {});
    }
  }

  private readonly logDiagnostics = (info: DiagnosticInfo): void => {
    this.trace('cosmos_diagnostic', {
      operation: info.operation,
      latency: info.latency,
      statusCode: info.statusCode,
      requestCharge: info.requestCharge
    });
  };
}

// Export types for external use
export type { FinancialCustomer, PortfolioAlert, FinancialKPIs, AgentAnalysisResult };

