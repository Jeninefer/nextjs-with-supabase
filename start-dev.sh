#!/bin/bash
# ABACO Financial Intelligence Platform - Development Startup
# Optimized for AI Toolkit tracing and Azure Cosmos DB integration

set -euo pipefail

cd /workspaces/nextjs-with-supabase

echo "🚀 ABACO Financial Intelligence Platform - Development Startup"
echo "============================================================"

# Pre-flight checks following AI Toolkit best practices
echo "🔍 Pre-flight checks..."

# Verify Node.js version for AI Toolkit compatibility
node_version=$(node --version | sed 's/v//' | cut -d. -f1)
if [[ $node_version -ge 18 ]]; then
    echo "✅ Node.js $(node --version) - AI Toolkit compatible"
else
    echo "❌ Node.js version too old. Upgrade to v18+ for AI Toolkit support"
    exit 1
fi

# Check dependencies
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Environment setup check
if [[ ! -f ".env.local" ]]; then
    echo "⚠️ .env.local not found"
    if [[ -f ".env.example" ]]; then
        echo "📋 Creating .env.local from template..."
        cp .env.example .env.local
        echo "🔧 Please edit .env.local with your Supabase credentials:"
        echo "   • NEXT_PUBLIC_SUPABASE_URL"
        echo "   • NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo ""
    fi
fi

# Clear previous build artifacts for clean start
echo "🧹 Clearing build cache..."
rm -rf .next || true

# Start development server with AI Toolkit optimizations
echo "🎯 Starting ABACO Financial Intelligence Platform..."
echo ""
echo "🌐 Application will be available at:"
echo "   Local:    http://localhost:3000"
echo "   Network:  http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "🤖 AI Toolkit Features Enabled:"
echo "   • Comprehensive tracing for financial operations"
echo "   • Azure Cosmos DB client with HPK optimization"
echo "   • Supabase SSR authentication with security enhancements"
echo "   • Real-time financial intelligence processing"
echo ""
echo "📊 Development Features:"
echo "   • Hot reload with Next.js 15 Turbopack"
echo "   • TypeScript strict mode validation"
echo "   • Tailwind CSS with shadcn/ui components"
echo "   • ESLint with financial platform rules"
echo ""
echo "Press Ctrl+C to stop the development server"
echo "=========================================="

# Start the development server with Turbopack for optimal performance
npm run dev
