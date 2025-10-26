/**
 * Distributed Tracing Service
 * Manages trace spans and provides decorator/middleware utilities
 */

import { logger } from './structured-logger';
import {
  TraceContext,
  TraceSpan,
  TraceEvent,
  getTraceContext,
  setTraceContextAsync,
  generateSpanId,
  createTraceContext
} from './trace-context';

export interface TracerConfig {
  serviceName: string;
  version: string;
  enableProfiling?: boolean;
}

export class Tracer {
  private config: TracerConfig;
  private activeSpans: Map<string, TraceSpan> = new Map();

  constructor(config: TracerConfig) {
    this.config = config;
  }

  /**
   * Start a new trace span
   */
  startSpan(operationName: string, attributes?: Record<string, any>): TraceSpan {
    const context = getTraceContext();
    const parentSpanId = context?.spanId;

    const span: TraceSpan = {
      spanId: generateSpanId(),
      traceId: context?.traceId || '',
      parentSpanId,
      operationName,
      startTime: Date.now(),
      attributes: attributes || {},
      events: [],
      status: 'pending'
    };

    this.activeSpans.set(span.spanId, span);

    logger.debug(`Span started: ${operationName}`, {
      spanId: span.spanId,
      traceId: span.traceId,
      parentSpanId: span.parentSpanId
    });

    return span;
  }

  /**
   * Add event to span
   */
  addEvent(span: TraceSpan, eventName: string, attributes?: Record<string, any>): void {
    const event: TraceEvent = {
      name: eventName,
      timestamp: Date.now(),
      attributes: attributes || {},
      status: 'success'
    };

    span.events.push(event);

    logger.debug(`Event added to span: ${eventName}`, {
      spanId: span.spanId,
      event: eventName,
      attributes
    });
  }

  /**
   * End a span with success or error
   */
  endSpan(span: TraceSpan, status: 'success' | 'error' = 'success', error?: Error): void {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    if (error) {
      span.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    this.activeSpans.delete(span.spanId);

    logger.info(`Span ended: ${span.operationName}`, {
      spanId: span.spanId,
      duration: span.duration,
      status,
      eventCount: span.events.length,
      error: span.error?.message
    });
  }

  /**
   * Execute function within a span
   */
  async trace<T>(
    operationName: string,
    fn: (span: TraceSpan) => Promise<T>,
    attributes?: Record<string, any>
  ): Promise<T> {
    const span = this.startSpan(operationName, attributes);
    const context = getTraceContext() || createTraceContext();

    try {
      return await setTraceContextAsync(context, async () => {
        const result = await fn(span);
        this.endSpan(span, 'success');
        return result;
      });
    } catch (error) {
      this.endSpan(span, 'error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Execute synchronous function within a span
   */
  traceSync<T>(
    operationName: string,
    fn: (span: TraceSpan) => T,
    attributes?: Record<string, any>
  ): T {
    const span = this.startSpan(operationName, attributes);

    try {
      const result = fn(span);
      this.endSpan(span, 'success');
      return result;
    } catch (error) {
      this.endSpan(span, 'error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get span by ID
   */
  getSpan(spanId: string): TraceSpan | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * Get all active spans
   */
  getActiveSpans(): TraceSpan[] {
    return Array.from(this.activeSpans.values());
  }

  /**
   * Create a function wrapper for automatic tracing
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    operationName?: string
  ): T {
    const name = operationName || fn.name || 'wrapped_async_function';
    return (async (...args: any[]) => {
      return this.trace(name, async () => fn(...args));
    }) as T;
  }

  /**
   * Create a middleware for Express/Next.js
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const context = createTraceContext(req.user?.id, req.cookies?.sessionId);

      setTraceContextAsync(context, async () => {
        const span = this.startSpan(`HTTP ${req.method} ${req.path}`);

        const startTime = Date.now();
        const originalSend = res.send;

        res.send = function (data: any) {
          const duration = Date.now() - startTime;
          span.duration = duration;
          span.status = res.statusCode < 400 ? 'success' : 'error';

          this.addEvent(span, 'http_response', {
            statusCode: res.statusCode,
            duration,
            contentLength: data?.length
          });

          this.endSpan(span);
          return originalSend.call(this, data);
        }.bind(this);

        next();
      });
    };
  }

  /**
   * Get trace summary for diagnostics
   */
  getTraceSummary(): {
    activeSpanCount: number;
    totalSpansProcessed: number;
    spans: TraceSpan[];
  } {
    return {
      activeSpanCount: this.activeSpans.size,
      totalSpansProcessed: this.activeSpans.size, // In production, track this separately
      spans: this.getActiveSpans()
    };
  }
}

// Export singleton instance
export const tracer = new Tracer({
  serviceName: 'abaco-financial-intelligence',
  version: '2.0.0',
  enableProfiling: process.env.NODE_ENV === 'development'
});