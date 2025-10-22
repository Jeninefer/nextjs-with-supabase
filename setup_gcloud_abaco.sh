#!/bin/bash

echo "🚀 Setting up Google Cloud for ABACO Platform"
echo "=============================================="

# Configuration name
CONFIG_NAME="abaco-config"
ACCOUNT="jeninefer@abacocapital.co"
PROJECT="archivo-comercial"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if configuration exists
if gcloud config configurations describe $CONFIG_NAME &>/dev/null; then
    echo "✓ Configuration '$CONFIG_NAME' already exists"
    gcloud config configurations activate $CONFIG_NAME
else
    echo "✓ Creating configuration '$CONFIG_NAME'"
    gcloud config configurations create $CONFIG_NAME
fi

# Set account and project
echo "✓ Setting account to $ACCOUNT"
gcloud config set account $ACCOUNT

echo "✓ Setting project to $PROJECT"
gcloud config set project $PROJECT

# Fix quota project warning
echo "✓ Setting ADC quota project"
if gcloud auth application-default set-quota-project $PROJECT 2>/dev/null; then
    echo "✓ ADC quota project set successfully"
else
    echo "⚠ ADC quota project update requires re-authentication"
    echo "  Run: gcloud auth application-default login"
fi

# Enable required APIs
echo "✓ Enabling required APIs..."
echo "  - Cloud Run API"
gcloud services enable run.googleapis.com --quiet
echo "  - Cloud Build API"
gcloud services enable cloudbuild.googleapis.com --quiet
echo "  - Artifact Registry API"
gcloud services enable artifactregistry.googleapis.com --quiet

echo ""
echo "✅ Google Cloud configuration complete!"
echo ""
echo "📋 Current Configuration:"
echo "  Account:  $(gcloud config get-value account 2>/dev/null)"
echo "  Project:  $(gcloud config get-value project 2>/dev/null)"
echo "  Config:   $(gcloud config configurations list --filter='is_active:true' --format='value(name)' 2>/dev/null)"
echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. If you see quota warnings, authenticate ADC:"
echo "   gcloud auth application-default login"
echo ""
echo "2. To deploy ABACO platform to Cloud Run:"
echo "   gcloud run deploy abaco-platform --source . --region us-central1 --allow-unauthenticated"
echo ""
echo "3. To set environment variables:"
echo "   gcloud run deploy abaco-platform --source . --region us-central1 \\"
echo "     --set-env-vars=\"NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-key\""
echo ""
echo "📚 For detailed documentation, see: docs/GOOGLE_CLOUD_SETUP.md"
