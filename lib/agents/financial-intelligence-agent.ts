// ABACO Financial Intelligence Agent
// AI Toolkit integration with comprehensive distributed tracing and Azure Cosmos DB HPK optimization

import { tracer, Tracer } from '../tracing/tracer';
import { logger } from '../tracing/structured-logger';
import { cosmosDbTracer } from '../tracing/cosmos-db-tracer';
import { TraceSpan } from '../tracing/trace-context';

export interface Position {
  id: string;
  type: 'equity' | 'bond' | 'cash' | 'alternative';
  balance: number;
  symbol?: string;
}

export interface PortfolioData {
  positions: Position[];
}

export interface FinancialReport {
  id: string;
  userId: string;
  generatedAt: string;
  summary: {
    totalValue: number;
    monthlyChange: number;
    yearlyReturn: number;
    riskScore: number;
    performanceGrade: string;
  };
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
    alternatives: number;
    riskLevel: string;
  };
  recommendations: string[];
  traceId?: string;
}

export class FinancialIntelligenceAgent {
  private tracer: Tracer;

  constructor() {
    this.tracer = tracer;
  }

  /**
   * Calculate portfolio allocation with comprehensive tracing
   */
  private calculatePortfolioAllocation(positions: Position[], span: TraceSpan): any {
    const totalBalance = positions.reduce((sum, pos) => sum + (pos.balance || 0), 0);

    this.tracer.addEvent(span, 'allocation_calculation_start', {
      positionCount: positions.length,
      totalBalance
    });

    if (totalBalance === 0) {
      this.tracer.addEvent(span, 'allocation_empty_portfolio', {});
      return {
        stocks: 0,
        bonds: 0,
        cash: 0,
        alternatives: 0,
        riskLevel: 'conservative'
      };
    }

    const stocks =
      positions.filter(p => p.type === 'equity').reduce((sum, c) => sum + (c.balance || 0), 0) /
      totalBalance *
      100;

    const bonds =
      positions.filter(p => p.type === 'bond').reduce((sum, c) => sum + (c.balance || 0), 0) /
      totalBalance *
      100;

    const allocation = {
      stocks: Math.round(stocks * 100) / 100,
      bonds: Math.round(bonds * 100) / 100,
      cash: Math.round((100 - stocks - bonds) * 100) / 100,
      alternatives: 0,
      riskLevel: stocks > 70 ? 'aggressive' : stocks > 40 ? 'moderate' : 'conservative'
    };

    this.tracer.addEvent(span, 'allocation_calculated', {
      allocation,
      riskLevel: allocation.riskLevel
    });

    return allocation;
  }

