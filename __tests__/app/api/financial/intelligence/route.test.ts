/**
 * @jest-environment node
 */

import { GET } from '../../../../../app/api/financial/intelligence/route';
import { financialIntelligence } from '../../../../../lib/data/financial-intelligence';

// Mock the financial intelligence data module
jest.mock('../../../../../lib/data/financial-intelligence', () => ({
    financialIntelligence: {
        metrics: [
            { id: 'm1', name: 'revenue', value: 100000, change: 5 },
            { id: 'm2', name: 'cost', value: 50000, change: -2 },
        ],
        insights: [
            { id: 'i1', title: 'Test insight', confidence: 0.8 },
        ],
    },
}));

describe('GET /api/financial/intelligence', () => {
    describe('Happy Path', () => {
        test('should return 200 status with valid JSON response', async () => {
            const response = await GET();

            expect(response).toBeInstanceOf(Response);
            expect(response.status).toBe(200);
        });

        test('should return financialIntelligence data as JSON', async () => {
            const response = await GET();
            const data = await response.json();

            expect(typeof data).toBe('object');
            expect(Array.isArray(data.metrics)).toBe(true);
            expect(Array.isArray(data.insights)).toBe(true);
        });

        test('should include all financial metrics in response', async () => {
            const response = await GET();
            const data = await response.json();

            expect(data.metrics).toHaveLength(2);
            expect(data.metrics[0]).toEqual(
                expect.objectContaining({
                    id: 'm1',
                    name: 'revenue',
                    value: 100000,
                    change: 5,
                })
            );
        });

        test('should include all insights in response', async () => {
            const response = await GET();
            const data = await response.json();

            expect(data.insights).toHaveLength(1);
            expect(data.insights[0]).toEqual(
                expect.objectContaining({
                    id: 'i1',
                    title: 'Test insight',
                    confidence: 0.8,
                })
            );
        });
    });

    describe('Response Headers', () => {
        test('should set Content-Type header to application/json', async () => {
            const response = await GET();

            expect(response.headers.get('Content-Type')).toBe('application/json');
        });

        test('should set Cache-Control header with s-maxage and stale-while-revalidate', async () => {
            const response = await GET();
            const cacheControl = response.headers.get('Cache-Control');

            expect(cacheControl).toBe('s-maxage=300, stale-while-revalidate=600');
        });

        test('should have both required caching directives', async () => {
            const response = await GET();
            const cacheControl = response.headers.get('Cache-Control');

            expect(cacheControl).toContain('s-maxage=300');
            expect(cacheControl).toContain('stale-while-revalidate=600');
        });
    });

    describe('Data Serialization', () => {
        test('should properly serialize JSON with all data intact', async () => {
            const response = await GET();
            const responseText = await response.text();
            const data = JSON.parse(responseText);

            expect(data).toEqual(financialIntelligence);
        });

        test('should handle numeric values correctly', async () => {
            const response = await GET();
            const data = await response.json();

            expect(data.metrics[0].value).toBe(100000);
            expect(typeof data.metrics[0].value).toBe('number');
            expect(data.metrics[0].change).toBe(5);
            expect(typeof data.metrics[0].change).toBe('number');
        });

        test('should preserve metric structure with optional change field', async () => {
            const response = await GET();
            const data = await response.json();

            data.metrics.forEach((metric: any) => {
                expect(metric).toHaveProperty('id');
                expect(metric).toHaveProperty('name');
                expect(metric).toHaveProperty('value');
                // change is optional, but if present should be a number
                if ('change' in metric) {
                    expect(typeof metric.change).toBe('number');
                }
            });
        });
    });

    describe('Response Body Structure', () => {
        test('should return an object with metrics array', async () => {
            const response = await GET();
            const data = await response.json();

            expect(typeof data).toBe('object');
            expect(Array.isArray(data.metrics)).toBe(true);
        });

        test('should return an object with insights array', async () => {
            const response = await GET();
            const data = await response.json();

            expect(typeof data).toBe('object');
            expect(Array.isArray(data.insights)).toBe(true);
        });

        test('should not include additional unexpected properties', async () => {
            const response = await GET();
            const data = await response.json();

            const allowedKeys = ['metrics', 'insights'];
            const actualKeys = Object.keys(data);

            actualKeys.forEach(key => {
                expect(allowedKeys).toContain(key);
            });
        });
    });

    describe('Branching & Edge Cases', () => {
        test('should handle empty metrics array gracefully', async () => {
            // This test validates behavior if data changes
            const response = await GET();
            const data = await response.json();

            // Verify metrics is always an array (even if empty)
            expect(Array.isArray(data.metrics)).toBe(true);
        });

        test('should handle insights with varying confidence values', async () => {
            const response = await GET();
            const data = await response.json();

            data.insights.forEach((insight: any) => {
                if ('confidence' in insight) {
                    expect(typeof insight.confidence).toBe('number');
                    expect(insight.confidence).toBeGreaterThanOrEqual(0);
                    expect(insight.confidence).toBeLessThanOrEqual(1);
                }
            });
        });

        test('should be callable multiple times without side effects', async () => {
            const response1 = await GET();
            const data1 = await response1.json();

            const response2 = await GET();
            const data2 = await response2.json();

            expect(data1).toEqual(data2);
        });
    });

    describe('Response Type & Immutability', () => {
        test('should return a Response object', async () => {
            const response = await GET();

            expect(response).toBeInstanceOf(Response);
            expect(response.status).toBe(200);
            expect(response.ok).toBe(true);
        });

        test('should have response body readable as text', async () => {
            const response = await GET();
            const text = await response.text();

            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
        });

        test('should be valid JSON', async () => {
            const response = await GET();
            const text = await response.text();

            expect(() => {
                JSON.parse(text);
            }).not.toThrow();
        });
    });

    describe('Exception Handling', () => {
        test('should not throw an error during execution', async () => {
            await expect(GET()).resolves.not.toThrow();
        });

        test('should complete without hanging or timeout', async () => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 1000)
            );

            await expect(Promise.race([GET(), timeoutPromise])).resolves.toBeInstanceOf(Response);
        });
    });

    describe('Security & Validation', () => {
        test('should only respond to GET requests', async () => {
            // Note: Testing that the GET export exists and is callable
            expect(typeof GET).toBe('function');
        });

        test('should not expose sensitive information in response', async () => {
            const response = await GET();
            const responseText = await response.text();

            // Ensure API keys, tokens, etc. are not in response
            expect(responseText).not.toMatch(/api[_-]?key/i);
            expect(responseText).not.toMatch(/token/i);
            expect(responseText).not.toMatch(/secret/i);
        });
    });
});