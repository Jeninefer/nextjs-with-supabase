#!/bin/bash

echo "🔍 ABACO Environment Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Function to check for Google Cloud environment variables
check_google_cloud_vars() {
    GOOGLE_VARS=$(env | grep -E "^(GOOGLE_|GCLOUD_|CLOUDSDK_|GCP_|DATAPROC_)" | grep -v "CHROME_BIN" || true)
    if [ -z "$GOOGLE_VARS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: No Google Cloud environment variables found"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: Found Google Cloud environment variables:"
        echo "$GOOGLE_VARS"
        echo ""
        echo "Run: ./scripts/clear_google_cloud_env.sh"
        ((FAILED++))
    fi
}

# Test 1: Check for Google Cloud environment variables
echo "Test 1: Google Cloud Environment Variables"
echo "-------------------------------------------"
check_google_cloud_vars
echo ""

# Test 2: Check Node.js availability
echo "Test 2: Node.js Installation"
echo "-----------------------------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ PASS${NC}: Node.js installed ($NODE_VERSION)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: Node.js not found"
    echo "Install Node.js from https://nodejs.org"
    ((FAILED++))
fi
echo ""

# Test 3: Check npm availability
echo "Test 3: npm Installation"
echo "------------------------"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ PASS${NC}: npm installed ($NPM_VERSION)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: npm not found"
    ((FAILED++))
fi
echo ""

# Test 4: Check Python availability
echo "Test 4: Python Installation"
echo "---------------------------"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ PASS${NC}: Python installed ($PYTHON_VERSION)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: python3 not found"
    echo "Python is needed for analytics. Install from https://python.org"
    ((WARNINGS++))
fi
echo ""

# Test 5: Check if node_modules exists
echo "Test 5: Dependencies Installation"
echo "----------------------------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ PASS${NC}: node_modules directory exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: node_modules not found"
    echo "Run: npm install"
    ((WARNINGS++))
fi
echo ""

# Test 6: Check for .env.local
echo "Test 6: Environment Configuration"
echo "----------------------------------"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ PASS${NC}: .env.local file exists"
    ((PASSED++))
elif [ -f ".env.example" ]; then
    echo -e "${YELLOW}⚠️  WARNING${NC}: .env.local not found"
    echo "Copy .env.example to .env.local and configure Supabase credentials"
    echo "Run: cp .env.example .env.local"
    ((WARNINGS++))
else
    echo -e "${RED}❌ FAIL${NC}: No environment configuration found"
    ((FAILED++))
fi
echo ""

# Test 7: Check shell configuration
echo "Test 7: Shell Configuration"
echo "---------------------------"
SHELL_CONFIG=""
if [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
fi

if [ -n "$SHELL_CONFIG" ] && [ -f "$SHELL_CONFIG" ]; then
    if grep -q "CLOUDSDK_CORE_DISABLE_PROMPTS" "$SHELL_CONFIG"; then
        echo -e "${GREEN}✅ PASS${NC}: Shell configured to prevent Google Cloud interference"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC}: Shell not configured to prevent Google Cloud interference"
        echo "Add these lines to $SHELL_CONFIG:"
        echo "  export CLOUDSDK_CORE_DISABLE_PROMPTS=1"
        echo "  export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: Could not determine shell configuration file"
    ((WARNINGS++))
fi
echo ""

# Test 8: Check Python virtual environment
echo "Test 8: Python Virtual Environment"
echo "-----------------------------------"
if [ -d "abaco_venv" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Python virtual environment exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: Python virtual environment not found"
    echo "Run: ./scripts/setup_clean_environment.sh"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"
echo -e "${GREEN}✅ Passed:${NC} $PASSED"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
fi
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed:${NC} $FAILED"
fi
echo ""

# Final verdict
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo "Your environment is ready for ABACO development."
    echo ""
    echo "🚀 Next steps:"
    echo "  1. npm run dev    # Start Next.js server"
    echo "  2. ./run_financial_analysis.sh  # Run Python analytics"
    echo ""
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Environment is mostly ready with some warnings.${NC}"
    echo "Review the warnings above and take corrective action if needed."
    echo ""
    exit 0
else
    echo -e "${RED}❌ Environment setup incomplete.${NC}"
    echo "Please fix the failed tests above."
    echo ""
    echo "💡 Quick fix: ./scripts/setup_clean_environment.sh"
    echo ""
    exit 1
fi
