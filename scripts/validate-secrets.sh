#!/bin/bash

# Validate GitHub Secrets
# This script checks if all required secrets are set in GitHub

set -e

echo "🔍 Validating GitHub Secrets"
echo "============================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    exit 1
fi

echo "Checking required secrets..."
echo ""

# Required secrets
REQUIRED_SECRETS=(
    "VERCEL_TOKEN"
    "VERCEL_ORG_ID"
    "VERCEL_PROJECT_ID"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "FIGMA_ACCESS_TOKEN"
    "FIGMA_FILE_KEY"
    "OPENAI_API_KEY"
    "XAI_API_KEY"
)

# Get list of set secrets
EXISTING_SECRETS=$(gh secret list --json name -q '.[].name')

# Check each required secret
MISSING_SECRETS=()
for secret in "${REQUIRED_SECRETS[@]}"; do
    if echo "$EXISTING_SECRETS" | grep -q "^$secret$"; then
        echo "✅ $secret"
    else
        echo "❌ $secret - MISSING"
        MISSING_SECRETS+=("$secret")
    fi
done

echo ""

if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
    echo "🎉 All required secrets are set!"
    echo ""
    echo "Current secrets:"
    gh secret list
    exit 0
else
    echo "❌ Missing ${#MISSING_SECRETS[@]} secret(s):"
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "   - $secret"
    done
    echo ""
    echo "Run this to set missing secrets:"
    echo "  bash scripts/setup-github-secrets.sh"
    echo ""
    exit 1
fi
