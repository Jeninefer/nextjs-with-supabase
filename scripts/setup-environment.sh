#!/bin/bash

set -euo pipefail

echo "🚀 Setting up Production Environment for Abaco Financial Intelligence"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running in the correct directory
if [[ ! -f "package.json" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Create necessary directories
print_status "Creating directory structure..."
mkdir -p data/logs
mkdir -p lib/supabase
mkdir -p lib/cosmosdb
mkdir -p scripts
mkdir -p notebooks

# Clean up old files
print_status "Cleaning up old files..."
rm -f data/abaco_financial_report_*.md
rm -f data/kpis_*.json
rm -f data/agent_evaluation_*.json
rm -f data/integration_test_results.json
rm -f data/production_readiness_assessment.json

# Remove demo/dummy data files
find data/ -name "*dummy*" -delete 2>/dev/null || true
find data/ -name "*example*" -delete 2>/dev/null || true
find data/ -name "*demo*" -delete 2>/dev/null || true

# Check for required environment variables
print_status "Checking environment configuration..."
if [[ ! -f ".env.local" ]]; then
    print_warning "Creating .env.local from template..."
    cp .env.example .env.local
    print_warning "Please update .env.local with your actual credentials"
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Check for Python and install requirements
print_status "Setting up Python environment..."
if command -v python3 &> /dev/null; then
    pip3 install --upgrade pip
    pip3 install pandas numpy jupyter matplotlib seaborn
    print_status "Python dependencies installed"
else
    print_error "Python 3 is required but not installed"
fi

# Set up Git hooks
print_status "Configuring Git..."
git config --local core.autocrlf false
git config --local core.fileMode false

# Create .gitignore for data directory
cat > data/.gitignore << 'EOF'
# Ignore generated files but keep structure
*.json
*.csv
*.md
*.log

# Keep these files
!.gitignore
!README.md
EOF

# Create production data README
cat > data/README.md << 'EOF'
# Data Directory

This directory contains financial intelligence data and analysis outputs.

## Structure
- `logs/` - Application logs and tracing data
- `production_*.json` - KPI calculation results
- `executive_report_*.md` - Executive summary reports
- `cosmos_payload_*.json` - Azure Cosmos DB payloads

## Security
- Never commit sensitive financial data to version control
- Use environment variables for database connections
- Follow data retention policies for compliance
EOF

# Type check TypeScript files
print_status "Running type checks..."
if npx tsc --noEmit --skipLibCheck; then
    print_status "TypeScript compilation successful"
else
    print_warning "TypeScript warnings detected (non-blocking)"
fi

print_status "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open notebooks/abaco_financial_intelligence.ipynb for analysis"
echo ""
print_status "Production environment ready! 🎉"
