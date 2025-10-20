#!/bin/bash

echo "🔄 ABACO Repository Synchronization Script"
echo "=========================================="

# Navigate to project directory
cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Show current branch and status
echo "📍 Current branch: $(git branch --show-current)"
echo "📊 Repository status:"
git status --porcelain

# Pull latest changes from remote
echo ""
echo "⬇️ Pulling latest changes from remote..."
if git pull origin $(git branch --show-current); then
    echo "✅ Successfully pulled latest changes"
else
    echo "⚠️ Pull completed with conflicts - please resolve manually"
    echo "Run 'git status' to see conflicted files"
    exit 1
fi

# Stage all changes
echo ""
echo "📋 Staging all changes..."
git add .

# Check if there are staged changes
if git diff --cached --quiet; then
    echo "ℹ️ No changes to commit"
else
    # Show what will be committed
    echo "📝 Changes to be committed:"
    git diff --cached --name-only

    # Commit with comprehensive message
    echo ""
    echo "💾 Creating commit..."
    git commit -m "fix: comprehensive development environment updates

🔧 Environment Fixes:
- Resolve CS-Script tool detection issues
- Fix Tailwind CSS configuration loading errors
- Configure TypeScript default formatter settings
- Add comprehensive troubleshooting documentation

🚀 Improvements:
- Enhanced error handling and diagnostics
- Updated installation and configuration steps
- Added automated sync workflows
- Improved development experience

📚 Documentation:
- Complete troubleshooting guide
- Step-by-step resolution instructions
- Git workflow integration
- Environment reset procedures"

    echo "✅ Commit created successfully"
fi

# Push changes to remote
echo ""
echo "⬆️ Pushing changes to remote repository..."
if git push origin $(git branch --show-current); then
    echo "✅ Successfully pushed to remote repository"
else
    echo "❌ Failed to push to remote repository"
    echo "Please check your network connection and repository permissions"
    exit 1
fi

# Final status check
echo ""
echo "🏁 Synchronization Complete!"
echo "📊 Final repository status:"
git log --oneline -3
echo ""
echo "🌟 Repository is now synchronized with GitHub!"
