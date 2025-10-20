#!/bin/bash

echo "🔄 Committing ABACO Financial Intelligence changes..."

# Add all modified, new, and deleted files
git add -A

# Commit with descriptive message
git commit -m "feat: add generated charts and utility scripts

- Include interactive HTML visualizations for financial data
- Add environment activation and commit helper scripts
- Update ABACO platform with latest analysis results"

# Push to remote
git push

echo "✅ All changes committed and pushed successfully!"