  /**
   * Generate financial intelligence report with full tracing
   * Optimized for Azure Cosmos DB with Hierarchical Partition Keys
   */
  async generateFinancialReport(userId: string, portfolioData: PortfolioData): Promise<FinancialReport> {
    return this.tracer.trace('generateFinancialReport', async (span: TraceSpan) => {
      this.tracer.addEvent(span, 'report_generation_started', {
        userId,
        positionCount: portfolioData?.positions?.length || 0
      });

      try {
        const positions = portfolioData?.positions || [];

        // Trace allocation calculation
        const allocation = this.calculatePortfolioAllocation(positions, span);

        // Trace value calculation
        const totalValue = positions.reduce((sum: number, pos: Position) => sum + (pos.balance || 0), 0);

        this.tracer.addEvent(span, 'portfolio_value_calculated', {
          totalValue,
          positionCount: positions.length
        });

        // Create report
        const report: FinancialReport = {
          id: `report_${userId}_${Date.now()}`,
          userId,
          generatedAt: new Date().toISOString(),
          summary: {
            totalValue,
            monthlyChange: 0,
            yearlyReturn: 0,
            riskScore: 50,
            performanceGrade: 'B'
          },
          allocation,
          recommendations: [
            'Consider diversifying your portfolio',
            'Monitor market trends regularly',
            'Review risk tolerance annually'
          ],
          traceId: span.traceId
        };

        // Trace report storage
        await this.storeReport(report, span);

        this.tracer.addEvent(span, 'report_generation_completed', {
          reportId: report.id,
          totalValue,
          riskLevel: allocation.riskLevel
        });

        logger.info('Financial report generated successfully', {
          reportId: report.id,
          userId,
          totalValue,
          riskLevel: allocation.riskLevel
        });

        return report;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Financial report generation failed', error instanceof Error ? error : new Error(errorMessage), {
          userId,
          portfolioSize: portfolioData?.positions?.length || 0
        });
        throw new Error(`Financial intelligence generation failed: ${errorMessage}`);
      }
    }, { userId });
  }

  /**
   * Analyze portfolio risk with distributed tracing
   */
  async analyzePortfolioRisk(positions: Position[]): Promise<any> {
    return this.tracer.trace('analyzePortfolioRisk', async (span: TraceSpan) => {
      this.tracer.addEvent(span, 'risk_analysis_started', {
        positionCount: positions.length
      });

      // Calculate risk metrics
      const volatility = this.calculateVolatility(positions, span);
      const diversification = this.calculateDiversification(positions, span);

      const analysis = {
        overallRisk: 50,
        volatility,
        diversification,
        recommendations: ['Consider rebalancing quarterly']
      };

      this.tracer.addEvent(span, 'risk_analysis_completed', analysis);

      logger.info('Portfolio risk analysis completed', {
        riskScore: analysis.overallRisk,
        volatility,
        diversification
      });

      return analysis;
    });
  }

  /**
   * Calculate portfolio volatility
   */
  private calculateVolatility(positions: Position[], span: TraceSpan): string {
    const equityPercentage =
      positions.filter(p => p.type === 'equity').reduce((s, p) => s + p.balance, 0) /
      positions.reduce((s, p) => s + p.balance, 0);

    const volatility = equityPercentage > 0.7 ? 'high' : equityPercentage > 0.4 ? 'medium' : 'low';

    this.tracer.addEvent(span, 'volatility_calculated', {
      volatility,
      equityPercentage: (equityPercentage * 100).toFixed(2)
    });

    return volatility;
  }

  /**
   * Calculate portfolio diversification
   */
  private calculateDiversification(positions: Position[], span: TraceSpan): string {
    const uniqueTypes = new Set(positions.map(p => p.type)).size;
    const diversification = uniqueTypes > 3 ? 'excellent' : uniqueTypes > 2 ? 'adequate' : 'poor';

    this.tracer.addEvent(span, 'diversification_calculated', {
      diversification,
      uniqueAssetTypes: uniqueTypes
    });

    return diversification;
  }

  /**
   * Store report in Azure Cosmos DB with HPK optimization and tracing
   */
  private async storeReport(report: FinancialReport, span: TraceSpan): Promise<void> {
    const operationSpan = this.tracer.startSpan('storeReportInCosmosDB');

    try {
      const startTime = Date.now();

      // Simulate Cosmos DB operation
      // In production, this would call actual Azure Cosmos DB
      await new Promise(resolve => setTimeout(resolve, 50));

      const duration = Date.now() - startTime;

      // Track in Cosmos DB tracer
      cosmosDbTracer.trackOperation({
        operationType: 'create',
        duration,
        statusCode: 201,
        requestCharge: 5.2,
        itemCount: 1,
        documentId: report.id,
        partitionKey: report.userId
      });

      this.tracer.addEvent(span, 'report_stored_in_cosmos_db', {
        documentId: report.id,
        partitionKey: report.userId,
        duration,
        requestCharge: 5.2
      });

      logger.debug('Report stored in Cosmos DB', {
        reportId: report.id,
        userId: report.userId,
        duration,
        rUs: 5.2
      });

      this.tracer.endSpan(operationSpan, 'success');
    } catch (error) {
      this.tracer.endSpan(operationSpan, 'error', error instanceof Error ? error : new Error(String(error)));

      cosmosDbTracer.trackOperation({
        operationType: 'create',
        duration: Date.now() - Date.now(),
        statusCode: 500,
        requestCharge: 0,
        documentId: report.id,
        partitionKey: report.userId,
        error: {
          code: 'STORAGE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      logger.error('Failed to store report in Cosmos DB', error instanceof Error ? error : new Error(String(error)), {
        reportId: report.id,
        userId: report.userId
      });

      throw error;
    }
  }

  /**
   * Get tracing diagnostics
   */
  getTracingDiagnostics() {
    return {
      spans: this.tracer.getTraceSummary(),
      cosmosDbMetrics: cosmosDbTracer.getMetrics(),
      cosmosDbRecommendations: cosmosDbTracer.getOptimizationRecommendations()
    };
  }
}

export default FinancialIntelligenceAgent;
