#!/bin/bash
# ABACO Financial Intelligence Platform - API Endpoint Testing
# Following AI Toolkit best practices with comprehensive tracing

set -euo pipefail

echo "🔗 ABACO Financial Intelligence Platform - API Endpoint Testing"
echo "============================================================="

# AI Toolkit tracing
API_TEST_TRACE_ID="api_test_$(date +%s)"
echo "🔍 AI Toolkit Trace ID: $API_TEST_TRACE_ID"

# Base URL configuration
BASE_URL="http://localhost:3000"
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2 | tr -d '"' || echo "")
SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2 | tr -d '"' || echo "")

echo "🌐 Testing API endpoints..."
echo "📍 Base URL: $BASE_URL"
echo "📊 Supabase URL: $SUPABASE_URL"

# Test 1: Health Check Endpoint
echo ""
echo "🏥 Testing Health Check..."
if curl -s "$BASE_URL/api/health" >/dev/null 2>&1; then
    echo "✅ Health check endpoint responding"
else
    echo "❌ Health check endpoint not available"
fi

# Test 2: Supabase Connection
echo ""
echo "📊 Testing Supabase Connection..."
if [[ -n "$SUPABASE_URL" && -n "$SUPABASE_ANON_KEY" ]]; then
    if curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
           -H "apikey: $SUPABASE_ANON_KEY" \
           "$SUPABASE_URL/rest/v1/" >/dev/null 2>&1; then
        echo "✅ Supabase connection successful"
    else
        echo "❌ Supabase connection failed - check credentials"
    fi
else
    echo "⚠️  Supabase credentials not configured"
fi

# Test 3: Database Schema
echo ""
echo "🗄️  Testing Database Schema..."
if [[ -n "$SUPABASE_URL" && -n "$SUPABASE_ANON_KEY" ]]; then
    TABLES_RESPONSE=$(curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
                           -H "apikey: $SUPABASE_ANON_KEY" \
                           "$SUPABASE_URL/rest/v1/user_profiles?limit=1")
    
    if echo "$TABLES_RESPONSE" | grep -q '\[\]' || echo "$TABLES_RESPONSE" | grep -q '"id"'; then
        echo "✅ Database schema accessible"
    else
        echo "❌ Database schema not accessible - run migrations"
    fi
else
    echo "⚠️  Cannot test database - credentials not configured"
fi

echo ""
echo "📋 API Testing Summary:"
echo "🔍 Trace ID: $API_TEST_TRACE_ID"
echo "💡 Fix any failed tests before production deployment"
