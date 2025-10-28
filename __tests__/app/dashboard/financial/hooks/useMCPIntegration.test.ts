import { renderHook, waitFor, act } from '@testing-library/react';

import { useMCPIntegration } from '@/app/dashboard/financial/hooks/useMCPIntegration';

describe('useMCPIntegration', () => {
  const originalEnv = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = originalEnv;
  });

  it('initializes all configured MCP servers on mount when configuration is valid', async () => {
    process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = 'test-key';
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const { result } = renderHook(() => useMCPIntegration());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(Array.from(result.current.servers).sort()).toEqual([
      'fetch',
      'memory',
      'perplexity-ask'
    ]);
  });

  it('skips servers with invalid environment variables while still initializing remaining ones', async () => {
    process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = '';
    jest.spyOn(Math, 'random').mockReturnValue(0.95);

    const { result } = renderHook(() => useMCPIntegration());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(result.current.servers.has('perplexity-ask')).toBe(false);
    expect(result.current.servers.has('fetch')).toBe(true);
    expect(result.current.servers.has('memory')).toBe(true);
  });

  it('provides helpers for storing and retrieving analysis results', async () => {
    process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = 'key';
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const { result } = renderHook(() => useMCPIntegration());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    let stored;
    await act(async () => {
      stored = await result.current.storeAnalysisResult('123', { value: 42 });
    });
    expect(stored).toEqual({ success: true, data: 'Stored analysis_123' });

    let retrieved;
    await act(async () => {
      retrieved = await result.current.getStoredAnalysis('123');
    });
    expect(retrieved).toEqual({ success: true, data: 'Retrieved analysis_123' });
  });
});
