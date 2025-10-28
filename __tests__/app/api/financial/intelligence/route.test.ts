import { GET } from '@/app/api/financial/intelligence/route';
import { financialIntelligence } from '@/lib/data/financial-intelligence';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      headers: new Headers(options?.headers || {}),
      status: 200,
      ok: true,
    })),
  },
}));

describe('GET /api/financial/intelligence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns financial intelligence data', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data).toEqual(financialIntelligence);
  });

  test('returns data with proper structure', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data).toHaveProperty('asOf');
    expect(data).toHaveProperty('baseCurrency');
    expect(data).toHaveProperty('metrics');
    expect(data).toHaveProperty('growth');
    expect(data).toHaveProperty('risk');
    expect(data).toHaveProperty('insights');
    expect(data).toHaveProperty('marketIndicators');
    expect(data).toHaveProperty('dataSources');
    expect(data).toHaveProperty('generatedAt');
  });

  test('includes cache control headers', async () => {
    await GET();
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      financialIntelligence,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        }),
      })
    );
  });

  test('response has correct cache control values', async () => {
    await GET();
    
    const callArgs = (NextResponse.json as jest.Mock).mock.calls[0];
    expect(callArgs[1].headers['Cache-Control']).toContain('s-maxage=300');
    expect(callArgs[1].headers['Cache-Control']).toContain('stale-while-revalidate=600');
  });

  test('returns metrics array', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(Array.isArray(data.metrics)).toBe(true);
    expect(data.metrics.length).toBeGreaterThan(0);
  });

  test('returns insights array', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(Array.isArray(data.insights)).toBe(true);
    expect(data.insights.length).toBeGreaterThan(0);
  });

  test('returns market indicators array', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(Array.isArray(data.marketIndicators)).toBe(true);
    expect(data.marketIndicators.length).toBeGreaterThan(0);
  });

  test('data contains valid date strings', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});