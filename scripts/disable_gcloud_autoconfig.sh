#!/bin/bash

echo "🔧 Disabling gcloud Auto-Configuration"
echo "======================================"

# Step 1: Disable gcloud command completion and path modifications
echo "📝 Disabling gcloud auto-configuration..."

# Check if gcloud SDK path exists in common locations
GCLOUD_PATHS=(
    "$HOME/google-cloud-sdk"
    "/usr/local/Caskroom/google-cloud-sdk"
    "/opt/google-cloud-sdk"
    "/usr/lib/google-cloud-sdk"
)

GCLOUD_PATH=""
for path in "${GCLOUD_PATHS[@]}"; do
    if [ -d "$path" ]; then
        GCLOUD_PATH="$path"
        echo "  Found gcloud SDK at: $path"
        break
    fi
done

if [ -z "$GCLOUD_PATH" ]; then
    echo "  ℹ️  gcloud SDK not found - no action needed"
else
    # Disable gcloud initialization scripts
    export CLOUDSDK_CORE_DISABLE_PROMPTS=1
    export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1
    echo "  ✓ Disabled gcloud prompts and usage reporting"
fi

echo "✅ gcloud auto-configuration disabled!"
echo ""
echo "💡 To make this permanent, add these lines to your shell configuration:"
echo "   export CLOUDSDK_CORE_DISABLE_PROMPTS=1"
echo "   export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1"
