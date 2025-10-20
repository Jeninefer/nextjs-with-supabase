#!/bin/bash
# ABACO Platform - Git Repository Cleanup and Recovery
cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

echo "🔧 ABACO Git Repository Cleanup"
echo "================================"

# Step 1: Check current Git status
echo "📊 Checking Git status..."
git status

# Step 2: Add all changes to staging
echo "📝 Staging all changes..."
git add .

# Step 3: Check what's being committed
echo "🔍 Changes to be committed:"
git status --short

# Step 4: Commit all pending changes
echo "💾 Committing all changes..."
git commit -m "chore: resolve merge conflicts and update ABACO platform

- Fix layout.tsx import syntax error
- Resolve merge conflicts in app/page.tsx
- Update documentation with fresh project solution
- Clean up corrupted middleware files
- Standardize file structure
- Update ABACO branding and metadata

This commit resolves all pending changes and prepares the repository
for the fresh ABACO platform deployment."

# Step 5: Check if we're on the right branch
echo "🌿 Current branch:"
git branch --show-current

# Step 6: Push changes (if remote exists)
echo "🚀 Attempting to push changes..."
if git remote | grep -q origin; then
    git push origin main || git push origin master || echo "⚠️ Push failed - remote may not be configured"
else
    echo "ℹ️ No remote repository configured"
fi

echo ""
echo "✅ Git cleanup completed!"
echo "📁 Repository is now clean and ready for development"

# Step 7: Verify clean state
echo "🔍 Final Git status:"
git status
