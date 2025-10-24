import '@testing-library/jest-dom';

// Mock AI Toolkit functions for testing
global.aitk_trace = jest.fn();
global.aitk_span = jest.fn();
global.aitk_diagnostic = jest.fn();

// Mock Cosmos DB client for testing
jest.mock('./lib/cosmosdb/client', () => ({
  getCosmosClient: jest.fn(() => ({
    getContainer: jest.fn(() => Promise.resolve({
      items: {
        create: jest.fn(() => Promise.resolve({
          resource: { id: 'test-id' },
          statusCode: 201,
          requestCharge: 5.2
        }))
      }
    })),
    executeWithDiagnostics: jest.fn((op, fn) => fn())
  }))
}));

// Mock Supabase client
jest.mock('./lib/supabase/financial-client', () => ({
  getFinancialClient: jest.fn(() => ({
    getFinancialData: jest.fn(() => Promise.resolve([])),
    saveKPIResults: jest.fn(() => Promise.resolve()),
    getLatestKPIs: jest.fn(() => Promise.resolve(null))
  }))
}));
