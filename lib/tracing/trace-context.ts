/**
 * Trace Context Management
 * Handles context propagation through async operations
 */

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  userId?: string;
  sessionId?: string;
  correlationId: string;
  timestamp: number;
  environment: string;
}

export interface TraceEvent {
  name: string;
  timestamp: number;
  duration?: number;
  attributes: Record<string, any>;
  status?: 'success' | 'error' | 'pending';
}

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  events: TraceEvent[];
  status: 'success' | 'error' | 'pending';
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

// AsyncLocalStorage for context propagation (Node.js 13.10+)
import { AsyncLocalStorage } from 'async_hooks';

const traceContextStorage = new AsyncLocalStorage<TraceContext>();

export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function generateSpanId(): string {
  return `span_${Math.random().toString(36).substring(2, 15)}`;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function createTraceContext(
  userId?: string,
  sessionId?: string,
  parentContext?: TraceContext
): TraceContext {
  return {
    traceId: parentContext?.traceId || generateTraceId(),
    spanId: generateSpanId(),
    parentSpanId: parentContext?.spanId,
    userId,
    sessionId,
    correlationId: parentContext?.correlationId || generateCorrelationId(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  };
}

export function getTraceContext(): TraceContext | undefined {
  return traceContextStorage.getStore();
}

export function setTraceContext<T>(context: TraceContext, fn: () => T): T {
  return traceContextStorage.run(context, fn);
}

export async function setTraceContextAsync<T>(
  context: TraceContext,
  fn: () => Promise<T>
): Promise<T> {
  return traceContextStorage.run(context, fn);
}

export function getCurrentContextOrCreate(userId?: string, sessionId?: string): TraceContext {
  const existing = getTraceContext();
  if (existing) {
    return existing;
  }
  return createTraceContext(userId, sessionId);
}