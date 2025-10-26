/**
 * Tracing Implementation Examples
 * Demonstrates best practices for using the distributed tracing system
 */

import { tracer } from './tracer';
import { logger } from './structured-logger';
import { cosmosDbTracer } from './cosmos-db-tracer';
import { createTraceContext, setTraceContextAsync, getTraceContext } from './trace-context';
import { FinancialIntelligenceAgent } from '../agents/financial-intelligence-agent';

/**
 * Example 1: Basic Tracing
 */
export async function exampleBasicTracing() {
  console.log('\n=== Example 1: Basic Tracing ===');

  const result = await tracer.trace('calculatePortfolioMetrics', async (span) => {
    tracer.addEvent(span, 'calculation_started', {
      portfolioSize: 100000,
      assetCount: 25
    });

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));

    tracer.addEvent(span, 'metrics_calculated', {
      totalReturn: 12.5,
      riskScore: 65
    });

    return { totalReturn: 12.5, riskScore: 65 };
  });

  console.log('Result:', result);
}

/**
 * Example 2: Context Propagation
 */
export async function exampleContextPropagation() {
  console.log('\n=== Example 2: Context Propagation ===');

  const userId = 'user_12345';
  const sessionId = 'session_67890';

  // Create a context for this user session
  const context = createTraceContext(userId, sessionId);

  await setTraceContextAsync(context, async () => {
    // All operations within this block share the same trace context
    const currentContext = getTraceContext();

    // Operation 1
    await tracer.trace('operation1', async (span) => {
      logger.info('Executing operation 1', { step: 'start' });
      // ...
      tracer.addEvent(span, 'operation1_complete', {});
    });

    // Operation 2
    await tracer.trace('operation2', async (span) => {
      logger.info('Executing operation 2', { step: 'start' });
      // ...
      tracer.addEvent(span, 'operation2_complete', {});
    });

    console.log('Trace ID:', currentContext?.traceId);
    console.log('Correlation ID:', currentContext?.correlationId);
  });
}

/**
 * Example 3: Financial Report Generation with Tracing
 */
export async function exampleFinancialReporting() {
  console.log('\n=== Example 3: Financial Reporting ===');

  const agent = new FinancialIntelligenceAgent();

  const portfolioData = {
    positions: [
      { id: 'pos1', type: 'equity' as const, balance: 50000, symbol: 'AAPL' },
      { id: 'pos2', type: 'bond' as const, balance: 30000, symbol: 'US10Y' },
      { id: 'pos3', type: 'cash' as const, balance: 20000, symbol: 'USD' }
    ]
  };

  try {
    const report = await agent.generateFinancialReport('user_123', portfolioData);
    console.log('Report generated:', report.id);
    console.log('Total value:', report.summary.totalValue);

    // View tracing diagnostics
    const diagnostics = agent.getTracingDiagnostics();
    console.log('Cosmos DB Metrics:', diagnostics.cosmosDbMetrics);
    console.log('Recommendations:', diagnostics.cosmosDbRecommendations);
  } catch (error) {
    logger.error('Report generation failed', error instanceof Error ? error : new Error(String(error)), {
      userId: 'user_123'
    });
  }
}

/**
 * Example 4: Error Handling with Tracing
 */
