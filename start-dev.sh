#!/bin/bash
# ABACO Financial Intelligence Platform - Development Server Startup
# Following AI Toolkit best practices

echo "🏦 Starting ABACO Financial Intelligence Platform Development Server"
echo "================================================================="

# AI Toolkit tracing for development session
DEV_TRACE_ID="dev_session_$(date +%s)"
echo "🔍 AI Toolkit Trace ID: $DEV_TRACE_ID"

# Pre-flight checks
echo "🔧 Running pre-flight checks..."

# Check environment
if [[ ! -f ".env.local" ]]; then
    echo "❌ .env.local not found - run ./scripts/complete-setup.sh first"
    exit 1
fi

# Check for placeholder values
if grep -q "your_.*\|example" .env.local; then
    echo "⚠️  WARNING: Placeholder values in .env.local - update with real API keys"
fi

# Check dependencies
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Auto-fix build issues if needed
if [[ -f "./scripts/fix-build-issues.sh" ]]; then
    echo "🔧 Auto-checking for build issues..."
    if ! npm run build --dry-run >/dev/null 2>&1; then
        echo "🔧 Running build fix script..."
        chmod +x ./scripts/fix-build-issues.sh
        ./scripts/fix-build-issues.sh
    fi
fi

# Type check
echo "🔍 Running TypeScript validation..."
if npm run type-check; then
    echo "✅ TypeScript validation passed"
else
    echo "⚠️  TypeScript issues detected - fix before proceeding"
fi

echo ""
echo "🚀 Starting Next.js development server with AI Toolkit tracing..."
echo "📋 Platform: ABACO Financial Intelligence v2.0.0"
echo "🔍 Trace ID: $DEV_TRACE_ID"
echo "🌐 URL: http://localhost:3000"
echo "🏥 Health Check: http://localhost:3000/api/health"
echo ""

# Start development server with tracing
AITK_TRACE_ID="$DEV_TRACE_ID" \
AITK_TRACE_ENABLED="true" \
npm run dev
