#!/bin/bash

# GitHub Secrets Setup Script
# This script helps you add all required secrets to GitHub

set -e

echo "🔐 GitHub Secrets Setup Script"
echo "================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔑 Please authenticate with GitHub..."
    gh auth login
fi

echo "✅ GitHub CLI is authenticated"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local description=$2
    
    echo "📝 Setting $secret_name"
    echo "   $description"
    echo -n "   Enter value (input hidden): "
    gh secret set "$secret_name"
    echo "   ✅ $secret_name set successfully"
    echo ""
}

echo "This script will guide you through setting up all required GitHub secrets."
echo ""
echo "Required secrets:"
echo "  1. VERCEL_TOKEN - Vercel authentication token"
echo "  2. VERCEL_ORG_ID - Vercel organization ID"
echo "  3. VERCEL_PROJECT_ID - Vercel project ID"
echo "  4. SUPABASE_URL - Supabase project URL"
echo "  5. SUPABASE_ANON_KEY - Supabase anonymous key"
echo "  6. FIGMA_ACCESS_TOKEN - Figma personal access token"
echo "  7. FIGMA_FILE_KEY - Figma file key"
echo "  8. OPENAI_API_KEY - OpenAI API key"
echo "  9. XAI_API_KEY - xAI (Grok) API key"
echo ""

read -p "Ready to start? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🚀 Let's begin!"
echo ""

# Vercel secrets
echo "--- Vercel Configuration ---"
set_secret "VERCEL_TOKEN" "Get from: https://vercel.com/account/tokens"
set_secret "VERCEL_ORG_ID" "Found in .vercel/project.json"
set_secret "VERCEL_PROJECT_ID" "Found in .vercel/project.json"

# Supabase secrets
echo "--- Supabase Configuration ---"
set_secret "SUPABASE_URL" "Get from: Supabase Dashboard → Settings → API"
set_secret "SUPABASE_ANON_KEY" "Get from: Supabase Dashboard → Settings → API"

# Figma secrets
echo "--- Figma Configuration ---"
set_secret "FIGMA_ACCESS_TOKEN" "Get from: https://www.figma.com/settings"
set_secret "FIGMA_FILE_KEY" "Extract from your Figma file URL"

# AI API secrets
echo "--- AI APIs Configuration ---"
set_secret "OPENAI_API_KEY" "Get from: https://platform.openai.com/api-keys"
set_secret "XAI_API_KEY" "Get from: https://console.x.ai/"

echo ""
echo "✅ All secrets have been set!"
echo ""
echo "Verifying secrets..."
gh secret list
echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Commit and push your code: git push origin main"
echo "  2. Check GitHub Actions: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo "  3. Monitor your deployment"
echo ""