export async function exampleErrorHandling() {
  console.log('\n=== Example 4: Error Handling ===');

  try {
    await tracer.trace('riskyOperation', async (span) => {
      tracer.addEvent(span, 'step_1', { status: 'starting' });

      // Simulate an error
      throw new Error('Something went wrong during processing');
    });
  } catch (error) {
    // Comprehensive error logging
    logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)), {
      userId: 'user_123',
      operation: 'riskyOperation',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Example 5: Sensitive Data Protection
 */
export async function exampleSensitiveDataProtection() {
  console.log('\n=== Example 5: Sensitive Data Protection ===');

  // This data will have sensitive fields automatically redacted
  const userData = {
    userId: 'user_123',
    email: 'user@example.com',
    password: 'secret_password_123', // Will be redacted
    apiKey: 'api_key_xyz', // Will be redacted
    authToken: 'auth_token_abc', // Will be redacted
    creditCard: '4111-1111-1111-1111' // Will be redacted
  };

  logger.info('User login attempt', userData);
  console.log('Check logs above - sensitive fields should be [REDACTED]');
}

/**
 * Example 6: Cosmos DB Metrics
 */
export async function exampleCosmosDBMetrics() {
  console.log('\n=== Example 6: Cosmos DB Metrics ===');

  // Simulate some Cosmos DB operations
  for (let i = 0; i < 5; i++) {
    cosmosDbTracer.trackOperation({
      operationType: 'create',
      duration: Math.random() * 100,
      statusCode: 201,
      requestCharge: Math.random() * 10,
      itemCount: 1,
      documentId: `doc_${i}`,
      partitionKey: `user_${Math.floor(Math.random() * 3)}` // 3 partitions
    });
  }

  // Get metrics
  const metrics = cosmosDbTracer.getMetrics();
  console.log('Total Operations:', metrics.totalOperations);
  console.log('Total RUs:', metrics.totalRUsConsumed.toFixed(2));
  console.log('Average Latency:', metrics.averageOperationLatency.toFixed(2), 'ms');

  // Get recommendations
  const recommendations = cosmosDbTracer.getOptimizationRecommendations();
  console.log('Recommendations:', recommendations);

  // Export metrics
  const exported = cosmosDbTracer.exportMetrics();
  console.log('Exported Metrics:', JSON.stringify(exported, null, 2));
}

/**
 * Example 7: Portfolio Risk Analysis with Full Tracing
 */
export async function exampleRiskAnalysis() {
  console.log('\n=== Example 7: Risk Analysis ===');

  const agent = new FinancialIntelligenceAgent();

  const positions = [
    { id: 'pos1', type: 'equity' as const, balance: 70000 },
    { id: 'pos2', type: 'bond' as const, balance: 20000 },
    { id: 'pos3', type: 'cash' as const, balance: 10000 }
  ];

  const analysis = await agent.analyzePortfolioRisk(positions);
  console.log('Risk Analysis:', analysis);
}

/**
 * Example 8: Sampling and Filtering
 */
export async function exampleSamplingFiltering() {
  console.log('\n=== Example 8: Sampling and Filtering ===');

  // Set environment variables for sampling
  process.env.LOG_LEVEL = 'info';
  process.env.LOG_SAMPLE_RATE = '0.5'; // Log 50% of events

  // These log entries will be sampled (50% chance of being logged)
  for (let i = 0; i < 10; i++) {
    logger.debug(`Sampled log entry ${i}`, { index: i });
  }

  console.log('Notice: Not all debug entries are logged due to sampling');
}

/**
 * Example 9: Async Operation Context Propagation
 */
export async function exampleAsyncContextPropagation() {
  console.log('\n=== Example 9: Async Context Propagation ===');

  const context = createTraceContext('user_123', 'session_456');

  // Execute multiple async operations in parallel, all sharing the same context
  await setTraceContextAsync(context, async () => {
    const task1 = tracer.trace('task1', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'task1_result';
    });

    const task2 = tracer.trace('task2', async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      return 'task2_result';
    });

    const task3 = tracer.trace('task3', async () => {
      await new Promise(resolve => setTimeout(resolve, 80));
      return 'task3_result';
    });

    const results = await Promise.all([task1, task2, task3]);
    console.log('All tasks completed:', results);
  });
}

/**
 * Example 10: Diagnostics and Monitoring
 */
export async function exampleDiagnosticsMonitoring() {
  console.log('\n=== Example 10: Diagnostics & Monitoring ===');

  // Simulate some operations
  await tracer.trace('operation1', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  await tracer.trace('operation2', async () => {
    await new Promise(resolve => setTimeout(resolve, 75));
  });

  // Get span summary
  const summary = tracer.getTraceSummary();
  console.log('Active Spans:', summary.activeSpanCount);
  console.log('Total Spans Processed:', summary.totalSpansProcessed);

  // Simulate Cosmos DB operations for metrics
  cosmosDbTracer.trackOperation({
    operationType: 'query',
    duration: 150,
    statusCode: 200,
    requestCharge: 2.5,
    query: 'SELECT * FROM c WHERE c.userId = @userId'
  });

  const dbMetrics = cosmosDbTracer.getMetrics();
  console.log('Database Operations:', dbMetrics.totalOperations);
  console.log('Total RUs Consumed:', dbMetrics.totalRUsConsumed);
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  try {
    await exampleBasicTracing();
    await exampleContextPropagation();
    await exampleFinancialReporting();
    await exampleErrorHandling();
    await exampleSensitiveDataProtection();
    await exampleCosmosDBMetrics();
    await exampleRiskAnalysis();
    await exampleSamplingFiltering();
    await exampleAsyncContextPropagation();
    await exampleDiagnosticsMonitoring();

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export individual examples for selective testing
export default {
  exampleBasicTracing,
  exampleContextPropagation,
  exampleFinancialReporting,
  exampleErrorHandling,
  exampleSensitiveDataProtection,
  exampleCosmosDBMetrics,
  exampleRiskAnalysis,
  exampleSamplingFiltering,
  exampleAsyncContextPropagation,
  exampleDiagnosticsMonitoring,
  runAllExamples
};