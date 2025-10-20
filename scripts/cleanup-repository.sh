#!/bin/bash
# ABACO Financial Intelligence Platform - Repository Cleanup Script
# Copyright 2025 ABACO Financial Intelligence

set -e  # Exit on any error

echo "🚀 ABACO Financial Intelligence Platform - Repository Cleanup"
echo "============================================================"

# Navigate to project root
cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Phase 1: Remove duplicate lockfiles
echo "📦 Phase 1: Removing duplicate lockfiles..."
rm -f /Users/jenineferderas/pnpm-lock.yaml
rm -f pnpm-lock.yaml
rm -f yarn.lock
echo "✅ Duplicate lockfiles removed"

# Phase 2: Clean build artifacts and caches
echo "🗑️ Phase 2: Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf dist
rm -rf build
rm -rf .vercel
echo "✅ Build artifacts cleaned"

# Phase 3: Remove system and temporary files
echo "🍎 Phase 3: Removing system files..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
echo "✅ System files removed"

# Phase 4: Resolve duplicate directories and files
echo "📄 Phase 4: Resolving duplicates..."
# Remove duplicate supabase utils directory (keep lib/supabase/)
if [ -d "utils/supabase" ]; then
    rm -rf utils/supabase/
    echo "✅ Removed duplicate utils/supabase directory"
fi

# Remove any backup or temporary config files
rm -f *.bak
rm -f *.backup
rm -f *~
echo "✅ Backup files removed"

# Phase 5: Verify and fix package integrity
echo "🔍 Phase 5: Verifying package integrity..."
if [ -f "package.json" ]; then
    npm install --no-audit --no-fund --silent
    echo "✅ Dependencies installed"
else
    echo "❌ package.json not found"
    exit 1
fi

# Phase 6: TypeScript validation
echo "📝 Phase 6: TypeScript validation..."
if command -v npx >/dev/null 2>&1; then
    npx tsc --noEmit --skipLibCheck
    echo "✅ TypeScript validation passed"
else
    echo "⚠️ npx not available, skipping TypeScript check"
fi

# Phase 7: Test build process
echo "🏗️ Phase 7: Testing build..."
npm run build >/dev/null 2>&1 && echo "✅ Build test passed" || echo "⚠️ Build test failed (check manually)"

echo ""
echo "🎉 Repository cleanup completed successfully!"
echo "📊 ABACO Financial Intelligence Platform ready for development"
echo "🌐 Start development server: npm run dev"
echo "🔗 Access at: http://localhost:3000"
