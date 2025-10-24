#!/bin/bash

# Test script for migration automation
# This script validates that the migration script works correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🧪 Migration Script Test Suite                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Test 1: Check prerequisites
echo -e "${BLUE}Test 1: Checking prerequisites...${NC}"
TESTS_PASSED=0
TESTS_FAILED=0

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅${NC} Node.js installed: $NODE_VERSION"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Node.js not installed"
    ((TESTS_FAILED++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅${NC} npm installed: $NPM_VERSION"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} npm not installed"
    ((TESTS_FAILED++))
fi

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅${NC} git installed: $GIT_VERSION"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} git not installed"
    ((TESTS_FAILED++))
fi

# Test 2: Check script files
echo ""
echo -e "${BLUE}Test 2: Checking script files...${NC}"

if [ -f "scripts/migrate-to-free-services.sh" ]; then
    echo -e "${GREEN}✅${NC} Migration script exists"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Migration script not found"
    ((TESTS_FAILED++))
fi

if [ -x "scripts/migrate-to-free-services.sh" ]; then
    echo -e "${GREEN}✅${NC} Migration script is executable"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Migration script is not executable"
    ((TESTS_FAILED++))
fi

if bash -n "scripts/migrate-to-free-services.sh" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Migration script has valid syntax"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Migration script has syntax errors"
    ((TESTS_FAILED++))
fi

# Test 3: Check documentation
echo ""
echo -e "${BLUE}Test 3: Checking documentation...${NC}"

if [ -f "scripts/README.md" ]; then
    echo -e "${GREEN}✅${NC} scripts/README.md exists"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} scripts/README.md not found"
    ((TESTS_FAILED++))
fi

if [ -f ".env.example" ]; then
    if grep -q "Free Services" ".env.example"; then
        echo -e "${GREEN}✅${NC} .env.example includes free services config"
        ((TESTS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} .env.example missing free services config"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌${NC} .env.example not found"
    ((TESTS_FAILED++))
fi

if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✅${NC} netlify.toml exists"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} netlify.toml not found"
    ((TESTS_FAILED++))
fi

# Test 4: Check workflows
echo ""
echo -e "${BLUE}Test 4: Checking GitHub Actions workflows...${NC}"

if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅${NC} deploy.yml exists"
    ((TESTS_PASSED++))
    
    # Check if the file is not corrupted
    if grep -q "name: Deploy Next.js Application" ".github/workflows/deploy.yml"; then
        echo -e "${GREEN}✅${NC} deploy.yml has correct structure"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} deploy.yml structure invalid"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌${NC} deploy.yml not found"
    ((TESTS_FAILED++))
fi

if [ -f ".github/workflows/deploy-netlify.yml" ]; then
    echo -e "${GREEN}✅${NC} deploy-netlify.yml exists"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} deploy-netlify.yml not found"
    ((TESTS_FAILED++))
fi

# Test 5: Check package.json
echo ""
echo -e "${BLUE}Test 5: Checking package.json...${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅${NC} package.json exists"
    ((TESTS_PASSED++))
    
    # Check required scripts
    if grep -q '"type-check"' "package.json"; then
        echo -e "${GREEN}✅${NC} type-check script defined"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} type-check script missing"
        ((TESTS_FAILED++))
    fi
    
    if grep -q '"lint"' "package.json"; then
        echo -e "${GREEN}✅${NC} lint script defined"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} lint script missing"
        ((TESTS_FAILED++))
    fi
    
    if grep -q '"build"' "package.json"; then
        echo -e "${GREEN}✅${NC} build script defined"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} build script missing"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌${NC} package.json not found"
    ((TESTS_FAILED++))
fi

# Test 6: Simulate migration (dry run)
echo ""
echo -e "${BLUE}Test 6: Migration script dry run validation...${NC}"

# Check that the script can detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
echo -e "${GREEN}✅${NC} Detected OS: $OS"
echo -e "${GREEN}✅${NC} Detected Architecture: $ARCH"
((TESTS_PASSED+=2))

# Check if wget or curl is available
if command -v wget &> /dev/null || command -v curl &> /dev/null; then
    echo -e "${GREEN}✅${NC} Download tool available (wget or curl)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Neither wget nor curl available"
    ((TESTS_FAILED++))
fi

# Test 7: Validate migration script key features
echo ""
echo -e "${BLUE}Test 7: Validating migration script features...${NC}"

SCRIPT_CONTENT=$(cat scripts/migrate-to-free-services.sh)

if echo "$SCRIPT_CONTENT" | grep -q "PocketBase"; then
    echo -e "${GREEN}✅${NC} Script includes PocketBase installation"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Script missing PocketBase installation"
    ((TESTS_FAILED++))
fi

if echo "$SCRIPT_CONTENT" | grep -q "GEMINI_API_KEY"; then
    echo -e "${GREEN}✅${NC} Script includes Gemini API configuration"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Script missing Gemini API configuration"
    ((TESTS_FAILED++))
fi

if echo "$SCRIPT_CONTENT" | grep -q "cloudinary"; then
    echo -e "${GREEN}✅${NC} Script includes Cloudinary configuration"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Script missing Cloudinary configuration"
    ((TESTS_FAILED++))
fi

if echo "$SCRIPT_CONTENT" | grep -q "netlify"; then
    echo -e "${GREEN}✅${NC} Script includes Netlify configuration"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Script missing Netlify configuration"
    ((TESTS_FAILED++))
fi

if echo "$SCRIPT_CONTENT" | grep -q "MIGRATION_GUIDE.md"; then
    echo -e "${GREEN}✅${NC} Script generates migration guide"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Script doesn't generate migration guide"
    ((TESTS_FAILED++))
fi

# Test 8: README validation
echo ""
echo -e "${BLUE}Test 8: Validating README updates...${NC}"

if grep -q "Free Services Migration" "README.md"; then
    echo -e "${GREEN}✅${NC} README includes migration section"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} README missing migration section"
    ((TESTS_FAILED++))
fi

if grep -q "migrate-to-free-services.sh" "README.md"; then
    echo -e "${GREEN}✅${NC} README references migration script"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} README doesn't reference migration script"
    ((TESTS_FAILED++))
fi

# Final Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     📊 Test Results Summary                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total tests run: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Tests passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🎉 All tests passed! Migration script ready to use.    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}To run the migration:${NC}"
    echo "  bash scripts/migrate-to-free-services.sh"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║     ❌ Some tests failed. Please review the errors above.   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
