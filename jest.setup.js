import '@testing-library/jest-dom';

// Use globalThis instead of global for better compatibility
globalThis.fetch = require('node-fetch');
globalThis.Request = require('node-fetch').Request;
globalThis.Response = require('node-fetch').Response;

// AI Toolkit test environment setup
globalThis.process.env.NODE_ENV = 'test';
globalThis.process.env.AZURE_COSMOS_DB_ENDPOINT = 'https://test.documents.azure.com:443/';
globalThis.process.env.AZURE_COSMOS_DB_KEY = 'test-key';

// Mock Cosmos DB client for testing - updated path
jest.mock('./lib/cosmosdb/client', () => ({
  getCosmosClient: jest.fn(() => ({
    getContainer: jest.fn(() => Promise.resolve({
      items: {
        create: jest.fn(() => Promise.resolve({ resource: {} })),
        query: jest.fn(() => ({
          fetchAll: jest.fn(() => Promise.resolve({ resources: [] }))
        }))
      }
    }))
  }))
}));

// Mock Supabase client for testing
jest.mock('./lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      updateUser: jest.fn(() => Promise.resolve({ error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    }
  })),
  updatePassword: jest.fn(() => Promise.resolve({ error: null }))
}));

// Test utilities for financial data
globalThis.testUtils = {
  createMockFinancialData: (count = 10) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `customer_${i}`,
      balance: Math.random() * 100000,
      creditLimit: Math.random() * 50000,
      utilizationRate: Math.random(),
      delinquencyStatus: Math.random() > 0.8 ? 'delinquent' : 'current',
      sector: ['technology', 'finance', 'healthcare', 'retail'][i % 4],
      region: ['US', 'EU', 'APAC', 'LATAM'][i % 4],
      type: ['equity', 'bond', 'cash', 'alternative'][i % 4]
    }));
  }
};
