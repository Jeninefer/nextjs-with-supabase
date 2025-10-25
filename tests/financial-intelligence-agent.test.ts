import { testUtils } from '@/lib/test/test-utils';
import { FinancialIntelligenceAgent } from '@/lib/agents/financial-intelligence-agent';
import { jest } from '@jest/globals';

describe('FinancialIntelligenceAgent', () => {
  let agent: FinancialIntelligenceAgent;
  
  beforeEach(() => {
    agent = new FinancialIntelligenceAgent({
      tenantId: 'test-tenant',
      traceEnabled: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Customer Profile Management', () => {
    it('should store customer profile with proper partition key', async () => {
      const mockCustomer = testUtils.createMockCustomer();
      
      const result = await agent.storeCustomerProfile(
        'enterprise',
        mockCustomer
      );
      
      expect(result.partitionKey).toMatch(/test-tenant\/enterprise\/\d{4}-\d{2}-\d{2}/);
      expect(result.documentType).toBe('customer_profile');
      expect(result.customerId).toBe(mockCustomer.customerId);
    });

    it('should handle storage errors gracefully', async () => {
      const mockCustomer = testUtils.createMockCustomer();
      
      // Mock Cosmos DB error by mocking the container's 'items.create' method to throw
      const container = (agent as any).container;
      if (container && container.items && typeof container.items.create === 'function') {
        jest.spyOn(container.items, 'create').mockRejectedValue(
          new Error('Cosmos DB connection failed')
        );
      } else {
        // If container is not accessible, skip the test or fail
        throw new Error('Unable to access container for mocking');
      }
      
      await expect(
        agent.storeCustomerProfile('enterprise', mockCustomer)
      ).rejects.toThrow('Cosmos DB connection failed');
    });
  });

  describe('Portfolio Analysis', () => {
    it('should store portfolio analysis with embedded KPIs', async () => {
      const mockPortfolio = testUtils.createMockPortfolio();
      
      const result = await agent.storePortfolioAnalysis(
        'enterprise',
        mockPortfolio
      );
      
      expect(result.kpis.totalAum).toBe(10000000);
      expect(result.insights).toHaveLength(2);
      expect(result.recommendations).toHaveLength(2);
    });
  });

});