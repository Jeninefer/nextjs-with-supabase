#!/bin/bash

# ABACO Production Verification Script
# Usage: ./scripts/verify-production.sh <production-url>

PROD_URL="${1:-https://your-app.vercel.app}"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 ABACO Production Verification"
echo "================================="
echo "Testing: $PROD_URL"
echo ""

# Test 1: Homepage
echo "Test 1: Homepage accessibility..."
if curl -s -f "$PROD_URL" > /dev/null; then
    echo -e "${GREEN}✅ Homepage: OK${NC}"
else
    echo -e "${RED}❌ Homepage: FAILED${NC}"
fi

# Test 2: Health endpoint
echo "Test 2: Health check..."
HEALTH=$(curl -s "$PROD_URL/api/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health: OK${NC}"
    echo "$HEALTH" | jq '.'
else
    echo -e "${RED}❌ Health: FAILED${NC}"
fi

# Test 3: SSL Certificate
echo "Test 3: SSL certificate..."
if openssl s_client -connect $(echo $PROD_URL | sed 's/https:\/\///'):443 -servername $(echo $PROD_URL | sed 's/https:\/\///') < /dev/null 2>/dev/null | grep -q 'Verify return code: 0'; then
    echo -e "${GREEN}✅ SSL: Valid${NC}"
else
    echo -e "${RED}❌ SSL: Issues detected${NC}"
fi

# Test 4: Response time
echo "Test 4: Response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$PROD_URL")
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ Response time: ${RESPONSE_TIME}s${NC}"
else
    echo -e "${RED}⚠️  Response time: ${RESPONSE_TIME}s (slow)${NC}"
fi

echo ""
echo "================================="
echo "Verification complete! 🎉"
