# Distributed Tracing Implementation

Comprehensive tracing system for ABACO Financial Intelligence Platform with support for context propagation, Cosmos DB operation tracking, and security-aware logging.

## Overview

This tracing implementation provides:

- **Distributed Tracing**: Track operations across async boundaries using trace and span IDs
- **Structured Logging**: JSON-formatted logs with automatic sensitive data sanitization
- **Context Propagation**: Maintain trace context through async operations using AsyncLocalStorage
- **Azure Cosmos DB Monitoring**: Track operations, request units, partition key usage, and hot partitions
- **Performance Metrics**: Measure operation latencies and identify bottlenecks
- **Error Tracking**: Comprehensive error logging with stack traces and error codes
- **Security**: Automatic redaction of sensitive data in logs

## Architecture

### Components

```
├── trace-context.ts        # Context management & propagation
├── structured-logger.ts    # JSON logging with sanitization
├── tracer.ts              # Distributed tracing & spans
├── cosmos-db-tracer.ts    # Cosmos DB operation tracking
└── README.md              # This file
```

## Usage

### Basic Tracing

```typescript
import { tracer } from '@/lib/tracing/tracer';
import { logger } from '@/lib/tracing/structured-logger';

// Trace an async operation
const result = await tracer.trace('myOperation', async (span) => {
  tracer.addEvent(span, 'processing_started', { itemCount: 100 });
  
  // Do work...
  const data = await processData();
  
  tracer.addEvent(span, 'processing_completed', { result: data });
  return data;
});

// Log with context
logger.info('Operation completed', { userId: 'user123', result });
```

### Tracing Financial Operations

```typescript
import { FinancialIntelligenceAgent } from '@/lib/agents/financial-intelligence-agent';

const agent = new FinancialIntelligenceAgent();

// Automatically traced with full context propagation
const report = await agent.generateFinancialReport(userId, portfolioData);

// Access tracing diagnostics
const diagnostics = agent.getTracingDiagnostics();
console.log(diagnostics.cosmosDbRecommendations);
```

### Context Propagation

```typescript
import { 
  createTraceContext, 
  setTraceContextAsync,
  getTraceContext 
} from '@/lib/tracing/trace-context';

// Create context for a user session
const context = createTraceContext(userId, sessionId);

// Execute code within this context
await setTraceContextAsync(context, async () => {
  // All operations within this block share the same trace context
  const currentContext = getTraceContext();
  console.log(currentContext.traceId); // Same for all nested operations
});
```

### Cosmos DB Operation Tracking

```typescript
import { cosmosDbTracer } from '@/lib/tracing/cosmos-db-tracer';

// Operations are automatically tracked, but you can check metrics
const metrics = cosmosDbTracer.getMetrics();
console.log(`Total RUs consumed: ${metrics.totalRUsConsumed}`);

// Get optimization recommendations
const recommendations = cosmosDbTracer.getOptimizationRecommendations();
recommendations.forEach(rec => console.log(rec));

// Export metrics for monitoring systems
const exported = cosmosDbTracer.exportMetrics();
```

## Structured Logging

### Log Levels

Logs are emitted at different levels:
- `debug`: Detailed diagnostic information
- `info`: General informational messages
- `warn`: Warning conditions
- `error`: Error conditions with stack traces

### Sensitive Data Protection

Sensitive data is automatically redacted. Protected keys include:
- password, token, secret, apiKey, key
- authorization, auth, ssn, creditCard

```typescript
logger.info('User login', {
  userId: 'user123',
  password: 'secret123', // Will be logged as '[REDACTED]'
  sessionToken: 'token123' // Will be logged as '[REDACTED]'
});
```

### Log Entry Structure

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "Operation completed",
  "traceId": "trace_1705316445123_abc123",
  "spanId": "span_xyz789",
  "correlationId": "corr_1705316445123_def456",
  "userId": "user123",
  "sessionId": "session456",
  "context": {
    "operationName": "generateReport",
    "duration": 250
  },
  "environment": "production",
  "service": "abaco-financial-intelligence"
}
```

## Cosmos DB Tracing

### Operation Tracking

All database operations are automatically tracked:

```typescript
{
  operationType: 'create' | 'read' | 'update' | 'delete' | 'query' | 'upsert',
  duration: number,           // milliseconds
  statusCode: number,
  requestCharge: number,      // RUs consumed
  itemCount?: number,
  documentId?: string,
  partitionKey: string,
  retryCount?: number,
  error?: { code, message }
}
```

### Hot Partition Detection

The system automatically detects unbalanced partitions:

```typescript
// A partition is considered "hot" if it:
// - Consumes > 30% of total RUs
// - Represents < 5% of total operations
// - Indicates uneven distribution

const metrics = cosmosDbTracer.getMetrics();
for (const [key, metric] of metrics.partitionKeyMetrics) {
  if (metric.isHot) {
    console.warn(`Hot partition detected: ${key}`);
  }
}
```

### Optimization Recommendations

Get actionable recommendations:

```typescript
const recommendations = cosmosDbTracer.getOptimizationRecommendations();
// Returns suggestions for:
// - Repartitioning strategies
// - Slow query optimization
// - Error rate analysis
// - RU consumption review
```

## Express/Next.js Middleware

```typescript
import express from 'express';
import { tracer } from '@/lib/tracing/tracer';

const app = express();

// Add tracing middleware
app.use(tracer.middleware());

