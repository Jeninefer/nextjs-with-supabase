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
COMMIT_EXIT_CODE=$?
if [ $COMMIT_EXIT_CODE -ne 0 ]; then
    echo "❌ Commit failed. Aborting push."
    exit $COMMIT_EXIT_CODE
fi

# Pull latest changes with rebase before pushing
git pull --rebase
PULL_EXIT_CODE=$?
if [ $PULL_EXIT_CODE -ne 0 ]; then
    echo "❌ git pull --rebase failed. Please resolve any conflicts and try again."
    exit $PULL_EXIT_CODE
fi

# Push to remote
git push
PUSH_EXIT_CODE=$?
if [ $PUSH_EXIT_CODE -ne 0 ]; then
    echo "❌ Push failed. Please check the error above."
    exit $PUSH_EXIT_CODE
fi

echo "✅ All changes committed and pushed successfully!"
