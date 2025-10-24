#!/bin/bash

cd /home/codespace/OfficeAddinApps/Figma

echo "🔧 Completing Git Rebase"
echo "======================="

# Stage all modified and new files
git add .github/GITHUB_SETUP.md
git add .github/workflows/deploy.yml
git add .vscode/extensions.json
git add .vscode/settings.json
git add AI_APIS.md
git add LICENSE
git add README.md
git add lib/ai-api.ts
git add scripts/*.sh
git add supabase/.gitignore
git add supabase/config.toml

# Remove deleted files from git
git rm build.log 2>/dev/null || true
git rm supabase/functions/summarize-thread/index.ts 2>/dev/null || true

# Commit the changes
git commit --amend --no-edit

# Continue the rebase
git rebase --continue

echo ""
echo "✅ Rebase complete!"
echo ""
echo "Next steps:"
echo "  git push origin HEAD:copilot/vscode1761308891455"
