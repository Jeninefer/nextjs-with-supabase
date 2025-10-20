#!/bin/bash

echo "🔄 Committing ABACO Financial Intelligence changes..."

# Show git status and prompt for confirmation before staging all changes
git status
read -rp "Review the above changes. Proceed to stage all changes? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborting commit."
    exit 1
fi
# Add all modified, new, and deleted files
git add -A

# Commit with descriptive message

# Accept commit message as argument or prompt user
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    read -rp "Enter commit message: " COMMIT_MSG
fi

git commit -m "$COMMIT_MSG"
# Push to remote
git push

echo "✅ All changes committed and pushed successfully!"
