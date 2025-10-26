/**
 * Structured Logging Service
 * JSON-formatted logging with optional sanitization and filtering
 */

import { getTraceContext } from './trace-context';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  traceId?: string;
  spanId?: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  environment: string;
  service: string;
}

export interface LoggerConfig {
  service: string;
  enableConsole?: boolean;
  enableRemote?: boolean;
  minimumLevel?: LogLevel;
  sampleRate?: number; // 0-1, default 1 (all logs)
  sanitizeSensitiveData?: boolean;
  remoteEndpoint?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey', 'key', 'authorization', 'auth', 'ssn', 'creditCard'];

export class StructuredLogger {
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig) {
    this.config = {
      service: config.service,
      enableConsole: config.enableConsole ?? true,
      enableRemote: config.enableRemote ?? false,
      minimumLevel: config.minimumLevel ?? 'debug',
      sampleRate: config.sampleRate ?? 1,
      sanitizeSensitiveData: config.sanitizeSensitiveData ?? true,
      remoteEndpoint: config.remoteEndpoint || ''
    };
  }

  /**
   * Sanitize sensitive data from objects
   */
  private sanitize(data: any, depth = 0): any {
    if (depth > 5) return '[Max depth reached]';
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item, idx) => (idx > 100 ? '[Truncated]' : this.sanitize(item, depth + 1)));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const isStandardKey = key.toLowerCase().includes(key);
      const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey));

      if (isSensitive && this.config.sanitizeSensitiveData) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = typeof value === 'object' ? this.sanitize(value, depth + 1) : value;
      }
    }
    return sanitized;
  }

  /**
   * Check if log should be created based on sampling
   */
  private shouldLog(): boolean {
    if (this.config.sampleRate >= 1) return true;
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const traceContext = getTraceContext();
    const sanitizedContext = context && this.config.sanitizeSensitiveData ? this.sanitize(context) : context;

    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      traceId: traceContext?.traceId,
      spanId: traceContext?.spanId,
      correlationId: traceContext?.correlationId,
      userId: traceContext?.userId,
      sessionId: traceContext?.sessionId,
      context: sanitizedContext,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : undefined,
      environment: process.env.NODE_ENV || 'development',
      service: this.config.service
    };
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog() || LOG_LEVELS['debug'] < LOG_LEVELS[this.config.minimumLevel]) {
      return;
    }
    this.output('debug', message, context);
  }

  /**
   * Log at info level
   */
  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog() || LOG_LEVELS['info'] < LOG_LEVELS[this.config.minimumLevel]) {
      return;
    }
    this.output('info', message, context);
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog() || LOG_LEVELS['warn'] < LOG_LEVELS[this.config.minimumLevel]) {
      return;
    }
    this.output('warn', message, context);
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog() || LOG_LEVELS['error'] < LOG_LEVELS[this.config.minimumLevel]) {
      return;
    }
    this.output('error', message, context, error);
  }

  /**
   * Internal output method
   */
  private output(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry = this.createLogEntry(level, message, context, error);

    if (this.config.enableConsole) {
      const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      consoleMethod(JSON.stringify(entry));
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendRemote(entry).catch(err => {
        console.error('Failed to send log to remote endpoint', err);
      });
    }
  }

  /**
   * Send log to remote endpoint
   */
  private async sendRemote(entry: LogEntry): Promise<void> {
    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        console.warn(`Remote logging returned status ${response.status}`);
      }
    } catch (err) {
      // Don't throw, as this is auxiliary functionality
      console.error('Remote logging failed', err);
    }
  }
}

// Export singleton instance
export const logger = new StructuredLogger({
  service: 'abaco-financial-intelligence',
  enableConsole: true,
  minimumLevel: process.env.LOG_LEVEL as LogLevel || 'info',
  sampleRate: parseFloat(process.env.LOG_SAMPLE_RATE || '1'),
  sanitizeSensitiveData: true
});