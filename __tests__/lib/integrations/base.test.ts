import { jest } from '@jest/globals'
import { Integration, IntegrationError, RateLimitError, TimeoutError } from '@/lib/integrations'

class TestIntegration extends Integration {
  public async run<T>(fn: () => Promise<T>): Promise<T> {
    return this.executeWithRateLimit(fn)
  }
}

describe('Integration', () => {
  let randomSpy: jest.SpyInstance<number, []>

  beforeEach(() => {
    jest.useFakeTimers()
    randomSpy = jest.spyOn(global.Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    jest.useRealTimers()
    randomSpy.mockRestore()
  })

  it('executes the provided function within the rate limit', async () => {
    const integration = new TestIntegration({ rateLimitPerMinute: 2, retryAttempts: 1, timeoutMs: 100 })
    const fn = jest.fn().mockResolvedValue('success')

    const promise = integration.run(fn)

    await jest.runAllTimersAsync()

    await expect(promise).resolves.toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws a RateLimitError when the limit is exceeded', async () => {
    const integration = new TestIntegration({ rateLimitPerMinute: 1, retryAttempts: 1, timeoutMs: 100 })
    const fn = jest.fn().mockResolvedValue('success')

    await integration.run(fn)

    await expect(integration.run(fn)).rejects.toBeInstanceOf(RateLimitError)
  })

  it('resets the rate limit counter after one minute', async () => {
    const integration = new TestIntegration({ rateLimitPerMinute: 1, retryAttempts: 1, timeoutMs: 100 })
    const fn = jest.fn().mockResolvedValue('success')

    await integration.run(fn)

    await jest.advanceTimersByTimeAsync(60_001)

    await expect(integration.run(fn)).resolves.toBe('success')
  })

  it('retries the function on failure with exponential backoff', async () => {
    const integration = new TestIntegration({ rateLimitPerMinute: 5, retryAttempts: 3, timeoutMs: 100 })
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockResolvedValue('success')

    const promise = integration.run(fn)

    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)

    await expect(promise).resolves.toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('rejects with TimeoutError when the function does not resolve in time', async () => {
    const integration = new TestIntegration({ rateLimitPerMinute: 5, retryAttempts: 1, timeoutMs: 100 })
    const fn = jest.fn().mockImplementation(() => new Promise(() => undefined))

    const promise = integration.run(fn)
    const expectation = expect(promise).rejects.toBeInstanceOf(TimeoutError)

    await jest.advanceTimersByTimeAsync(100)

    await expectation
  })
})
