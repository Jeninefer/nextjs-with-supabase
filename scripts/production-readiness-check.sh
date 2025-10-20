#!/bin/bash

# ABACO Financial Intelligence Platform
# Production Readiness Check
# Usage: ./scripts/production-readiness-check.sh


echo "🚀 ABACO Production Readiness Check"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ISSUES=$((ISSUES + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo -e "${BLUE}1. Checking Git Repository${NC}"
echo "----------------------------"

# Check if git is clean
if git diff-index --quiet HEAD --; then
    check_pass "Git working tree is clean"
else
    check_warn "Uncommitted changes detected"
    echo "  Run: git status"
fi

# Check if we're on a branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
if [ "$BRANCH" != "HEAD" ]; then
    check_pass "On branch: $BRANCH"
else
    check_fail "Not on a valid branch"
fi

# Check if remote exists
if git remote -v | grep -q "origin"; then
    check_pass "Git remote configured"
else
    check_fail "No git remote 'origin' configured"
fi

echo ""
echo -e "${BLUE}2. Checking Dependencies${NC}"
echo "------------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    check_pass "node_modules directory exists"
else
    check_fail "node_modules not found. Run: npm install"
fi

# Check package-lock.json
if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists"
else
    check_warn "package-lock.json not found"
fi

echo ""
echo -e "${BLUE}3. Checking Environment Configuration${NC}"
echo "--------------------------------------"

# Check .env.local
if [ -f ".env.local" ]; then
    check_pass ".env.local exists"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_URL configured"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY configured"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        check_pass "SUPABASE_SERVICE_ROLE_KEY configured"
    else
        check_warn "SUPABASE_SERVICE_ROLE_KEY not configured (optional)"
    fi
else
    check_fail ".env.local not found. Copy from .env.example"
fi

# Ensure .env files are in .gitignore
if grep -q "\.env.local" .gitignore && grep -q "\.env" .gitignore; then
    check_pass "Environment files properly ignored"
else
    check_warn "Check .gitignore for .env* files"
fi

echo ""
echo -e "${BLUE}4. Checking Database Files${NC}"
echo "--------------------------"

# Check migration file
if [ -f "supabase/migrations/001_create_abaco_schema.sql" ]; then
    check_pass "Database migration file exists"
else
    check_fail "Migration file not found: supabase/migrations/001_create_abaco_schema.sql"
fi

# Check CSV data
if [ -f "notebooks/financial_analysis_results.csv" ]; then
    check_pass "Customer data CSV exists"
    LINES=$(wc -l < notebooks/financial_analysis_results.csv | tr -d ' ')
    echo "  Records: $((LINES - 1))"
else
    check_fail "CSV data file not found: notebooks/financial_analysis_results.csv"
fi

echo ""
echo -e "${BLUE}5. Checking Code Quality${NC}"
echo "------------------------"

# TypeScript check
echo "Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    check_pass "TypeScript type check passed"
else
    check_fail "TypeScript errors found. Run: npm run type-check"
fi

# Build check
echo "Testing production build..."
if npm run build > /tmp/abaco-build.log 2>&1; then
    check_pass "Production build successful"
else
    check_fail "Build failed. Check: /tmp/abaco-build.log"
fi

echo ""
echo -e "${BLUE}6. Checking Scripts${NC}"
echo "-------------------"

# Check if scripts are executable
if [ -x "scripts/verify-database.sh" ]; then
    check_pass "verify-database.sh is executable"
else
    check_warn "verify-database.sh not executable. Run: chmod +x scripts/verify-database.sh"
fi

if [ -x "scripts/import-customer-data.sh" ]; then
    check_pass "import-customer-data.sh is executable"
else
    check_warn "import-customer-data.sh not executable. Run: chmod +x scripts/import-customer-data.sh"
fi

echo ""
echo -e "${BLUE}7. Checking Documentation${NC}"
echo "--------------------------"

# Check key documentation files
DOCS=("README.md" "docs/SETUP_GUIDE.md" "docs/GIT_WORKFLOW.md" "docs/QUICK_REFERENCE.md" "PRODUCTION_CHECKLIST.md")

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_warn "$doc not found"
    fi
done

echo ""
echo -e "${BLUE}8. Checking API Endpoints${NC}"
echo "--------------------------"

# Check if health API exists
if [ -f "app/api/health/route.ts" ]; then
    check_pass "Health API endpoint exists"
else
    check_fail "Health API not found: app/api/health/route.ts"
fi

# Check if test-supabase API exists
if [ -f "app/api/test-supabase/route.ts" ]; then
    check_pass "Test Supabase API endpoint exists"
else
    check_warn "Test Supabase API not found (optional)"
fi

echo ""
echo "========================================="
echo -e "${BLUE}Production Readiness Summary${NC}"
echo "========================================="
echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for production.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit any remaining changes: git add . && git commit -m 'chore: production ready'"
    echo "2. Push to remote: git push origin main"
    echo "3. Deploy to Vercel: vercel --prod"
    echo "4. Apply database migration in Supabase Dashboard"
    echo "5. Import customer data"
    echo "6. Verify production deployment"
    EXIT_CODE=0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  All critical checks passed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Review warnings above and fix if necessary."
    echo "You can proceed with deployment, but address warnings first."
    EXIT_CODE=0
else
    echo -e "${RED}❌ Found $ISSUES critical issue(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Fix the issues above before deploying to production."
    echo "Run specific checks:"
    echo "  - npm run type-check"
    echo "  - npm run build"
    echo "  - ./scripts/verify-database.sh"
    EXIT_CODE=1
fi

echo ""
echo "For detailed deployment instructions, see:"
echo "  - docs/SETUP_GUIDE.md"
echo "  - PRODUCTION_CHECKLIST.md"

exit $EXIT_CODE
