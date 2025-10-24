// SonarQube dashboard widget configuration for Azure DevOps

export interface SonarQubeMetrics {
  coverage: number;
  duplicatedLinesPercent: number;
  maintainabilityRating: string;
  reliabilityRating: string;
  securityRating: string;
  techDebt: string;
  vulnerabilities: number;
  bugs: number;
  codeSmells: number;
}

export interface QualityGateStatus {
  status: 'OK' | 'WARN' | 'ERROR';
  conditions: Array<{
    metric: string;
    operator: string;
    threshold: string;
    actualValue: string;
    status: 'OK' | 'WARN' | 'ERROR';
  }>;
}

export const sonarQubeWidgetConfig = {
  // Widget display configuration
  title: 'Abaco Financial Intelligence - Quality Gate',
  projectKey: 'abaco-financial-intelligence',
  
  // Metrics to display in Azure DevOps dashboard
  displayMetrics: [
    'coverage',
    'duplicated_lines_percent',
    'maintainability_rating',
    'reliability_rating',
    'security_rating',
    'vulnerabilities',
    'bugs',
    'code_smells'
  ],
  
  // Quality gate thresholds for financial platform
  qualityGateThresholds: {
    coverage: { min: 80 },
    duplicatedLinesPercent: { max: 3 },
    maintainabilityRating: { max: 'A' },
    reliabilityRating: { max: 'A' },
    securityRating: { max: 'A' },
    vulnerabilities: { max: 0 },
    bugs: { max: 0 },
    codeSmells: { max: 10 }
  },
  
  // AI Toolkit specific metrics
  aiToolkitMetrics: {
    agentCodeCoverage: { min: 90 },
    tracingImplementation: { required: true },
    evaluationPatterns: { required: true }
  }
};
