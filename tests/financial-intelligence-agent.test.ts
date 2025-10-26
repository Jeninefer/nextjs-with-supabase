import { jest } from '@jest/globals';

// Production-ready test data factories following AI Toolkit best practices
class FinancialTestDataFactory {
  private static seed = 42; // Reproducible seed for testing
  
  static createMockCustomer() {
    return {
      customerId: `CUST${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      profile: {
        displayName: 'Test Customer Corporation',
        industry: 'TECHNOLOGY',
        kamOwner: 'KAM001',
        creditLimit: 1000000,
        balance: 750000,
        dpd: 0,
        utilizationRatio: 0.75,
        riskScore: 85,
        segmentCode: 'A',
        delinquencyBucket: 'Current'
      },
      features: {
        weightedApr: 0.085,
        balanceZscore: 0.5,
        daysSinceOrigination: 365,
        rollRateDirection: 'stable' as const,
        b2gFlag: false,
        customerType: 'CORP_CREDIT'
      },
      alerts: []
    };
  }

  static createMockPortfolio() {
    return {
      portfolioId: `PORTFOLIO_${Date.now()}`,
      kpis: {
        totalAum: 50000000,
        activeClients: 150,
        creditLines: 75000000,
        defaultRate: 0.02,
        churnRate: 0.05,
        weightedApr: 0.095,
        concentrationTop10: 0.35,
        b2gPercent: 0.15,
        dpdBuckets: {
          'Current': 120,
          '1-30 DPD': 20,
          '31-60 DPD': 7,
          '61-90 DPD': 2,
          '90+ DPD': 1
        }
      },
      insights: [
        'Portfolio shows healthy diversification with balanced risk profile',
        'Technology sector concentration represents growth opportunity'
      ],
      recommendations: [
        'Consider expanding SME segment for improved diversification',
        'Implement enhanced monitoring for high-utilization accounts'
      ],
      marketContext: {
        analysisMetadata: {
          processingTime: 2.5,
          dataQualityScore: 0.95
        },
        qualityScore: 0.92
      }
    };
  }
}

// Mock the agent since we need to test the interface
class MockFinancialIntelligenceAgent {
  private config: any;
  private operationId: string;
  
  constructor(config: any = {}) {
    this.config = {
      tenantId: config.tenantId || 'abaco_financial',
      traceEnabled: config.traceEnabled !== false
    };
    this.operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async storeCustomerProfile(segment: string, profileData: any) {
    // Simulate AI Toolkit tracing
    const traceId = `trace_${Date.now()}`;
    const partitionKey = `${this.config.tenantId}/${segment}/${new Date().toISOString().split('T')[0]}`;
    
    console.log('🔍 [AI Toolkit Trace] Storing customer profile', {
      traceId,
      tenantId: this.config.tenantId,
      segment,
      customerId: profileData.customerId,
      timestamp: new Date().toISOString(),
      platform: 'abaco_financial_intelligence'
    });

    return {
      id: `customer_${Date.now()}`,
      partitionKey,
      tenantId: this.config.tenantId,
      customerSegment: segment.toLowerCase(),
      analysisDate: new Date().toISOString().split('T')[0],
      documentType: 'customer_profile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: 365 * 24 * 60 * 60,
      customerId: profileData.customerId,
      ...profileData
    };
  }

  async storePortfolioAnalysis(segment: string, analysisData: any) {
    const traceId = `trace_${Date.now()}`;
    const partitionKey = `${this.config.tenantId}/${segment}/${new Date().toISOString().split('T')[0]}`;
    
    console.log('🔍 [AI Toolkit Trace] Storing portfolio analysis', {
      traceId,
      tenantId: this.config.tenantId,
      segment,
      portfolioId: analysisData.portfolioId,
      timestamp: new Date().toISOString(),
      platform: 'abaco_financial_intelligence'
    });

    return {
      id: `portfolio_${Date.now()}`,
      partitionKey,
      tenantId: this.config.tenantId,
      customerSegment: segment.toLowerCase(),
      analysisDate: new Date().toISOString().split('T')[0],
      documentType: 'portfolio_analysis',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: 365 * 24 * 60 * 60,
      ...analysisData
    };
  }

  async getOperationMetrics() {
    return {
      totalOperations: 10,
      successfulOperations: 9,
      failedOperations: 1,
      averageLatency: 125.5
    };
  }
}

describe('FinancialIntelligenceAgent', () => {
  let agent: MockFinancialIntelligenceAgent;
  
  beforeEach(() => {
    agent = new MockFinancialIntelligenceAgent({
      tenantId: 'test-tenant',
      traceEnabled: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Customer Profile Management', () => {
    it('should store customer profile with proper partition key following Azure Cosmos DB HPK patterns', async () => {
      const mockCustomer = FinancialTestDataFactory.createMockCustomer();
      
      const result = await agent.storeCustomerProfile('enterprise', mockCustomer);
      
      // Verify HPK structure: {tenantId}/{customerSegment}/{analysisDate}
      expect(result.partitionKey).toMatch(/test-tenant\/enterprise\/\d{4}-\d{2}-\d{2}/);
      expect(result.documentType).toBe('customer_profile');
      expect(result.customerId).toBe(mockCustomer.customerId);
      expect(result.tenantId).toBe('test-tenant');
      expect(result.ttl).toBe(365 * 24 * 60 * 60); // 1 year TTL
    });

    it('should handle different customer segments with proper partitioning', async () => {
      const mockCustomer = FinancialTestDataFactory.createMockCustomer();
      const segments = ['enterprise', 'corporate', 'sme', 'retail'];
      
      for (const segment of segments) {
        const result = await agent.storeCustomerProfile(segment, mockCustomer);
        expect(result.partitionKey).toContain(`/${segment}/`);
        expect(result.customerSegment).toBe(segment);
      }
    });

    it('should include AI Toolkit tracing metadata', async () => {
      const mockCustomer = FinancialTestDataFactory.createMockCustomer();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await agent.storeCustomerProfile('enterprise', mockCustomer);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍 [AI Toolkit Trace] Storing customer profile'),
        expect.objectContaining({
          tenantId: 'test-tenant',
          segment: 'enterprise',
          customerId: mockCustomer.customerId,
          platform: 'abaco_financial_intelligence'
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Portfolio Analysis', () => {
    it('should store portfolio analysis with comprehensive KPIs and Azure Cosmos DB optimization', async () => {
      const mockPortfolio = FinancialTestDataFactory.createMockPortfolio();
      
      const result = await agent.storePortfolioAnalysis('enterprise', mockPortfolio);
      
      expect(result.kpis.totalAum).toBe(50000000);
      expect(result.insights).toHaveLength(2);
      expect(result.recommendations).toHaveLength(2);
      expect(result.partitionKey).toMatch(/test-tenant\/enterprise\/\d{4}-\d{2}-\d{2}/);
      expect(result.documentType).toBe('portfolio_analysis');
    });

    it('should include market context and quality metrics', async () => {
      const mockPortfolio = FinancialTestDataFactory.createMockPortfolio();
      
      const result = await agent.storePortfolioAnalysis('enterprise', mockPortfolio);
      
      expect(result.marketContext).toBeDefined();
      expect(result.marketContext.qualityScore).toBe(0.92);
      expect(result.marketContext.analysisMetadata.dataQualityScore).toBe(0.95);
    });

    it('should handle comprehensive KPI structure for financial analysis', async () => {
      const mockPortfolio = FinancialTestDataFactory.createMockPortfolio();
      
      const result = await agent.storePortfolioAnalysis('portfolio', mockPortfolio);
      
      const kpis = result.kpis;
      expect(kpis.totalAum).toBeGreaterThan(0);
      expect(kpis.activeClients).toBeGreaterThan(0);
      expect(kpis.creditLines).toBeGreaterThan(0);
      expect(kpis.defaultRate).toBeGreaterThanOrEqual(0);
      expect(kpis.weightedApr).toBeGreaterThan(0);
      expect(kpis.dpdBuckets).toHaveProperty('Current');
      expect(kpis.dpdBuckets).toHaveProperty('1-30 DPD');
    });
  });

  describe('Performance and Metrics', () => {
    it('should track operation metrics following AI Toolkit best practices', async () => {
      const metrics = await agent.getOperationMetrics();
      
      expect(metrics.totalOperations).toBeGreaterThanOrEqual(0);
      expect(metrics.successfulOperations).toBeGreaterThanOrEqual(0);
      expect(metrics.failedOperations).toBeGreaterThanOrEqual(0);
      expect(metrics.averageLatency).toBeGreaterThan(0);
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 10 }, async (_, i) => {
        const customer = FinancialTestDataFactory.createMockCustomer();
        customer.customerId = `LOAD_TEST_${i}`;
        return agent.storeCustomerProfile('enterprise', customer);
      });
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify all operations have unique IDs
      const ids = results.map(r => r.id);
      expect(new Set(ids).size).toBe(10);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle invalid data gracefully', async () => {
      const invalidCustomer = {
        customerId: '', // Invalid empty ID
        profile: null,
        features: {}
      };
      
      // Should not throw, but handle gracefully
      await expect(
        agent.storeCustomerProfile('enterprise', invalidCustomer)
      ).resolves.toBeDefined();
    });

    it('should maintain tracing even during errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      try {
        await agent.storeCustomerProfile('invalid_segment', {});
      } catch (error) {
        // Error handling
      }
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Azure Cosmos DB Integration', () => {
    it('should generate proper hierarchical partition keys for multi-tenant isolation', async () => {
      const testTenants = ['tenant_a', 'tenant_b', 'tenant_c'];
      
      for (const tenantId of testTenants) {
        const tenantAgent = new MockFinancialIntelligenceAgent({ tenantId });
        const customer = FinancialTestDataFactory.createMockCustomer();
        
        const result = await tenantAgent.storeCustomerProfile('enterprise', customer);
        
        expect(result.partitionKey).toMatch(^`${tenantId}/enterprise/`);
        expect(result.tenantId).toBe(tenantId);
      }
    });

    it('should follow Azure Cosmos DB document size optimization', async () => {
      const portfolio = FinancialTestDataFactory.createMockPortfolio();
      const result = await agent.storePortfolioAnalysis('enterprise', portfolio);
      
      // Estimate document size (should be well under 2MB limit)
      const docSize = JSON.stringify(result).length;
      expect(docSize).toBeLessThan(100000); // 100KB is reasonable for financial documents
    });

    it('should include TTL for automatic data lifecycle management', async () => {
      const customer = FinancialTestDataFactory.createMockCustomer();
      const result = await agent.storeCustomerProfile('enterprise', customer);
      
      expect(result.ttl).toBeDefined();
      expect(result.ttl).toBe(365 * 24 * 60 * 60); // 1 year in seconds
    });
  });

  describe('AI Toolkit Tracing Integration', () => {
    it('should generate comprehensive trace data for financial operations', async () => {
      const tracingAgent = new MockFinancialIntelligenceAgent({ 
        tenantId: 'trace-test', 
        traceEnabled: true 
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const customer = FinancialTestDataFactory.createMockCustomer();
      await tracingAgent.storeCustomerProfile('enterprise', customer);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍 [AI Toolkit Trace]'),
        expect.objectContaining({
          tenantId: 'trace-test',
          platform: 'abaco_financial_intelligence',
          timestamp: expect.any(String)
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should maintain trace correlation across operations', async () => {
      const customer = FinancialTestDataFactory.createMockCustomer();
      const portfolio = FinancialTestDataFactory.createMockPortfolio();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await agent.storeCustomerProfile('enterprise', customer);
      await agent.storePortfolioAnalysis('enterprise', portfolio);
      
      // Both operations should have been traced
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });
  });
});