export interface IntegrationOptions {
  rateLimitPerMinute?: number
  retryAttempts?: number
  timeoutMs?: number
  logger?: Pick<Console, 'debug' | 'error' | 'warn'>
}

export class RateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
  }
}

export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Integration call timed out after ${timeoutMs}ms`)
    this.name = 'TimeoutError'
  }
}

export class IntegrationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'IntegrationError'
  }
}

export type IntegrationCall<T> = () => Promise<T>

export class Integration {
  private callCount = 0
  private lastResetTime = Date.now()
  private readonly rateLimitPerMinute: number
  private readonly retryAttempts: number
  private readonly timeoutMs: number
  private readonly logger?: Pick<Console, 'debug' | 'error' | 'warn'>

  constructor(options: IntegrationOptions = {}) {
    this.rateLimitPerMinute = options.rateLimitPerMinute ?? 100
    this.retryAttempts = options.retryAttempts ?? 3
    this.timeoutMs = options.timeoutMs ?? 5000
    this.logger = options.logger
  }

  protected async executeWithRateLimit<T>(fn: IntegrationCall<T>): Promise<T> {
    this.resetWindowIfRequired()

    if (this.callCount >= this.rateLimitPerMinute) {
      this.logger?.warn?.('Integration rate limit exceeded')
      throw new RateLimitError()
    }

    this.callCount += 1

    let lastError: unknown

    for (let attempt = 0; attempt < this.retryAttempts; attempt += 1) {
      try {
        const response = await this.executeWithTimeout(fn)
        return response
      } catch (error) {
        lastError = error
        const isLastAttempt = attempt === this.retryAttempts - 1

        if (error instanceof RateLimitError || error instanceof TimeoutError) {
          this.logger?.warn?.(`Integration attempt failed: ${error.message}`)
        } else {
          this.logger?.error?.('Integration execution error', error as Error)
        }

        if (isLastAttempt) {
          if (error instanceof IntegrationError || error instanceof TimeoutError) {
            throw error
          }
          break
        }

        const delay = this.getBackoffDelay(attempt)
        await this.delay(delay)
      }
    }

    throw new IntegrationError('Integration execution failed', lastError)
  }

  private async executeWithTimeout<T>(fn: IntegrationCall<T>): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new TimeoutError(this.timeoutMs))
      }, this.timeoutMs)
    })

    try {
      return await Promise.race([fn(), timeoutPromise])
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }
    }
  }

  private resetWindowIfRequired() {
    const now = Date.now()
    if (now - this.lastResetTime > 60_000) {
      this.callCount = 0
      this.lastResetTime = now
    }
  }

  private getBackoffDelay(attempt: number): number {
    const baseDelay = 1000
    const jitter = Math.floor(Math.random() * 100)
    return baseDelay * 2 ** attempt + jitter
  }

  private async delay(duration: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, duration))
  }
}
