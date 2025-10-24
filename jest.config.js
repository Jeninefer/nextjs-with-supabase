const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Coverage configuration for SonarQube
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura', 'json'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.spec.{js,jsx,ts,tsx}'
  ],
  
  // Coverage thresholds following AI Toolkit best practices
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    // Higher thresholds for AI agents
    './lib/agents/': {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    }
  },
  
  // Module path mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1'
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],
  
  // SonarQube test reporter
  testResultsProcessor: 'jest-sonar-reporter',
  
  // AI Toolkit specific test setup
  setupFiles: ['<rootDir>/jest.env.js']
};

// Create and export the Jest config
module.exports = createJestConfig(customJestConfig);
