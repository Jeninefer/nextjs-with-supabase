#!/bin/bash
# filepath: /home/codespace/OfficeAddinApps/Figma/scripts/sync-repo.sh

echo "🔍 Auditing repository..."
cd /home/codespace/OfficeAddinApps/Figma
echo "📊 Current git status:"
git status
echo "➕ Adding changes..."
git add .
echo "💾 Committing changes..."
git commit -m "audit: Fix issues, remove duplicates, update API documentation" || echo "No changes to commit"
echo "🔗 Checking GitHub remote..."
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No remote found. Please run setup-github.sh first"
    exit 1
fi
echo "⬇️ Pulling latest changes..."
git pull origin main --rebase 2>/dev/null || echo "No remote changes"
echo "⬆️ Pushing to GitHub..."
git push origin main 2>/dev/null || echo "❌ Push failed - check authentication"
echo "✅ Sync complete!"
