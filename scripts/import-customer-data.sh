#!/bin/bash

# ABACO Financial Intelligence Platform
# Script to import customer data into Supabase
# Usage: ./scripts/import-customer-data.sh

set -e

echo "🚀 ABACO Customer Data Import Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    exit 1
fi

# Load environment variables
set -a
source .env.local
set +a

# Check if CSV file exists
CSV_FILE="notebooks/financial_analysis_results.csv"
if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}❌ Error: CSV file not found at $CSV_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found CSV file: $CSV_FILE${NC}"

# Count lines in CSV (excluding header)
TOTAL_RECORDS=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')
echo -e "${GREEN}✓ Total records to import: $TOTAL_RECORDS${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi

echo "📊 Import Options:"
echo "1. Import via Supabase Dashboard (recommended for production)"
echo "2. Import via psql command (requires direct database access)"
echo "3. Import via API (slower but works remotely)"
echo ""
echo -e "${YELLOW}Recommended: Use Supabase Dashboard${NC}"
echo ""
echo "Steps to import via Dashboard:"
echo "1. Go to: $NEXT_PUBLIC_SUPABASE_URL"
echo "2. Navigate to: Table Editor → abaco_customers"
echo "3. Click 'Insert' → 'Import data from CSV'"
echo "4. Upload: $CSV_FILE"
echo "5. Map columns and confirm import"
echo ""
echo "Expected results after import:"
echo "  - Total customers: $TOTAL_RECORDS"
echo "  - Average balance: ~9,804.12"
echo "  - Average credit score: ~606.40"
echo ""

# Option to verify connection
echo -e "${YELLOW}Would you like to verify Supabase connection? (y/n)${NC}"
read -r verify_connection

if [ "$verify_connection" = "y" ]; then
    echo ""
    echo "🔍 Verifying Supabase connection..."
    
    # Use the health API endpoint
    if command -v curl &> /dev/null; then
        HEALTH_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/"
        echo "Testing connection to: $HEALTH_URL"
        
        if curl -s -f -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" "$HEALTH_URL" > /dev/null; then
            echo -e "${GREEN}✓ Supabase connection successful!${NC}"
        else
            echo -e "${RED}❌ Failed to connect to Supabase${NC}"
            echo "Please check your credentials in .env.local"
        fi
    fi
fi

echo ""
echo "📋 Post-Import Verification Query:"
echo ""
echo "Run this query in Supabase SQL Editor after import:"
echo ""
echo "SELECT"
echo "  COUNT(*) as total_customers,"
echo "  AVG(account_balance) as avg_balance,"
echo "  AVG(credit_score) as avg_credit_score,"
echo "  COUNT(CASE WHEN risk_category = 'High' THEN 1 END) as high_risk,"
echo "  COUNT(CASE WHEN risk_category = 'Medium' THEN 1 END) as medium_risk,"
echo "  COUNT(CASE WHEN risk_category = 'Low' THEN 1 END) as low_risk"
echo "FROM abaco_customers;"
echo ""
echo -e "${GREEN}✓ Import script completed${NC}"
