// ABACO Financial Intelligence Platform - Jest Setup
// Following AI Toolkit best practices for testing

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.AZURE_COSMOS_DB_ENDPOINT = 'https://test.documents.azure.com:443/'
process.env.AZURE_COSMOS_DB_KEY = 'test-cosmos-key'
process.env.ABACO_FINANCIAL_SEED = '42'

// AI Toolkit tracing for tests
console.log('🔍 [AI Toolkit Trace] Test environment initialized', {
  timestamp: new Date().toISOString(),
  platform: 'abaco_financial_intelligence',
  environment: 'test'
})
