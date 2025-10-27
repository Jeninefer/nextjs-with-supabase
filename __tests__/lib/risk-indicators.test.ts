import {
    getRiskIndicator,
    getRiskLevel,
    RISK_INDICATOR_HIGH,
    RISK_INDICATOR_LOW,
    RISK_INDICATOR_MEDIUM,
    type RiskLevel
} from '@/lib/risk-indicators'

describe('Risk Indicator Functions', () => {
    describe('getRiskIndicator', () => {
        test('getRiskIndicator returns correct emoji', () => {
            // Test low risk (< 30)
            expect(getRiskIndicator(15)).toBe(RISK_INDICATOR_LOW)
            expect(getRiskIndicator(29)).toBe(RISK_INDICATOR_LOW)

            // Test medium risk (30-59)
            expect(getRiskIndicator(30)).toBe(RISK_INDICATOR_MEDIUM)
            expect(getRiskIndicator(45)).toBe(RISK_INDICATOR_MEDIUM)
            expect(getRiskIndicator(59)).toBe(RISK_INDICATOR_MEDIUM)

            // Test high risk (>= 60)
            expect(getRiskIndicator(60)).toBe(RISK_INDICATOR_HIGH)
            expect(getRiskIndicator(90)).toBe(RISK_INDICATOR_HIGH)
        })

        test('risk functions handle edge values', () => {
            // Test exact threshold values
            expect(getRiskIndicator(29.9)).toBe(RISK_INDICATOR_LOW)
            expect(getRiskIndicator(30)).toBe(RISK_INDICATOR_MEDIUM)
            expect(getRiskIndicator(59.9)).toBe(RISK_INDICATOR_MEDIUM)
            expect(getRiskIndicator(60)).toBe(RISK_INDICATOR_HIGH)
        })

        test('risk functions handle negative values', () => {
            // Negative values should be treated as low risk
            expect(getRiskIndicator(-5)).toBe(RISK_INDICATOR_LOW)
            expect(getRiskIndicator(-100)).toBe(RISK_INDICATOR_LOW)
        })

        test('getRiskIndicator handles zero', () => {
            expect(getRiskIndicator(0)).toBe(RISK_INDICATOR_LOW)
        })

        test('getRiskIndicator handles large numbers', () => {
            expect(getRiskIndicator(1000)).toBe(RISK_INDICATOR_HIGH)
            expect(getRiskIndicator(Number.MAX_VALUE)).toBe(RISK_INDICATOR_HIGH)
        })
    })

    describe('getRiskLevel', () => {
        test('getRiskLevel returns correct level', () => {
            // Test low risk (< 30)
            expect(getRiskLevel(15)).toBe('low')
            expect(getRiskLevel(29)).toBe('low')

            // Test medium risk (30-59)
            expect(getRiskLevel(30)).toBe('medium')
            expect(getRiskLevel(45)).toBe('medium')
            expect(getRiskLevel(59)).toBe('medium')

            // Test high risk (>= 60)
            expect(getRiskLevel(60)).toBe('high')
            expect(getRiskLevel(90)).toBe('high')
        })

        test('getRiskLevel handles edge values', () => {
            // Test exact threshold values
            expect(getRiskLevel(29.9)).toBe('low')
            expect(getRiskLevel(30)).toBe('medium')
            expect(getRiskLevel(59.9)).toBe('medium')
            expect(getRiskLevel(60)).toBe('high')
        })

        test('getRiskLevel handles negative values', () => {
            // Negative values should be treated as low risk
            expect(getRiskLevel(-5)).toBe('low')
            expect(getRiskLevel(-100)).toBe('low')
        })

        test('getRiskLevel returns correct TypeScript types', () => {
            const lowRisk: RiskLevel = getRiskLevel(15)
            const mediumRisk: RiskLevel = getRiskLevel(45)
            const highRisk: RiskLevel = getRiskLevel(75)

            expect(lowRisk).toBe('low')
            expect(mediumRisk).toBe('medium')
            expect(highRisk).toBe('high')
        })
    })

    describe('Constants', () => {
        test('Risk indicator constants are defined correctly', () => {
            expect(RISK_INDICATOR_LOW).toBe('🟢')
            expect(RISK_INDICATOR_MEDIUM).toBe('🟡')
            expect(RISK_INDICATOR_HIGH).toBe('🔴')
        })
    })
})