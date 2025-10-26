import '@testing-library/jest-dom';

// Use globalThis instead of global for better compatibility
globalThis.fetch = require('node-fetch');
globalThis.Request = require('node-fetch').Request;
globalThis.Response = require('node-fetch').Response;

// AI Toolkit test environment setup
globalThis.process.env.NODE_ENV = 'test';
globalThis.process.env.AZURE_COSMOS_DB_ENDPOINT = 'https://test.documents.azure.com:443/';
globalThis.process.env.AZURE_COSMOS_DB_KEY = 'test-key';

// Mock AI Toolkit functions for testing
global.aitk_trace = jest.fn();
global.aitk_span = jest.fn();
global.aitk_diagnostic = jest.fn();

// Mock Cosmos DB client for testing
jest.mock('<rootDir>/lib/cosmosdb/client', () => ({
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
