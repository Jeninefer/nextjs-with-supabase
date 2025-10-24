#!/bin/bash

echo "🔧 GitHub Configuration Setup"
echo "============================="

# Prompt for GitHub token
echo ""
echo "📝 Enter your GitHub Personal Access Token:"
echo "   (Generate at: https://github.com/settings/tokens)"
read -s GITHUB_TOKEN

# Verify token
echo ""
echo "🔍 Verifying token..."
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)

if echo "$RESPONSE" | grep -q '"login"'; then
    USERNAME=$(echo "$RESPONSE" | grep '"login"' | cut -d'"' -f4)
    echo "✅ Token valid! Authenticated as: $USERNAME"
    
    # Save to git config
    git config --global github.token "$GITHUB_TOKEN"
    git config --global github.user "$USERNAME"
    
    echo ""
    echo "✅ GitHub configuration saved!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Configure in VS Code: Ctrl+Shift+P → 'GitHub Copilot: Configure'"
    echo "   2. API URL: https://api.github.com"
    echo "   3. Token: $GITHUB_TOKEN"
else
    echo "❌ Invalid token or network error"
    echo "Response: $RESPONSE"
    exit 1
fi
