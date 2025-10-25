#!/bin/bash

echo "🔧 Clearing Google Cloud Environment Variables"
echo "=============================================="

# Step 1: Unset all Google Cloud related environment variables
echo "📝 Unsetting Google Cloud environment variables..."

# List of Google Cloud environment variables that might interfere
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

# Unset each variable
for var in "${GOOGLE_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "  ✓ Unsetting $var"
        unset "$var"
    fi
done

echo "✅ Google Cloud environment variables cleared!"
echo ""
echo "🔍 Verifying environment is clean..."
env | grep -E "^(GOOGLE_|GCLOUD_|CLOUDSDK_|GCP_|DATAPROC_)" | grep -v "CHROME_BIN" || echo "✅ No Google Cloud variables found"
echo ""
echo "✅ Environment is now clean and ready for ABACO development!"
