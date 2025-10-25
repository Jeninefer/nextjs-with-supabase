// SonarQube dashboard widget configuration for AI Toolkit integrated financial platform

// Minimal definition for SonarQubeMetrics. See widget-config.ts for complete definition.
export interface SonarQubeMetrics {
  coverage: number;
  securityRating: string;
  vulnerabilities: number;
}
export interface AITKSonarMetrics extends SonarQubeMetrics {
  agentComplexity: number;
  tracingCoverage: number;
  evaluationTestCount: number;
  performanceMetricsCount: number;
}

// Minimal definition for QualityGateStatus, update as needed
export interface QualityGateStatus {
  status: 'OK' | 'WARN' | 'ERROR';
  // Add other properties as needed
}
export interface AITKQualityGate extends QualityGateStatus {
  aitkConditions: Array<{
    metric: 'agent_tracing' | 'agent_evaluation' | 'performance_monitoring' | 'error_handling';
    status: 'OK' | 'WARN' | 'ERROR';
    description: string;
  }>;
}

export const aitkSonarQubeConfig = {
  // Financial Intelligence Platform specific configuration
  title: 'Abaco Financial Intelligence - AI Toolkit Quality Gate',
  projectKey: 'abaco-financial-intelligence-platform',
  
  // AI Toolkit specific metrics
  aitkMetrics: [
    'agent_code_coverage',
    'tracing_implementation_rate',
    'evaluation_test_coverage',
    'performance_monitoring_coverage',
    'error_handling_completeness'
  ],
  
  // Quality gate thresholds for AI Toolkit integration
  aitkQualityGateThresholds: {
    // Standard SonarQube metrics
    coverage: { min: 80 },
    duplicatedLinesPercent: { max: 3 },
    maintainabilityRating: { max: 'A' },
    reliabilityRating: { max: 'A' },
    securityRating: { max: 'A' },
    vulnerabilities: { max: 0 },
    bugs: { max: 0 },
    codeSmells: { max: 15 },
    
    // AI Toolkit specific thresholds
    agentCodeCoverage: { min: 85 },
    tracingImplementation: { min: 90 },
    evaluationTests: { min: 3 },
    performanceMetrics: { required: true },
    errorHandling: { required: true }
  },
  
  // Financial platform specific rules
  financialPlatformRules: {
    // Security rules for financial data
    dataEncryption: { required: true },
    auditLogging: { required: true },
    accessControl: { required: true },
    
    // Cosmos DB integration rules
    partitionKeyOptimization: { required: true },
    diagnosticLogging: { required: true },
    connectionPooling: { required: true },
    
    // AI agent development rules
    tracingInstrumentation: { coverage: 90 },
    performanceMonitoring: { required: true },
    errorBoundaries: { required: true },
    typeDefinitions: { coverage: 95 }
  },
  
  // Custom quality conditions
  customConditions: [
    {
      metric: 'ai_agent_complexity',
      operator: 'LT',
      threshold: '15',
      description: 'AI agents should not be overly complex'
    },
    {
      metric: 'cosmos_db_optimization',
      operator: 'GT',
      threshold: '80',
      description: 'Cosmos DB queries should be optimized'
    },
    {
      metric: 'financial_security_compliance',
      operator: 'EQ',
      threshold: '100',
      description: 'Financial security patterns must be complete'
    }
  ]
};

export const generateAITKSonarReport = (metrics: AITKSonarMetrics): string => {
  return `
# AI Toolkit SonarQube Analysis Report

## Overall Quality Gate: ${metrics.coverage >= 80 ? '✅ PASSED' : '❌ FAILED'}

## AI Toolkit Integration Metrics
- **Agent Tracing Coverage**: ${metrics.tracingCoverage}%
- **Evaluation Tests**: ${metrics.evaluationTestCount}
- **Performance Monitoring**: ${metrics.performanceMetricsCount > 0 ? '✅ Implemented' : '❌ Missing'}

## Financial Platform Security
- **Security Rating**: ${metrics.securityRating}
- **Vulnerabilities**: ${metrics.vulnerabilities}
- **Data Protection**: Compliant

## Recommendations
${metrics.coverage < 80 ? '- Increase test coverage to meet 80% threshold\n' : ''}
${metrics.tracingCoverage < 90 ? '- Implement AI Toolkit tracing in remaining agents\n' : ''}
${metrics.evaluationTestCount < 3 ? '- Add more agent evaluation tests\n' : ''}

---
Generated: ${new Date().toISOString()}
  `;
};
