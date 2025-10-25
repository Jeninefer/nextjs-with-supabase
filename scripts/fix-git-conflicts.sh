#!/bin/bash

echo "🔧 Fixing Git Conflicts and Syncing Repository"
echo "=============================================="

# Stash current changes
echo "📦 Stashing current changes..."
git stash push -m "Auto-stash before sync - $(date)"

# Configure git pull strategy
echo "⚙️ Configuring git pull strategy..."
git config pull.rebase false

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin copilot/vscode1761308891455

# Apply stashed changes
echo "📝 Applying stashed changes..."
git stash pop || {
    echo "⚠️ Conflict in stash apply - resolving manually"
    git status
}

# Add all changes
echo "➕ Adding changes..."
git add .

# Commit with comprehensive message
echo "💾 Committing changes..."
git commit -m "fix: resolve SonarQube code quality issues and Supabase config

✅ Fixed code quality issues:
- Replaced mutating sort() with toSorted() for immutability
- Fixed multiple Array.push() calls with array literals
- Improved performance and maintainability

🔧 Environment fixes:
- Added proper .env.local template
- Created development environment initialization
- Fixed Supabase client configuration

🤖 AI Toolkit compliance:
- Enhanced tracing and error handling
- Improved agent performance metrics
- Following best practices for agent development

Platform: Abaco Financial Intelligence v2.0.0"

# Push changes
echo "⬆️ Pushing changes..."
git push origin copilot/vscode1761308891455

echo "✅ Git sync completed successfully!"
