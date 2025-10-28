import { 
  financialIntelligence,
  type FinancialMetric,
  type GrowthPoint,
  type IntelligenceInsight,
  type MarketIndicator,
  type RiskExposure,
  type StressScenario,
  type FinancialIntelligenceDataset
} from '@/lib/data/financial-intelligence';

describe('Financial Intelligence Dataset Structure', () => {
  test('financialIntelligence object is defined', () => {
    expect(financialIntelligence).toBeDefined();
    expect(typeof financialIntelligence).toBe('object');
  });

  test('has required top-level properties', () => {
    expect(financialIntelligence).toHaveProperty('asOf');
    expect(financialIntelligence).toHaveProperty('baseCurrency');
    expect(financialIntelligence).toHaveProperty('metrics');
    expect(financialIntelligence).toHaveProperty('growth');
    expect(financialIntelligence).toHaveProperty('risk');
    expect(financialIntelligence).toHaveProperty('insights');
    expect(financialIntelligence).toHaveProperty('marketIndicators');
    expect(financialIntelligence).toHaveProperty('dataSources');
    expect(financialIntelligence).toHaveProperty('generatedAt');
  });

  test('asOf is a valid date string', () => {
    expect(financialIntelligence.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(financialIntelligence.asOf);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  test('baseCurrency is USD', () => {
    expect(financialIntelligence.baseCurrency).toBe('USD');
  });

  test('generatedAt is a valid ISO date string', () => {
    expect(financialIntelligence.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    const date = new Date(financialIntelligence.generatedAt);
    expect(date.toString()).not.toBe('Invalid Date');
  });
});

describe('Financial Metrics', () => {
  test('metrics is an array', () => {
    expect(Array.isArray(financialIntelligence.metrics)).toBe(true);
    expect(financialIntelligence.metrics.length).toBeGreaterThan(0);
  });

  test('each metric has required properties', () => {
    financialIntelligence.metrics.forEach((metric: FinancialMetric) => {
      expect(metric).toHaveProperty('id');
      expect(metric).toHaveProperty('label');
      expect(metric).toHaveProperty('value');
      expect(metric).toHaveProperty('currency');
      expect(metric).toHaveProperty('presentation');
      expect(metric).toHaveProperty('change');
      expect(metric).toHaveProperty('description');
    });
  });

  test('metric presentation types are valid', () => {
    const validPresentations = ['currency', 'count', 'percentage'];
    financialIntelligence.metrics.forEach((metric: FinancialMetric) => {
      expect(validPresentations).toContain(metric.presentation);
    });
  });

  test('metric change object is well-formed', () => {
    financialIntelligence.metrics.forEach((metric: FinancialMetric) => {
      expect(metric.change).toHaveProperty('absolute');
      expect(metric.change).toHaveProperty('percentage');
      expect(metric.change).toHaveProperty('period');
      expect(metric.change).toHaveProperty('direction');
      expect(['mom', 'qoq', 'yoy']).toContain(metric.change.period);
      expect(['up', 'down']).toContain(metric.change.direction);
      expect(typeof metric.change.absolute).toBe('number');
      expect(typeof metric.change.percentage).toBe('number');
    });
  });

  test('metric values are numeric and non-negative (where appropriate)', () => {
    financialIntelligence.metrics.forEach((metric: FinancialMetric) => {
      expect(typeof metric.value).toBe('number');
      expect(metric.value).toBeGreaterThanOrEqual(0);
    });
  });

  test('AUM metric exists with expected structure', () => {
    const aumMetric = financialIntelligence.metrics.find(m => m.id === 'aum');
    expect(aumMetric).toBeDefined();
    expect(aumMetric?.presentation).toBe('currency');
    expect(aumMetric?.value).toBeGreaterThan(0);
  });

  test('default rate metric exists and is a percentage', () => {
    const defaultRateMetric = financialIntelligence.metrics.find(m => m.id === 'default-rate');
    expect(defaultRateMetric).toBeDefined();
    expect(defaultRateMetric?.presentation).toBe('percentage');
    expect(defaultRateMetric?.value).toBeGreaterThanOrEqual(0);
    expect(defaultRateMetric?.value).toBeLessThanOrEqual(1);
  });
});

describe('Growth Data', () => {
  test('growth object has required properties', () => {
    expect(financialIntelligence.growth).toHaveProperty('compoundAnnualGrowth');
    expect(financialIntelligence.growth).toHaveProperty('trailingTwelveMonthNetNewAssets');
    expect(financialIntelligence.growth).toHaveProperty('yoyRevenueGrowth');
    expect(financialIntelligence.growth).toHaveProperty('series');
    expect(financialIntelligence.growth).toHaveProperty('comment');
  });

  test('growth rates are valid numbers', () => {
    expect(typeof financialIntelligence.growth.compoundAnnualGrowth).toBe('number');
    expect(typeof financialIntelligence.growth.trailingTwelveMonthNetNewAssets).toBe('number');
    expect(typeof financialIntelligence.growth.yoyRevenueGrowth).toBe('number');
  });

  test('growth series is an array of GrowthPoints', () => {
    expect(Array.isArray(financialIntelligence.growth.series)).toBe(true);
    expect(financialIntelligence.growth.series.length).toBeGreaterThan(0);
  });

  test('each growth point has required properties', () => {
    financialIntelligence.growth.series.forEach((point: GrowthPoint) => {
      expect(point).toHaveProperty('month');
      expect(point).toHaveProperty('nav');
      expect(point).toHaveProperty('netInflow');
      expect(point).toHaveProperty('retention');
      expect(typeof point.nav).toBe('number');
      expect(typeof point.netInflow).toBe('number');
      expect(typeof point.retention).toBe('number');
      expect(point.retention).toBeGreaterThanOrEqual(0);
      expect(point.retention).toBeLessThanOrEqual(1);
    });
  });

  test('growth series months are in chronological order', () => {
    const series = financialIntelligence.growth.series;
    for (let i = 1; i < series.length; i++) {
      const prevMonth = new Date(series[i - 1].month);
      const currMonth = new Date(series[i].month);
      expect(currMonth.getTime()).toBeGreaterThan(prevMonth.getTime());
    }
  });

  test('growth series has 12 months of data', () => {
    expect(financialIntelligence.growth.series.length).toBe(12);
  });

  test('NAV values are increasing over time', () => {
    const series = financialIntelligence.growth.series;
    for (let i = 1; i < series.length; i++) {
      expect(series[i].nav).toBeGreaterThanOrEqual(series[i - 1].nav);
    }
  });
});

describe('Risk Data', () => {
  test('risk object has required properties', () => {
    expect(financialIntelligence.risk).toHaveProperty('portfolioVaR95');
    expect(financialIntelligence.risk).toHaveProperty('expectedShortfall');
    expect(financialIntelligence.risk).toHaveProperty('defaultRate');
    expect(financialIntelligence.risk).toHaveProperty('riskAppetiteUtilization');
    expect(financialIntelligence.risk).toHaveProperty('exposures');
    expect(financialIntelligence.risk).toHaveProperty('stressTests');
    expect(financialIntelligence.risk).toHaveProperty('comment');
  });

  test('risk metrics are valid numbers', () => {
    expect(typeof financialIntelligence.risk.portfolioVaR95).toBe('number');
    expect(typeof financialIntelligence.risk.expectedShortfall).toBe('number');
    expect(typeof financialIntelligence.risk.defaultRate).toBe('number');
    expect(typeof financialIntelligence.risk.riskAppetiteUtilization).toBe('number');
    expect(financialIntelligence.risk.portfolioVaR95).toBeGreaterThan(0);
    expect(financialIntelligence.risk.expectedShortfall).toBeGreaterThan(0);
  });

  test('default rate is between 0 and 1', () => {
    expect(financialIntelligence.risk.defaultRate).toBeGreaterThanOrEqual(0);
    expect(financialIntelligence.risk.defaultRate).toBeLessThanOrEqual(1);
  });

  test('risk appetite utilization is between 0 and 1', () => {
    expect(financialIntelligence.risk.riskAppetiteUtilization).toBeGreaterThanOrEqual(0);
    expect(financialIntelligence.risk.riskAppetiteUtilization).toBeLessThanOrEqual(1);
  });

  test('exposures is an array with valid structure', () => {
    expect(Array.isArray(financialIntelligence.risk.exposures)).toBe(true);
    expect(financialIntelligence.risk.exposures.length).toBeGreaterThan(0);
  });

  test('each exposure has required properties', () => {
    financialIntelligence.risk.exposures.forEach((exposure: RiskExposure) => {
      expect(exposure).toHaveProperty('segment');
      expect(exposure).toHaveProperty('ratio');
      expect(exposure).toHaveProperty('changeBps');
      expect(exposure).toHaveProperty('avgDaysPastDue');
      expect(typeof exposure.ratio).toBe('number');
      expect(typeof exposure.changeBps).toBe('number');
      expect(typeof exposure.avgDaysPastDue).toBe('number');
      expect(exposure.avgDaysPastDue).toBeGreaterThanOrEqual(0);
    });
  });

  test('exposure ratios sum to approximately 1', () => {
    const sum = financialIntelligence.risk.exposures.reduce(
      (acc, exp) => acc + exp.ratio,
      0
    );
    expect(sum).toBeCloseTo(1, 2);
  });

  test('stress tests is an array with valid structure', () => {
    expect(Array.isArray(financialIntelligence.risk.stressTests)).toBe(true);
    expect(financialIntelligence.risk.stressTests.length).toBeGreaterThan(0);
  });

  test('each stress test has required properties', () => {
    financialIntelligence.risk.stressTests.forEach((test: StressScenario) => {
      expect(test).toHaveProperty('id');
      expect(test).toHaveProperty('scenario');
      expect(test).toHaveProperty('lossPercentage');
      expect(test).toHaveProperty('comment');
      expect(typeof test.lossPercentage).toBe('number');
      expect(test.lossPercentage).toBeGreaterThanOrEqual(0);
      expect(test.lossPercentage).toBeLessThanOrEqual(1);
    });
  });
});

describe('Insights', () => {
  test('insights is an array', () => {
    expect(Array.isArray(financialIntelligence.insights)).toBe(true);
    expect(financialIntelligence.insights.length).toBeGreaterThan(0);
  });

  test('each insight has required properties', () => {
    financialIntelligence.insights.forEach((insight: IntelligenceInsight) => {
      expect(insight).toHaveProperty('id');
      expect(insight).toHaveProperty('title');
      expect(insight).toHaveProperty('summary');
      expect(insight).toHaveProperty('impact');
      expect(insight).toHaveProperty('recommendedAction');
      expect(insight).toHaveProperty('confidence');
      expect(insight).toHaveProperty('tags');
      expect(insight).toHaveProperty('lastUpdated');
    });
  });

  test('insight confidence values are between 0 and 1', () => {
    financialIntelligence.insights.forEach((insight: IntelligenceInsight) => {
      expect(insight.confidence).toBeGreaterThanOrEqual(0);
      expect(insight.confidence).toBeLessThanOrEqual(1);
    });
  });

  test('insight tags are arrays of strings', () => {
    financialIntelligence.insights.forEach((insight: IntelligenceInsight) => {
      expect(Array.isArray(insight.tags)).toBe(true);
      insight.tags.forEach(tag => {
        expect(typeof tag).toBe('string');
      });
    });
  });

  test('insight lastUpdated is a valid ISO date', () => {
    financialIntelligence.insights.forEach((insight: IntelligenceInsight) => {
      expect(insight.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      const date = new Date(insight.lastUpdated);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });
});

describe('Market Indicators', () => {
  test('marketIndicators is an array', () => {
    expect(Array.isArray(financialIntelligence.marketIndicators)).toBe(true);
    expect(financialIntelligence.marketIndicators.length).toBeGreaterThan(0);
  });

  test('each market indicator has required properties', () => {
    financialIntelligence.marketIndicators.forEach((indicator: MarketIndicator) => {
      expect(indicator).toHaveProperty('id');
      expect(indicator).toHaveProperty('name');
      expect(indicator).toHaveProperty('value');
      expect(indicator).toHaveProperty('unit');
      expect(indicator).toHaveProperty('change');
      expect(indicator).toHaveProperty('source');
      expect(typeof indicator.value).toBe('number');
      expect(typeof indicator.change).toBe('number');
    });
  });

  test('market indicator units are valid', () => {
    const validUnits = ['percent', 'index', 'basis_points', 'number'];
    financialIntelligence.marketIndicators.forEach((indicator: MarketIndicator) => {
      expect(typeof indicator.unit).toBe('string');
      expect(indicator.unit.length).toBeGreaterThan(0);
    });
  });
});

describe('Data Sources', () => {
  test('dataSources is an array of strings', () => {
    expect(Array.isArray(financialIntelligence.dataSources)).toBe(true);
    expect(financialIntelligence.dataSources.length).toBeGreaterThan(0);
    financialIntelligence.dataSources.forEach(source => {
      expect(typeof source).toBe('string');
      expect(source.length).toBeGreaterThan(0);
    });
  });

  test('dataSources contains expected sources', () => {
    expect(financialIntelligence.dataSources).toContain('ABACO Data Lakehouse (2024-12 snapshot)');
  });
});

describe('Data Integrity and Consistency', () => {
  test('default rate in risk matches default rate metric', () => {
    const defaultRateMetric = financialIntelligence.metrics.find(m => m.id === 'default-rate');
    if (defaultRateMetric) {
      expect(financialIntelligence.risk.defaultRate).toBe(defaultRateMetric.value);
    }
  });

  test('all IDs are unique within their collections', () => {
    const metricIds = new Set(financialIntelligence.metrics.map(m => m.id));
    expect(metricIds.size).toBe(financialIntelligence.metrics.length);

    const insightIds = new Set(financialIntelligence.insights.map(i => i.id));
    expect(insightIds.size).toBe(financialIntelligence.insights.length);

    const indicatorIds = new Set(financialIntelligence.marketIndicators.map(i => i.id));
    expect(indicatorIds.size).toBe(financialIntelligence.marketIndicators.length);
  });

  test('no empty strings in critical fields', () => {
    financialIntelligence.metrics.forEach((metric: FinancialMetric) => {
      expect(metric.id.trim()).not.toBe('');
      expect(metric.label.trim()).not.toBe('');
      expect(metric.description.trim()).not.toBe('');
    });

    financialIntelligence.insights.forEach((insight: IntelligenceInsight) => {
      expect(insight.id.trim()).not.toBe('');
      expect(insight.title.trim()).not.toBe('');
      expect(insight.summary.trim()).not.toBe('');
    });
  });
});