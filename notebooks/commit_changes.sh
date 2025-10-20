#!/bin/bash

echo "🔄 Committing ABACO Financial Intelligence changes..."

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
