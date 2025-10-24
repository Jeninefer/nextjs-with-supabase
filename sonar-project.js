const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: process.env.SONAR_HOST_URL || 'https://sonarcloud.io',
  options: {
    // Project identification
    'sonar.projectKey': 'abaco-financial-intelligence-platform',
    'sonar.projectName': 'Abaco Financial Intelligence Platform - AI Toolkit Integrated',
    'sonar.projectVersion': '1.0.0',
    'sonar.organization': 'abaco-financial',
    
    // Source directories - comprehensive coverage
    'sonar.sources': [
      './app',
      './components', 
      './lib',
      './supabase/functions',
      './supabase/migrations',
      './scripts',
      './middleware.ts',
      './next.config.ts'
    ].join(','),
    
    // Test directories
    'sonar.tests': [
      './tests',
      './app/**/*.test.ts',
      './lib/**/*.test.ts',
      './components/**/*.test.tsx',
      './lib/agents/**/*.test.ts'
    ].join(','),
    
    // Exclusions - optimized for financial platform
    'sonar.exclusions': [
      '**/node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/coverage/**',
      '**/*.d.ts',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '.anima/**',
      'tsconfig.tsbuildinfo',
      'package-lock.json'
    ].join(','),
    
    // Test inclusions
    'sonar.test.inclusions': '**/*.test.ts,**/*.test.tsx,**/*.spec.ts',
    
    // Coverage reports
    'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    
    // Language and encoding
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.qualitygate.wait': true,
    
    // AI Toolkit specific configurations
    'sonar.coverage.exclusions': [
      '**/lib/agents/**/*.ts',
      '**/lib/cosmosdb/**/*.ts',
      '**/notebooks/**',
      '**/scripts/**/*.sh'
    ].join(','),
    
    // TypeScript configuration
    'sonar.typescript.tsconfigPath': 'tsconfig.json',
    
    // Security configurations for financial intelligence
    'sonar.security.hotspots.checkAll': true,
    'sonar.security.vulnerabilities.checkAll': true,
    'sonar.security.review.checkAll': true,
    
    // Performance and maintainability
    'sonar.javascript.environments': 'node,browser,jest',
    'sonar.eslint.reportPaths': 'eslint-report.json',
    
    // Duplication settings
    'sonar.cpd.exclusions': [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/migrations/**/*.sql'
    ].join(','),
    
    // SQL analysis for Supabase migrations
    'sonar.plsql.file.suffixes': '.sql',
    
    // Custom metrics for financial platform
    'sonar.issue.ignore.multicriteria': 'e1,e2,e3',
    'sonar.issue.ignore.multicriteria.e1.ruleKey': 'typescript:S3776',
    'sonar.issue.ignore.multicriteria.e1.resourceKey': '**/lib/agents/**',
    'sonar.issue.ignore.multicriteria.e2.ruleKey': 'typescript:S1541',
    'sonar.issue.ignore.multicriteria.e2.resourceKey': '**/migrations/**',
    'sonar.issue.ignore.multicriteria.e3.ruleKey': 'typescript:S2068',
    'sonar.issue.ignore.multicriteria.e3.resourceKey': '**/jest.setup.js'
  }
}, () => process.exit());