// Traces all HTTP requests automatically
```

## Configuration

### Environment Variables

```bash
# Logging
LOG_LEVEL=info                    # debug|info|warn|error (default: info)
LOG_SAMPLE_RATE=1                # 0-1, sampling rate (default: 1)

# Tracing
TRACE_ENABLED=true               # Enable distributed tracing
ENABLE_REMOTE_LOGGING=false      # Send logs to remote endpoint
REMOTE_LOG_ENDPOINT=http://...   # Remote logging endpoint

# Cosmos DB
COSMOS_DB_ENDPOINT=https://...
COSMOS_DB_KEY=...
COSMOS_DB_DATABASE=abaco-financial
COSMOS_DB_CONTAINER=financial-intelligence
```

### Logger Configuration

```typescript
import { StructuredLogger } from '@/lib/tracing/structured-logger';

const customLogger = new StructuredLogger({
  service: 'my-service',
  enableConsole: true,
  minimumLevel: 'info',
  sampleRate: 0.5,              // Log 50% of events
  sanitizeSensitiveData: true,
  remoteEndpoint: 'http://...'
});
```

## Best Practices

### 1. Use Meaningful Operation Names

```typescript
// ✅ Good
await tracer.trace('processUserPortfolio', async (span) => { ... });

// ❌ Avoid
await tracer.trace('process', async (span) => { ... });
```

### 2. Add Rich Metadata

```typescript
// ✅ Good
tracer.addEvent(span, 'report_generation', {
  reportId: 'report_123',
  portfolioSize: 100,
  duration: 250,
  status: 'success'
});

// ❌ Avoid
tracer.addEvent(span, 'done', {});
```

### 3. Always Log Errors with Context

```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error, {
    userId,
    operationName: 'generateReport',
    duration
  });
  throw error;
}
```

### 4. Propagate Context in Async Operations

```typescript
// ✅ Good
const context = getTraceContext();
await Promise.all([
  setTraceContextAsync(context, () => task1()),
  setTraceContextAsync(context, () => task2())
]);

// ❌ Avoid - loses trace context
await Promise.all([task1(), task2()]);
```

### 5. Monitor Performance Metrics

```typescript
// ✅ Good - periodically export metrics
setInterval(() => {
  const metrics = cosmosDbTracer.exportMetrics();
  sendToMonitoringSystem(metrics);
}, 60000);
```

## Debugging

### View Active Spans

```typescript
const summary = tracer.getTraceSummary();
console.log(`Active spans: ${summary.activeSpanCount}`);
```

### Get Recent Operations

```typescript
const recent = cosmosDbTracer.getRecentOperations(10);
recent.forEach(op => {
  console.log(`${op.operationType}: ${op.duration}ms (${op.requestCharge} RU)`);
});
```

### Export Metrics for Analysis

```typescript
const metrics = cosmosDbTracer.exportMetrics();
fs.writeFileSync('metrics.json', JSON.stringify(metrics, null, 2));
```

## Performance Considerations

### Sampling

For high-traffic applications, use sampling to reduce log volume:

```typescript
const logger = new StructuredLogger({
  sampleRate: 0.1  // Log 10% of events
});
```

### Sensitive Data Redaction

Automatic redaction has minimal overhead but can be disabled:

```typescript
const logger = new StructuredLogger({
  sanitizeSensitiveData: false  // Use only if certain data is safe
});
```

### Remote Logging

Remote logging is async and non-blocking:

```typescript
const logger = new StructuredLogger({
  enableRemote: true,
  remoteEndpoint: 'http://logs.example.com/api/logs'
});
// Failures are logged but don't affect application
```

## Integration with Monitoring Systems

### Prometheus

```typescript
// Export metrics periodically
setInterval(() => {
  const metrics = cosmosDbTracer.exportMetrics();
  prometheus.gauge('cosmos_total_rus', metrics.summary.totalRUsConsumed);
  prometheus.gauge('cosmos_avg_latency', metrics.summary.averageLatency);
}, 60000);
```

### Application Insights

```typescript
const exported = cosmosDbTracer.exportMetrics();
appInsights.trackEvent('cosmosDbMetrics', exported);
```

### Datadog

```typescript
const metrics = cosmosDbTracer.getMetrics();
datadog.sendDistribution('cosmos.rus.consumed', metrics.totalRUsConsumed);
datadog.sendDistribution('cosmos.operation.latency', metrics.averageOperationLatency);
```

## Troubleshooting

### Missing Trace Context

If trace context is not propagating:

1. Ensure using `setTraceContextAsync` for async operations
2. Check that middleware is properly installed
3. Verify AsyncLocalStorage is available (Node.js 13.10+)

### High Log Volume

If log volume is too high:

1. Reduce `LOG_SAMPLE_RATE`
2. Increase `LOG_LEVEL` to 'warn'
3. Filter specific operations using custom logger

### Hot Partitions Detected

If hot partitions are causing performance issues:

1. Review partition key distribution
2. Consider composite partition keys
3. Follow cosmosDbTracer recommendations

## Security & Compliance

- **Data Sanitization**: Automatic redaction of sensitive fields
- **Access Control**: Implement access controls at the monitoring system level
- **Retention**: Configure log retention per compliance requirements
- **Encryption**: Use HTTPS for remote logging endpoints
- **Audit Trail**: All operations include userId for accountability

## See Also

- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [OpenTelemetry Standards](https://opentelemetry.io/)
- [Structured Logging Best Practices](https://kartar.net/2015/12/structured-logging/)