#!/bin/bash

# ABACO Financial Intelligence Platform
# Database Verification Script
# Usage: ./scripts/verify-database.sh

set -e

echo "🔍 ABACO Database Verification Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
set -a
source .env.local
set +a

echo -e "${BLUE}Checking Supabase Configuration...${NC}"
echo ""

# Verify environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL configured${NC}"
    echo "  URL: $NEXT_PUBLIC_SUPABASE_URL"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    exit 1
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY configured${NC}"
    echo "  Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not set (optional for client apps)${NC}"
else
    echo -e "${GREEN}✓ SUPABASE_SERVICE_ROLE_KEY configured${NC}"
    echo "  Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
fi

echo ""
echo -e "${BLUE}Testing Supabase Connection...${NC}"
echo ""

# Test REST API connection
REST_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/"
if curl -s -f -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" "$REST_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ REST API connection successful${NC}"
else
    echo -e "${RED}❌ Failed to connect to REST API${NC}"
    exit 1
fi

# Test if abaco_customers table exists
CUSTOMERS_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/abaco_customers?select=count"
RESPONSE=$(curl -s -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    "$CUSTOMERS_URL")

if echo "$RESPONSE" | grep -q "count"; then
    echo -e "${GREEN}✓ abaco_customers table exists${NC}"
    
    # Try to get actual count
    COUNT_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/abaco_customers?select=*&limit=1"
    COUNT_RESPONSE=$(curl -s -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Prefer: count=exact" \
        "$COUNT_URL")
    
    echo "  Sample query executed successfully"
elif echo "$RESPONSE" | grep -q "relation.*does not exist"; then
    echo -e "${YELLOW}⚠️  abaco_customers table not found${NC}"
    echo "  Run migration: supabase/migrations/001_create_abaco_schema.sql"
else
    echo -e "${YELLOW}⚠️  Could not verify abaco_customers table${NC}"
    echo "  Response: $RESPONSE"
fi

echo ""
echo -e "${BLUE}Checking Migration Files...${NC}"
echo ""

if [ -f "supabase/migrations/001_create_abaco_schema.sql" ]; then
    echo -e "${GREEN}✓ Found: 001_create_abaco_schema.sql${NC}"
    LINE_COUNT=$(wc -l < "supabase/migrations/001_create_abaco_schema.sql" | tr -d ' ')
    echo "  Lines: $LINE_COUNT"
else
    echo -e "${RED}❌ Migration file not found${NC}"
fi

echo ""
echo -e "${BLUE}Checking Data Files...${NC}"
echo ""

if [ -f "notebooks/financial_analysis_results.csv" ]; then
    echo -e "${GREEN}✓ Found: financial_analysis_results.csv${NC}"
    RECORD_COUNT=$(tail -n +2 "notebooks/financial_analysis_results.csv" | wc -l | tr -d ' ')
    echo "  Records: $RECORD_COUNT"
else
    echo -e "${RED}❌ CSV data file not found${NC}"
fi

echo ""
echo -e "${BLUE}Testing Local API Endpoints...${NC}"
echo ""

# Check if the app is running
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health API endpoint responding${NC}"
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Local server not running${NC}"
    echo "  Start with: npm run dev"
fi

echo ""
echo -e "${BLUE}Summary${NC}"
echo "=========="
echo ""
echo "Migration File: supabase/migrations/001_create_abaco_schema.sql"
echo "Data File: notebooks/financial_analysis_results.csv"
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Apply migration in Supabase Dashboard (Database → SQL Editor)"
echo "2. Import CSV data (Table Editor → abaco_customers → Import)"
echo "3. Run: npm run dev (to start local server)"
echo "4. Test: curl http://localhost:3000/api/health"
echo ""
echo -e "${GREEN}✓ Verification complete${NC}"
