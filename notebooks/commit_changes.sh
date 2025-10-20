#!/bin/bash

echo "🔄 Committing ABACO Financial Intelligence changes..."

# Add all modified and new files
git add notebooks/charts/
git add notebooks/activate_env.sh
git add notebooks/commit_changes.sh
git add commit_changes.sh
git add activate_env.sh

# Commit with descriptive message
git commit -m "feat: add generated charts and utility scripts

- Include interactive HTML visualizations for financial data
- Add environment activation and commit helper scripts
- Update ABACO platform with latest analysis results"

# Push to remote
git push

echo "✅ All changes committed and pushed successfully!"
