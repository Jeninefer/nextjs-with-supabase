import { FinancialIntelligenceAgent } from '../financial-intelligence-agent';
import type { FinancialCustomer as FinancialData } from '../financial-intelligence-agent';

// Mock the dependencies
jest.mock('../../cosmosdb/client');
jest.mock('../../cosmosdb/models');

describe('FinancialIntelligenceAgent', () => {
  let agent: FinancialIntelligenceAgent;
  let mockFinancialData: FinancialData[];

  beforeEach(() => {
    agent = new FinancialIntelligenceAgent('test-tenant', true);
    mockFinancialData = global.testUtils.createMockFinancialData(50);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Agent Initialization', () => {
    it('should initialize with correct tenant and tracing settings', () => {
      expect(agent).toBeDefined();
      expect(agent['tenantId']).toBe('test-tenant');
      expect(agent['tracingEnabled']).toBe(true);
      expect(agent['operationId']).toBeDefined();
    });

    it('should use default values when not provided', () => {
      const defaultAgent = new FinancialIntelligenceAgent();
      expect(defaultAgent['tenantId']).toBe('abaco_financial');
      expect(defaultAgent['tracingEnabled']).toBe(true);
    });
  });

  describe('Financial Data Processing', () => {
    it('should process financial data successfully', async () => {
      const result = await agent.processFinancialData(mockFinancialData);

      expect(result).toBeDefined();
      expect(result.operationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.kpis).toBeDefined();
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.alerts).toBeInstanceOf(Array);
      expect(result.performance).toBeDefined();
      expect(result.performance.recordsProcessed).toBe(mockFinancialData.length);
    });

    it('should calculate KPIs correctly', () => {
      const testData: FinancialData[] = [
        {
          customerId: 'CUST001',
          balance: 10000,
          creditLimit: 20000,
          dpd: 0,
          industry: 'TECHNOLOGY',
          analysisDate: '2024-01-01'
        },
        {
          customerId: 'CUST002',
          balance: 15000,
          creditLimit: 25000,
          dpd: 45,
          industry: 'HEALTHCARE',
          analysisDate: '2024-01-01'
        }
      ];

      const kpis = agent['calculateKPIs'](testData);

      expect(kpis.totalAUM).toBe(25000);
      expect(kpis.customerCount).toBe(2);
      expect(kpis.averageBalance).toBe(12500);
      expect(kpis.portfolioUtilization).toBeCloseTo(55.56, 1);
      expect(kpis.delinquencyRate).toBe(50);
      expect(kpis.highRiskRate).toBe(0);
    });

    it('should handle empty data gracefully', async () => {
      const result = await agent.processFinancialData([]);

      expect(result.kpis.customerCount).toBe(0);
      expect(result.kpis.totalAUM).toBe(0);
      expect(isNaN(result.kpis.averageBalance)).toBe(true);
      expect(result.performance.recordsProcessed).toBe(0);
    });
  });

  describe('AI Insights Generation', () => {
    it('should generate insights for large portfolios', async () => {
      const largePortfolioKPIs = {
        totalAUM: 2000000000, // $2B
        highRiskRate: 3,
        portfolioUtilization: 65
      };

      const insights = await agent['generateInsights'](largePortfolioKPIs, mockFinancialData);

      expect(insights).toContain(
        expect.stringMatching(/Strong portfolio scale.*2\.0B AUM/)
      );
    });

    it('should generate risk alerts for high-risk portfolios', async () => {
      const highRiskKPIs = {
        totalAUM: 500000000,
        highRiskRate: 8, // Above 5% threshold
        portfolioUtilization: 65
      };

      const insights = await agent['generateInsights'](highRiskKPIs, mockFinancialData);

      expect(insights).toContain(
        expect.stringMatching(/High risk alert.*8\.0%/)
      );
    });

    it('should identify industry concentration risks', async () => {
      const concentratedData: FinancialData[] = Array.from({ length: 10 }, (_, i) => ({
        customerId: `CUST${i}`,
        balance: 100000,
        creditLimit: 150000,
        dpd: 0,
        industry: i < 8 ? 'TECHNOLOGY' : 'HEALTHCARE', // 80% concentration
        analysisDate: '2024-01-01'
      }));

      const kpis = { totalAUM: 1000000, highRiskRate: 1, portfolioUtilization: 65 };
      const insights = await agent['generateInsights'](kpis, concentratedData);

      expect(insights).toContain(
        expect.stringMatching(/Industry concentration risk.*TECHNOLOGY.*80\.0%/)
      );
    });
  });

  describe('Alert Detection', () => {
    it('should detect critical delinquency alerts', () => {
      const criticalData: FinancialData[] = [
        {
          customerId: 'CUST001',
          balance: 10000,
          creditLimit: 15000,
          dpd: 150, // Critical level
          industry: 'TECHNOLOGY',
          analysisDate: '2024-01-01'
        }
      ];

      const alerts = agent['detectAlerts'](criticalData);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].message).toContain('Severe delinquency: 150 days');
    });

    it('should detect high utilization alerts', () => {
      const highUtilizationData: FinancialData[] = [
        {
          customerId: 'CUST001',
          balance: 19000, // 95% utilization
          creditLimit: 20000,
          dpd: 0,
          industry: 'TECHNOLOGY',
          analysisDate: '2024-01-01'
        }
      ];

      const alerts = agent['detectAlerts'](highUtilizationData);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('high');
      expect(alerts[0].message).toContain('Credit limit utilization: 95.0%');
    });

    it('should categorize alerts by severity correctly', () => {
      const testData: FinancialData[] = [
        // Critical: 120+ DPD
        { customerId: 'CUST001', balance: 10000, creditLimit: 20000, dpd: 130, industry: 'TECH', analysisDate: '2024-01-01' },
        // High: 90-119 DPD
        { customerId: 'CUST002', balance: 15000, creditLimit: 20000, dpd: 95, industry: 'TECH', analysisDate: '2024-01-01' },
        // Medium: 30-89 DPD
        { customerId: 'CUST003', balance: 12000, creditLimit: 20000, dpd: 45, industry: 'TECH', analysisDate: '2024-01-01' },
        // Low: High utilization
        { customerId: 'CUST004', balance: 17000, creditLimit: 20000, dpd: 0, industry: 'TECH', analysisDate: '2024-01-01' }
      ];

      const alerts = agent['detectAlerts'](testData);

      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      const highAlerts = alerts.filter(a => a.severity === 'high');
      const mediumAlerts = alerts.filter(a => a.severity === 'medium');
      const lowAlerts = alerts.filter(a => a.severity === 'low');

      expect(criticalAlerts).toHaveLength(1);
      expect(highAlerts).toHaveLength(1);
      expect(mediumAlerts).toHaveLength(1);
      expect(lowAlerts).toHaveLength(1);
    });
  });

  describe('Performance and Tracing', () => {
    it('should track processing performance', async () => {
      const startTime = Date.now();
      const result = await agent.processFinancialData(mockFinancialData);
      const endTime = Date.now();

      expect(result.performance.processingTimeMs).toBeGreaterThan(0);
      expect(result.performance.processingTimeMs).toBeLessThan(endTime - startTime + 100);
      expect(result.performance.recordsProcessed).toBe(mockFinancialData.length);
    });

    it('should handle processing errors gracefully', async () => {
      // Create invalid data that might cause processing errors
      const invalidData = [
        {
          customerId: 'INVALID',
          balance: -1000, // Negative balance
          creditLimit: 0, // Zero credit limit
          dpd: -5, // Negative DPD
          industry: '',
          analysisDate: 'invalid-date'
        }
      ] as FinancialData[];

      // Should not throw but handle gracefully
      await expect(agent.processFinancialData(invalidData)).resolves.toBeDefined();
    });

    it('should enable/disable tracing correctly', () => {
      const tracingAgent = new FinancialIntelligenceAgent('test', true);
      const nonTracingAgent = new FinancialIntelligenceAgent('test', false);

      expect(tracingAgent['tracingEnabled']).toBe(true);
      expect(nonTracingAgent['tracingEnabled']).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should process realistic financial portfolio', async () => {
      // Create realistic portfolio data
      const realisticData: FinancialData[] = [
        // Enterprise customers
        ...Array.from({ length: 10 }, (_, i) => ({
          customerId: `ENT${String(i).padStart(3, '0')}`,
          balance: 500000 + Math.random() * 2000000,
          creditLimit: 1000000 + Math.random() * 5000000,
          dpd: Math.random() < 0.1 ? Math.floor(Math.random() * 30) : 0,
          industry: 'ENTERPRISE',
          analysisDate: '2024-01-01'
        })),
        // SME customers
        ...Array.from({ length: 30 }, (_, i) => ({
          customerId: `SME${String(i).padStart(3, '0')}`,
          balance: 50000 + Math.random() * 500000,
          creditLimit: 100000 + Math.random() * 1000000,
          dpd: Math.random() < 0.05 ? Math.floor(Math.random() * 60) : 0,
          industry: 'SME',
          analysisDate: '2024-01-01'
        })),
        // Retail customers
        ...Array.from({ length: 100 }, (_, i) => ({
          customerId: `RET${String(i).padStart(3, '0')}`,
          balance: 1000 + Math.random() * 50000,
          creditLimit: 5000 + Math.random() * 100000,
          dpd: Math.random() < 0.02 ? Math.floor(Math.random() * 90) : 0,
          industry: 'RETAIL',
          analysisDate: '2024-01-01'
        }))
      ];

      const result = await agent.processFinancialData(realisticData);

      // Verify comprehensive analysis results
      expect(result.kpis.customerCount).toBe(140);
      expect(result.kpis.totalAUM).toBeGreaterThan(1000000);
      expect(result.kpis.portfolioUtilization).toBeGreaterThan(0);
      expect(result.kpis.portfolioUtilization).toBeLessThan(100);
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.performance.recordsProcessed).toBe(140);
    }, 10000); // Longer timeout for integration test
  });
});

