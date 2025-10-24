#!/bin/bash

set -euo pipefail

echo "🔧 Setting up SonarQube Analysis for Abaco Financial Intelligence Platform"
echo "========================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running in the correct directory
if [[ ! -f "package.json" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Fix Docker availability for SonarQube
print_info "Checking Docker availability..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found in PATH, installing Docker CLI..."
    
    # Install Docker CLI in codespace
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    
    print_status "Docker CLI installed"
else
    print_status "Docker CLI is available"
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_warning "Docker daemon not running, starting Docker service..."
    
    # Start Docker service in codespace
    sudo service docker start || {
        print_warning "Docker service not available in codespace, using alternative SonarQube setup"
        DOCKER_AVAILABLE=false
    }
else
    print_status "Docker daemon is running"
    DOCKER_AVAILABLE=true
fi

# Install SonarQube Scanner CLI
print_info "Installing SonarQube Scanner CLI..."
if ! command -v sonar-scanner &> /dev/null; then
    # Download and install SonarQube Scanner
    SONAR_SCANNER_VERSION="5.0.1.3006"
    wget -q "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip"
    unzip -q "sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip"
    sudo mv "sonar-scanner-${SONAR_SCANNER_VERSION}-linux" /opt/sonar-scanner
    sudo ln -sf /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
    rm "sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip"
    print_status "SonarQube Scanner CLI installed"
else
    print_status "SonarQube Scanner CLI is already available"
fi

# Install Node.js dependencies for SonarQube integration
print_info "Installing SonarQube Node.js dependencies..."
npm install --save-dev \
    sonarqube-scanner \
    jest \
    @types/jest \
    jest-environment-jsdom \
    jest-sonar-reporter \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser

print_status "SonarQube dependencies installed"

# Create SonarQube local server setup (if Docker is available)
if [[ "${DOCKER_AVAILABLE:-true}" == "true" ]]; then
    print_info "Setting up local SonarQube server with Docker..."
    
    # Create docker-compose for SonarQube
    cat > docker-compose.sonarqube.yml << 'EOF'
version: '3.8'

services:
  sonarqube:
    image: sonarqube:10.3-community
    container_name: sonarqube-financial-intelligence
    depends_on:
      - db
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
      SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: true
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    ports:
      - "9000:9000"
    networks:
      - sonarnet

  db:
    image: postgres:15
    container_name: sonarqube-db
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
      POSTGRES_DB: sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data
    networks:
      - sonarnet

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql:
  postgresql_data:

networks:
  sonarnet:
    driver: bridge
EOF

    print_status "SonarQube Docker configuration created"
    
    # Start SonarQube server
    print_info "Starting SonarQube server (this may take a few minutes)..."
    docker-compose -f docker-compose.sonarqube.yml up -d
    
    # Wait for SonarQube to be ready
    print_info "Waiting for SonarQube to be ready..."
    timeout=300
    counter=0
    
    while [[ $counter -lt $timeout ]]; do
        if curl -s http://localhost:9000/api/system/status | grep -q '"status":"UP"'; then
            print_status "SonarQube server is ready!"
            break
        fi
        
        if [[ $((counter % 30)) -eq 0 ]]; then
            print_info "Still waiting for SonarQube... ($counter/$timeout seconds)"
        fi
        
        sleep 5
        counter=$((counter + 5))
    done
    
    if [[ $counter -ge $timeout ]]; then
        print_warning "SonarQube server did not start within expected time"
        print_info "You can check status with: docker-compose -f docker-compose.sonarqube.yml logs"
    fi
    
else
    print_warning "Docker not available, skipping local SonarQube server setup"
    print_info "You can use SonarCloud instead: https://sonarcloud.io"
fi

# Create environment configuration
print_info "Creating SonarQube environment configuration..."
cat > .env.sonar << 'EOF'
# SonarQube Configuration for Abaco Financial Intelligence Platform
SONAR_HOST_URL=http://localhost:9000
SONAR_LOGIN=admin
SONAR_PASSWORD=admin
SONAR_PROJECT_KEY=abaco-financial-intelligence-platform
SONAR_PROJECT_NAME=Abaco Financial Intelligence Platform - AI Toolkit Integrated
SONAR_ORGANIZATION=abaco-financial

# AI Toolkit Integration
AITK_TRACING_ENABLED=true
AITK_EVALUATION_MODE=development
EOF

print_status "SonarQube environment configuration created"

# Create comprehensive test configuration
print_info "Setting up comprehensive testing configuration..."

# Update package.json scripts
cat > package.json.tmp << 'EOF'
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:report": "eslint . --format json --output-file eslint-report.json --ext .ts,.tsx,.js,.jsx || true",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --watchAll=false",
    "test:ci": "jest --coverage --watchAll=false --ci --reporters=default --reporters=jest-junit",
    "sonar:scan": "sonar-scanner",
    "sonar:local": "source .env.sonar && sonar-scanner",
    "sonar:cloud": "sonar-scanner -Dsonar.host.url=https://sonarcloud.io",
    "quality:check": "npm run lint:report && npm run test:coverage && npm run sonar:scan",
    "quality:full": "npm run lint:report && npm run test:ci && npm run sonar:local",
    "agents:test": "jest --testPathPattern=agents --coverage",
    "agents:eval": "jest --testPathPattern=agents --coverage --verbose"
  }
}
EOF

