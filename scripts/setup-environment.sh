#!/bin/bash
# Setup script for nextjs-supabase-financial-intelligence project
set -e
echo "🚀 Setting up Financial Intelligence environment..."
# Check Node version
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d'.' -f1)
if [[ -z "$NODE_VERSION" ]] || [[ "$NODE_VERSION" -lt 18 ]] 2>/dev/null; then
    echo "❌ Node.js version must be >= 18.0.0 (current: $(node --version 2>/dev/null || echo 'not found'))"
    exit 1
fi
echo "✅ Node.js version check passed"
# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null | cut -d'.' -f1)
if [[ -z "$NPM_VERSION" ]] || [[ "$NPM_VERSION" -lt 8 ]] 2>/dev/null; then
    echo "❌ npm version must be >= 8.0.0 (current: $(npm --version 2>/dev/null || echo 'not found'))"
    exit 1
fi
echo "✅ npm version check passed"
# Create data directory if it doesn't exist
if [[ ! -d "data" ]]; then
    mkdir -p data
    echo "✅ Created data directory"
else
    echo "✅ Data directory exists"
fi
# Check for .env.local file
if [[ ! -f ".env.local" ]]; then
    if [[ -f ".env.example" ]]; then
        echo "⚠️  .env.local not found. Please copy .env.example to .env.local and configure it."
        echo "   Run: cp .env.example .env.local"
    else
        echo "⚠️  .env.local not found. Please create it with your environment variables."
    fi
else
    echo "✅ .env.local found"
fi
# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Configure your .env.local file with Supabase and Azure Cosmos DB credentials"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Run 'npm run build' to build for production"
echo ""