// AI Toolkit specific evaluation tests
describe('AI Agent Evaluation - Financial Intelligence', () => {
  let agent: FinancialIntelligenceAgent;

  beforeEach(() => {
    agent = new FinancialIntelligenceAgent('evaluation-tenant', true);
  });

  describe('Agent Quality Metrics', () => {
    it('should meet response time requirements', async () => {
      const testData = global.testUtils.createMockFinancialData(1000);
      const startTime = Date.now();
      
      const result = await agent.processFinancialData(testData);
      const processingTime = Date.now() - startTime;

      // Should process 1000 records in under 5 seconds
      expect(processingTime).toBeLessThan(5000);
      expect(result.performance.processingTimeMs).toBeLessThan(5000);
    });

    it('should generate consistent insights for similar data', async () => {
      const baseData = global.testUtils.createMockFinancialData(100);
      
      const result1 = await agent.processFinancialData(baseData);
      const result2 = await agent.processFinancialData(baseData);
      
      // KPIs should be identical for same input
      expect(result1.kpis.totalAUM).toBe(result2.kpis.totalAUM);
      expect(result1.kpis.customerCount).toBe(result2.kpis.customerCount);
      expect(result1.kpis.portfolioUtilization).toBe(result2.kpis.portfolioUtilization);
    });

    it('should scale linearly with data size', async () => {
      const smallData = global.testUtils.createMockFinancialData(100);
      const largeData = global.testUtils.createMockFinancialData(1000);

      const smallResult = await agent.processFinancialData(smallData);
      const largeResult = await agent.processFinancialData(largeData);

      // Processing time should scale reasonably
      const timeRatio = largeResult.performance.processingTimeMs / smallResult.performance.processingTimeMs;
      expect(timeRatio).toBeGreaterThan(1);
      expect(timeRatio).toBeLessThan(50); // Should not be more than 50x slower
    });
  });

  describe('Agent Reliability', () => {
    it('should handle edge cases without crashing', async () => {
      const edgeCases = [
        [], // Empty array
        [{ // Single record
          customerId: 'EDGE001',
          balance: 0,
          creditLimit: 1,
          dpd: 0,
          industry: 'TEST',
          analysisDate: '2024-01-01'
        }],
        // Very large numbers
        [{
          customerId: 'LARGE001',
          balance: Number.MAX_SAFE_INTEGER / 1000,
          creditLimit: Number.MAX_SAFE_INTEGER / 500,
          dpd: 0,
          industry: 'TEST',
          analysisDate: '2024-01-01'
        }]
      ];

      for (const testCase of edgeCases) {
        await expect(agent.processFinancialData(testCase)).resolves.toBeDefined();
      }
    });

    it('should maintain data integrity throughout processing', async () => {
      const originalData = global.testUtils.createMockFinancialData(50);
      const dataCopy = JSON.parse(JSON.stringify(originalData));

      await agent.processFinancialData(originalData);

      // Original data should not be modified
      expect(originalData).toEqual(dataCopy);
    });
  });
});
