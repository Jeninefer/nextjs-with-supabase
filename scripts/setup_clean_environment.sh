#!/bin/bash

echo "🚀 ABACO Clean Environment Setup"
echo "================================="
echo ""
echo "This script ensures your development environment is free from"
echo "Google Cloud interference and ready for ABACO development."
echo ""

# Step 1: Clear Google Cloud environment variables
echo "Step 1: Clearing Google Cloud Environment Variables"
echo "---------------------------------------------------"

GOOGLE_VARS=(
    "GOOGLE_APPLICATION_CREDENTIALS"
    "GOOGLE_CLOUD_PROJECT"
    "GCLOUD_PROJECT"
    "GOOGLE_CLOUD_QUOTA_PROJECT"
    "CLOUDSDK_CORE_PROJECT"
    "CLOUDSDK_COMPUTE_REGION"
    "CLOUDSDK_COMPUTE_ZONE"
    "CLOUDSDK_CONFIG"
    "CLOUDSDK_ACTIVE_CONFIG_NAME"
    "GOOGLE_CLOUD_REGION"
    "GOOGLE_CLOUD_ZONE"
    "GCP_PROJECT"
    "DATAPROC_REGION"
    "DATAPROC_CLUSTER_NAME"
)

for var in "${GOOGLE_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "  ✓ Unsetting $var"
        unset "$var"
    fi
done

echo "✅ Google Cloud variables cleared"
echo ""

# Step 2: Disable gcloud auto-configuration
echo "Step 2: Disabling gcloud Auto-Configuration"
echo "-------------------------------------------"

export CLOUDSDK_CORE_DISABLE_PROMPTS=1
export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1
echo "  ✓ Disabled gcloud prompts"
echo "  ✓ Disabled usage reporting"
echo "✅ gcloud auto-configuration disabled"
echo ""

# Step 3: Update shell configuration
echo "Step 3: Shell Configuration"
echo "---------------------------"

SHELL_CONFIG=""
if [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
fi

if [ -n "$SHELL_CONFIG" ] && [ -f "$SHELL_CONFIG" ]; then
    # Check if ABACO configuration already exists
    if ! grep -q "# ABACO: Prevent Google Cloud auto-configuration" "$SHELL_CONFIG"; then
        echo "  ℹ️  Adding ABACO configuration to $SHELL_CONFIG"
        echo ""
        if [ "${ABACO_AUTO_CONFIGURE}" = "true" ]; then
            add_abaco_config="y"
            echo "  (ABACO_AUTO_CONFIGURE=true detected, auto-adding configuration)"
        else
            read -r -p "  Would you like to add the following to $SHELL_CONFIG? (y/n) " add_abaco_config
        fi
        
        if [[ "$add_abaco_config" =~ ^[Yy]$ ]]; then
            {
                echo ""
                echo "# ABACO: Prevent Google Cloud auto-configuration"
                echo "export CLOUDSDK_CORE_DISABLE_PROMPTS=1"
                echo "export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1"
            } >> "$SHELL_CONFIG"
            echo "  ✓ ABACO configuration added to $SHELL_CONFIG"
        else
            echo "  ℹ️  Skipped adding ABACO configuration. You can manually add these lines later if needed."
        fi
    else
        echo "  ✓ ABACO configuration already present in $SHELL_CONFIG"
    fi
fi

echo "✅ Shell configuration checked"
echo ""

# Step 4: Verify environment is clean
echo "Step 4: Verifying Environment"
echo "------------------------------"

GOOGLE_ENV=$(env | grep -E "^(GOOGLE_|GCLOUD_|CLOUDSDK_|GCP_|DATAPROC_)" | grep -v "CHROME_BIN" || true)
if [ -z "$GOOGLE_ENV" ]; then
    echo "✅ No Google Cloud environment variables found"
else
    echo "⚠️  Some Google Cloud variables still present:"
    echo "$GOOGLE_ENV"
fi

echo ""

# Step 5: Success message
echo "🎉 Environment Setup Complete!"
echo "=============================="
echo ""
echo "✅ Your environment is now clean and ready for ABACO development!"
echo ""
echo "📋 WHAT ABACO ACTUALLY USES:"
echo "  • Next.js 15 (Node.js runtime)"
echo "  • Supabase (PostgreSQL database)"
echo "  • Python virtual environment (for analytics)"
echo "  • Local development server (no cloud dependencies)"
echo ""
echo "🚀 NEXT STEPS:"
echo "  1. Start Next.js: npm run dev"
echo "  2. Run Python analysis: ./run_financial_analysis.sh"
echo "  3. Open http://localhost:3000"
echo ""

# Try to add the configuration to the user's shell profile automatically
ADDED_TO_PROFILE="false"
PROFILE_FILE=""
if [ -n "$ZSH_VERSION" ]; then
  PROFILE_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  PROFILE_FILE="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
  PROFILE_FILE="$HOME/.bash_profile"
fi

if [ -n "$PROFILE_FILE" ] && [ -w "$PROFILE_FILE" ]; then
  # Only add if not already present
  if ! grep -q "ABACO: Prevent Google Cloud auto-configuration" "$PROFILE_FILE"; then
    {
      echo ""
      echo "# ABACO: Prevent Google Cloud auto-configuration"
      echo "export CLOUDSDK_CORE_DISABLE_PROMPTS=1"
      echo "export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1"
    } >> "$PROFILE_FILE"
    ADDED_TO_PROFILE="true"
    echo "✅ Added Google Cloud config disables to $PROFILE_FILE"
  else
    ADDED_TO_PROFILE="true"
    echo "✅ Google Cloud config disables already present in $PROFILE_FILE"
  fi
fi
if [ "$ADDED_TO_PROFILE" != "true" ]; then
  echo "💡 To make these changes permanent, add the following to your ~/.bashrc or ~/.zshrc:"
  echo ""
  echo "    # ABACO: Prevent Google Cloud auto-configuration"
  echo "    export CLOUDSDK_CORE_DISABLE_PROMPTS=1"
  echo "    export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1"
  echo ""
fi