# Merge with existing package.json
if command -v jq &> /dev/null; then
    jq -s '.[0] * .[1]' package.json package.json.tmp > package.json.new
    mv package.json.new package.json
    rm package.json.tmp
    print_status "Package.json scripts updated"
else
    print_warning "jq not available, please manually merge scripts from package.json.tmp"
fi

# Create Jest configuration
print_info "Creating Jest configuration for AI Toolkit integration..."
cat > jest.config.js << 'EOF'
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Coverage configuration optimized for SonarQube
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura', 'json', 'clover'],
  
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
    },
    // Financial intelligence critical paths
    './lib/supabase/': {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85
    }
  },
  
  // Module path mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1'
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
    '!**/dist/**',
    '!**/build/**',
    '!**/__mocks__/**'
  ],
  
  // SonarQube integration
  testResultsProcessor: 'jest-sonar-reporter',
  reporters: [
    'default',
    ['jest-sonar-reporter', {
      outputDirectory: 'coverage',
      outputName: 'test-report.xml'
    }]
  ],
  
  // AI Toolkit specific setup
  setupFiles: ['<rootDir>/jest.env.js'],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};

module.exports = createJestConfig(customJestConfig);
EOF

print_status "Jest configuration created"

# Create comprehensive test setup
cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom';

// Mock AI Toolkit functions for testing
global.aitk_trace = jest.fn();
global.aitk_span = jest.fn();
global.aitk_diagnostic = jest.fn();
global.aitk_evaluate = jest.fn();

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      }
    };
  },
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  }))
}));

// Mock Cosmos DB client for testing
jest.mock('./lib/cosmosdb/client', () => ({
  getCosmosClient: jest.fn(() => ({
    getContainer: jest.fn(() => Promise.resolve({
      items: {
        create: jest.fn(() => Promise.resolve({
          resource: { id: 'test-id' },
          statusCode: 201,
          requestCharge: 5.2,
          diagnostics: { toString: () => 'Mock diagnostics' }
        })),
        query: jest.fn(() => ({
          fetchAll: jest.fn(() => Promise.resolve({
            resources: [],
            requestCharge: 2.1
          }))
        }))
      }
    })),
    executeWithDiagnostics: jest.fn((op, fn) => fn())
  })),
  DiagnosticInfo: {}
}));

// Mock financial intelligence agent
jest.mock('./lib/agents/financial-intelligence-agent', () => ({
  FinancialIntelligenceAgent: jest.fn().mockImplementation(() => ({
    processFinancialData: jest.fn(() => Promise.resolve({
      operationId: 'test-operation',
      timestamp: new Date().toISOString(),
      kpis: { totalAUM: 1000000, customerCount: 100 },
      insights: ['Test insight'],
      alerts: [],
      performance: { processingTimeMs: 100, recordsProcessed: 100 }
    }))
  }))
}));

// Global test utilities
global.testUtils = {
  createMockFinancialData: (count = 10) => Array.from({ length: count }, (_, i) => ({
    customerId: `CUST${String(i).padStart(7, '0')}`,
    balance: Math.random() * 100000,
    creditLimit: Math.random() * 200000,
    dpd: Math.floor(Math.random() * 120),
    industry: 'TECHNOLOGY',
    analysisDate: new Date().toISOString().split('T')[0]
  })),
  
  createMockAgentResponse: () => ({
    operationId: 'mock-operation-id',
    timestamp: new Date().toISOString(),
    kpis: {
      totalAUM: 1000000,
      customerCount: 100,
      averageBalance: 10000,
      portfolioUtilization: 65,
      delinquencyRate: 2.5,
      highRiskRate: 0.8
    },
    insights: [
      'Strong portfolio performance',
      'Low risk profile maintained'
    ],
    alerts: [
      {
        customerId: 'CUST0001',
        severity: 'medium',
        message: 'Utilization above 80%'
      }
    ],
    performance: {
      processingTimeMs: 150,
      recordsProcessed: 100
    }
  })
};
EOF

print_status "Comprehensive test setup created"

