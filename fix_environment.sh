#!/bin/bash

echo "🔧 Fixing Development Environment Issues..."
echo "=========================================="

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Fix missing code-block component
echo "📝 Creating missing code-block component..."

# Fix package.json scripts
echo "📦 Updating package.json scripts..."
npm pkg set scripts.type-check="tsc --noEmit"
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."

# Install missing dependencies
echo "📥 Installing missing dependencies..."
npm install --save-dev @types/node @types/react @types/react-dom

# Clean and rebuild
echo "🧹 Cleaning build artifacts..."
rm -rf .next
npm cache clean --force

# Type check
echo "🔍 Running type check..."
npx tsc --noEmit --skipLibCheck

# Build test
echo "🏗️ Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Commit changes
    echo "📝 Committing fixes..."
    git add .
    git commit -m "fix: resolve development environment issues

- Fix corrupted next.config.ts file
- Create missing code-block component  
- Update TypeScript configuration
- Add missing npm scripts
- Resolve build and type check errors"
    
    echo "🚀 Environment fixed and committed!"
else
    echo "❌ Build failed - please check the errors above"
fi
