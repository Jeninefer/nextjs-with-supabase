const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Module path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1'
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura', 'json'],
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      lines: 80,
      functions: 75
    },
    // Higher thresholds for AI agents
    './lib/agents/': {
      statements: 90,
      branches: 80,
      lines: 90,
      functions: 85
    }
  },
  
  // SonarQube test reporter
  testResultsProcessor: 'jest-sonar-reporter',
  
  // AI Toolkit specific test setup
  setupFiles: ['<rootDir>/jest.env.js']
};

// Create and export the Jest config
module.exports = createJestConfig(customJestConfig);