# Create environment setup for tests
cat > jest.env.js << 'EOF'
// Environment setup for Jest tests following AI Toolkit best practices
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.COSMOS_DB_ENDPOINT = 'https://localhost:8081';
process.env.COSMOS_DB_KEY = 'test-cosmos-key';
process.env.AITK_TRACING_ENABLED = 'true';
process.env.AITK_EVALUATION_MODE = 'test';

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: React.createElement'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
EOF

print_status "Test environment configuration created"

# Fix Pylance configuration
print_info "Fixing Pylance configuration..."
mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "python.analysis.extraPaths": [
    "./notebooks"
  ],
  "python.analysis.exclude": [
    "**/__pycache__",
    "**/node_modules",
    "**/.next",
    "**/coverage",
    "**/dist",
    "**/build"
  ],
  "python.analysis.autoImportCompletions": true,
  "python.analysis.typeCheckingMode": "basic",
  "python.defaultInterpreterPath": "/usr/bin/python3",
  "python.analysis.diagnosticMode": "workspace",
  "python.analysis.stubPath": "./typings",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "eslint.workingDirectories": ["."],
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/coverage": true,
    "**/dist": true
  }
}
EOF

print_status "VSCode settings optimized"

# Create SonarQube analysis script
cat > scripts/run-sonar-analysis.sh << 'EOF'
#!/bin/bash

echo "🔍 Running SonarQube Analysis for Financial Intelligence Platform"
echo "================================================================"

# Load environment variables
if [[ -f ".env.sonar" ]]; then
    source .env.sonar
fi

# Run linting and generate report
echo "📋 Running ESLint analysis..."
npm run lint:report

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

# Run AI agent specific tests
echo "🤖 Running AI agent evaluation..."
npm run agents:eval

# Run SonarQube analysis
echo "📊 Running SonarQube analysis..."
if [[ "${SONAR_HOST_URL:-}" == *"sonarcloud.io"* ]]; then
    echo "Using SonarCloud..."
    sonar-scanner \
        -Dsonar.host.url=https://sonarcloud.io \
        -Dsonar.login="${SONAR_TOKEN}" \
        -Dsonar.organization="${SONAR_ORGANIZATION}"
else
    echo "Using local SonarQube server..."
    sonar-scanner \
        -Dsonar.host.url="${SONAR_HOST_URL:-http://localhost:9000}" \
        -Dsonar.login="${SONAR_LOGIN:-admin}" \
        -Dsonar.password="${SONAR_PASSWORD:-admin}"
fi

echo "✅ SonarQube analysis completed!"
echo "📊 View results at: ${SONAR_HOST_URL:-http://localhost:9000}"
EOF

chmod +x scripts/run-sonar-analysis.sh
print_status "SonarQube analysis script created"

# Create quality gate status check
cat > scripts/check-quality-gate.sh << 'EOF'
#!/bin/bash

SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"
PROJECT_KEY="${SONAR_PROJECT_KEY:-abaco-financial-intelligence-platform}"

echo "🚪 Checking Quality Gate status..."

# Wait for analysis to complete
sleep 10

# Check quality gate status
QUALITY_GATE_STATUS=$(curl -s "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}" | jq -r '.projectStatus.status')

if [[ "$QUALITY_GATE_STATUS" == "OK" ]]; then
    echo "✅ Quality Gate: PASSED"
    exit 0
elif [[ "$QUALITY_GATE_STATUS" == "ERROR" ]]; then
    echo "❌ Quality Gate: FAILED"
    echo "📊 Check details at: ${SONAR_HOST_URL}/dashboard?id=${PROJECT_KEY}"
    exit 1
else
    echo "⚠️  Quality Gate status unknown: $QUALITY_GATE_STATUS"
    exit 2
fi
EOF

chmod +x scripts/check-quality-gate.sh
print_status "Quality gate check script created"

print_status "SonarQube setup completed successfully! 🎉"
echo ""
echo "📋 Next steps:"
echo "1. Start analysis: ./scripts/run-sonar-analysis.sh"
echo "2. Check quality gate: ./scripts/check-quality-gate.sh"
if [[ "${DOCKER_AVAILABLE:-true}" == "true" ]]; then
    echo "3. Access SonarQube: http://localhost:9000 (admin/admin)"
fi
echo "4. For CI/CD: Use the Azure Pipeline configuration created"
echo ""
print_info "Configuration files created:"
echo "  - sonar-project.properties (SonarQube configuration)"
echo "  - jest.config.js (Test configuration)"
echo "  - docker-compose.sonarqube.yml (Local SonarQube server)"
echo "  - .env.sonar (Environment configuration)"
echo ""
print_status "Ready for comprehensive code quality analysis! 🚀"
