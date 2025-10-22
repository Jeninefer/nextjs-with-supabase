#!/bin/bash

echo "🧹 ABACO Repository Cleanup & Supabase Fix"
echo "=========================================="

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# 1. Find and remove duplicate files
echo "🔍 Scanning for duplicate files..."

# Remove duplicate Tailwind configs if any
find . -name "tailwind.config.*" -type f | head -n -1 | xargs rm -f

# Remove duplicate package files
find . -name "package-lock.json" -type f | head -n -1 | xargs rm -f

# Remove duplicate environment files
find . -name ".env*" -type f -not -name ".env.local" -not -name ".env.example" | head -n -1 | xargs rm -f

# Remove temporary and cache files
rm -rf .next/cache
rm -rf node_modules/.cache
rm -rf notebooks/__pycache__
rm -rf abaco_venv/lib/python*/site-packages/__pycache__

# 2. Clean up notebook outputs and temporary files
echo "📊 Cleaning notebook files..."
find notebooks/ -name "*.pyc" -delete
find notebooks/ -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# 3. Fix Supabase setup
echo "🗄️ Setting up Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Stop any running Supabase instances
echo "🛑 Stopping existing Supabase instances..."
supabase stop --no-backup 2>/dev/null || true

# Start fresh Supabase instance
echo "🚀 Starting fresh Supabase instance..."
supabase start

# 4. Fix environment variables
echo "🔧 Updating environment configuration..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cat > .env.local << EOF
# ABACO Financial Intelligence Platform Environment
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ABACO Configuration
ABACO_ENVIRONMENT=development
ABACO_VERSION=1.0.0
EOF
fi

# 5. Update Git repository
echo "📝 Updating Git repository..."
git add .
git status

echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check Supabase status: supabase status"
echo "2. Update .env.local with actual Supabase keys"
echo "3. Test connection: npm run dev"
echo "4. Commit changes: git commit -m 'feat: cleanup repository and fix Supabase setup'"
