import { cn } from '@/lib/utils'

describe('cn utility function', () => {
    test('cn function merges classes', () => {
        const result = cn('class1', 'class2', 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    test('cn handles empty inputs', () => {
        const result = cn()
        expect(result).toBe('')
    })

    test('cn handles conditional classes', () => {
        const result = cn('base-class', false && 'conditional-class', 'always-present')
        expect(result).toBe('base-class always-present')
    })

    test('cn handles undefined and null values', () => {
        const result = cn('class1', null, undefined, 'class2')
        expect(result).toBe('class1 class2')
    })

    test('cn merges Tailwind classes correctly', () => {
        // twMerge should handle conflicting Tailwind classes
        const result = cn('px-2 py-1', 'px-4')
        expect(result).toBe('py-1 px-4')
    })

    test('cn handles array of classes', () => {
        const result = cn(['class1', 'class2'], 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    test('cn handles object with conditional classes', () => {
        const result = cn({
            'class1': true,
            'class2': false,
            'class3': true
        })
        expect(result).toBe('class1 class3')
    })
})

describe('formatNumber utility function', () => {
    test('formats number with default options', () => {
        const result = formatNumber(1234.5678)
        expect(result).toBe('1,234.6')
    })

    test('formats number with custom maximumFractionDigits', () => {
        const result = formatNumber(1234.5678, { maximumFractionDigits: 0 })
        expect(result).toBe('1,235')
    })

    test('formats number with custom maximumFractionDigits set to 2', () => {
        const result = formatNumber(1234.5678, { maximumFractionDigits: 2 })
        expect(result).toBe('1,234.57')
    })

    test('formats zero correctly', () => {
        const result = formatNumber(0)
        expect(result).toBe('0')
    })

    test('formats negative numbers correctly', () => {
        const result = formatNumber(-1234.567)
        expect(result).toBe('-1,234.6')
    })

    test('formats very large numbers correctly', () => {
        const result = formatNumber(1258000000, { maximumFractionDigits: 0 })
        expect(result).toBe('1,258,000,000')
    })

    test('handles very small decimal numbers', () => {
        const result = formatNumber(0.0001, { maximumFractionDigits: 4 })
        expect(result).toBe('0.0001')
    })

    test('respects signDisplay option', () => {
        const result = formatNumber(123, { signDisplay: 'always' })
        expect(result).toContain('+')
    })
})

describe('formatCurrency utility function', () => {
    test('formats USD currency with default compact notation', () => {
        const result = formatCurrency(1258000000)
        expect(result).toBe('$1.3B')
    })

    test('formats currency with custom currency code', () => {
        const result = formatCurrency(1000, 'EUR')
        expect(result).toBe('€1.0K')
    })

    test('formats small currency amounts', () => {
        const result = formatCurrency(123.45, 'USD', { notation: 'standard' })
        expect(result).toBe('$123.4')
    })

    test('formats negative currency amounts', () => {
        const result = formatCurrency(-500000)
        expect(result).toBe('-$500.0K')
    })

    test('formats zero currency', () => {
        const result = formatCurrency(0)
        expect(result).toBe('$0.0')
    })

    test('respects maximumFractionDigits override', () => {
        const result = formatCurrency(1234567, 'USD', { maximumFractionDigits: 2 })
        expect(result).toBe('$1.23M')
    })

    test('handles very large amounts with compact notation', () => {
        const result = formatCurrency(68000000)
        expect(result).toBe('$68.0M')
    })

    test('formats with signDisplay always', () => {
        const result = formatCurrency(1000, 'USD', { signDisplay: 'always', notation: 'standard' })
        expect(result).toContain('+')
    })

    test('formats trillion amounts', () => {
        const result = formatCurrency(1500000000000)
        expect(result).toBe('$1.5T')
    })

    test('handles non-compact notation', () => {
        const result = formatCurrency(1234.56, 'USD', { notation: 'standard', maximumFractionDigits: 2, minimumFractionDigits: 2 })
        expect(result).toBe('$1,234.56')
    })
})

describe('formatPercent utility function', () => {
    test('formats decimal as percentage', () => {
        const result = formatPercent(0.057)
        expect(result).toBe('5.7%')
    })

    test('formats zero percent', () => {
        const result = formatPercent(0)
        expect(result).toBe('0%')
    })

    test('formats negative percentage', () => {
        const result = formatPercent(-0.111)
        expect(result).toBe('-11.1%')
    })

    test('formats 100% correctly', () => {
        const result = formatPercent(1)
        expect(result).toBe('100%')
    })

    test('respects maximumFractionDigits', () => {
        const result = formatPercent(0.1234, { maximumFractionDigits: 0 })
        expect(result).toBe('12%')
    })

    test('respects signDisplay always', () => {
        const result = formatPercent(0.05, { signDisplay: 'always' })
        expect(result).toContain('+')
    })

    test('formats very small percentages', () => {
        const result = formatPercent(0.001, { maximumFractionDigits: 2 })
        expect(result).toBe('0.1%')
    })

    test('formats large percentages over 100%', () => {
        const result = formatPercent(2.5, { maximumFractionDigits: 1 })
        expect(result).toBe('250%')
    })

    test('handles high precision with custom digits', () => {
        const result = formatPercent(0.12345, { maximumFractionDigits: 3 })
        expect(result).toBe('12.345%')
    })
})

describe('formatDelta utility function', () => {
    test('formats positive delta', () => {
        const result = formatDelta(123.456)
        expect(result).toBe('123.5')
    })

    test('formats negative delta', () => {
        const result = formatDelta(-123.456)
        expect(result).toBe('-123.5')
    })

    test('formats zero delta', () => {
        const result = formatDelta(0)
        expect(result).toBe('0')
    })

    test('formats very large delta', () => {
        const result = formatDelta(1000000)
        expect(result).toBe('1,000,000')
    })

    test('formats very small delta', () => {
        const result = formatDelta(0.123)
        expect(result).toBe('0.1')
    })
})

describe('formatDateTime utility function', () => {
    test('formats ISO date string', () => {
        const result = formatDateTime('2024-12-31T10:30:00Z')
        expect(result).toContain('Dec')
        expect(result).toContain('31')
        expect(result).toContain('2024')
    })

    test('formats date with time', () => {
        const result = formatDateTime('2025-01-04T09:00:00Z')
        expect(result).toMatch(/\d{1,2}:\d{2}/)
    })

    test('handles different date formats', () => {
        const result = formatDateTime('2024-12-28T10:00:00Z')
        expect(result).toContain('Dec')
        expect(result).toContain('28')
    })

    test('formats midnight time', () => {
        const result = formatDateTime('2024-01-01T00:00:00Z')
        expect(result).toContain('Jan')
        expect(result).toContain('1')
        expect(result).toContain('2024')
    })

    test('formats noon time', () => {
        const result = formatDateTime('2024-06-15T12:00:00Z')
        expect(result).toContain('Jun')
        expect(result).toContain('15')
    })
})