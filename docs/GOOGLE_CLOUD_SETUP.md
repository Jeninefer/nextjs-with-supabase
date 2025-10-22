# Google Cloud Setup Guide for ABACO Financial Intelligence Platform

## Overview

This guide provides step-by-step instructions for configuring Google Cloud SDK (gcloud) to deploy the ABACO Financial Intelligence Platform to Google Cloud Run, including how to resolve quota project warnings and manage separate configurations.

## Prerequisites

- Google Cloud SDK installed ([Installation Guide](https://cloud.google.com/sdk/docs/install))
- A Google Cloud Platform account
- Access to the `archivo-comercial` project (or your specific GCP project)
- Appropriate IAM permissions for Cloud Run deployment

## Quick Setup

### 1. Create Separate gcloud Configuration for ABACO

Creating a separate configuration keeps your ABACO project settings isolated from other projects:

```bash
# Create a new configuration for ABACO
gcloud config configurations create abaco-config

# Activate the ABACO configuration
gcloud config configurations activate abaco-config

# Set your account
gcloud config set account jeninefer@abacocapital.co

# Set your project
gcloud config set project archivo-comercial
```

**Note**: If you get an error that `abaco-config` already exists, you can skip the creation step and just activate it.

### 2. Resolve Quota Project Warning

The warning about quota project mismatch occurs when your Application Default Credentials (ADC) have a different quota project than your active project. To fix this:

```bash
# Set the quota project to match your active project
gcloud auth application-default set-quota-project archivo-comercial

# Re-authenticate Application Default Credentials
gcloud auth application-default login
```

### 3. Verify Configuration

```bash
# Check active configuration
gcloud config configurations list

# Verify current settings
gcloud config list

# Test authentication
gcloud auth list
```

## Detailed Configuration Steps

### Managing Multiple Configurations

If you work with multiple Google Cloud projects, you can switch between them easily:

```bash
# List all configurations
gcloud config configurations list

# Create a new configuration
gcloud config configurations create <config-name>

# Switch to a different configuration
gcloud config configurations activate <config-name>

# Delete a configuration
gcloud config configurations delete <config-name>
```

### Setting Up Application Default Credentials

Application Default Credentials (ADC) are used by client libraries to authenticate with Google Cloud services:

```bash
# Login with ADC (this will open a browser)
gcloud auth application-default login

# Set quota project for ADC
gcloud auth application-default set-quota-project archivo-comercial

# Verify ADC location
# ADC file is typically stored at:
# - Linux/macOS: ~/.config/gcloud/application_default_credentials.json
# - Windows: %APPDATA%\gcloud\application_default_credentials.json
```

### Enable Required APIs

Before deploying to Cloud Run, ensure the necessary APIs are enabled:

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API (for storing container images)
gcloud services enable containerregistry.googleapis.com

# Enable Artifact Registry API (recommended over Container Registry)
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Build API (for building containers)
gcloud services enable cloudbuild.googleapis.com

# List all enabled services
gcloud services list --enabled
```

## Deploying ABACO to Google Cloud Run

### Basic Deployment

```bash
# Ensure you're using the correct configuration
gcloud config configurations activate abaco-config

# Deploy from source (Cloud Build will create a container automatically)
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --platform managed
```

### Advanced Deployment Options

```bash
# Deploy with custom settings
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-key"
```

### Using Environment Variables from File

```bash
# Create an env.yaml file
cat > env.yaml << EOF
NEXT_PUBLIC_SUPABASE_URL: your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: your-anon-key
EOF

# Deploy with environment file
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --env-vars-file env.yaml
```

## Troubleshooting

### Error: Configuration Already Exists

**Problem**: 
```
ERROR: (gcloud.config.configurations.create) Cannot create configuration [abaco-config], it already exists.
```

**Solution**:
```bash
# Simply activate the existing configuration
gcloud config configurations activate abaco-config
```

### Warning: Quota Project Mismatch

**Problem**:
```
WARNING: Your active project does not match the quota project in your local Application Default Credentials file.
```

**Solution**:
```bash
# Option 1: Update ADC quota project
gcloud auth application-default set-quota-project archivo-comercial

# Option 2: Re-authenticate ADC
gcloud auth application-default login

# Option 3: Revoke and re-login
gcloud auth application-default revoke
gcloud auth application-default login
```

### Command Not Found: gcloud

**Problem**:
```
zsh: command not found: gcloud
```

**Solution**:
```bash
# Install gcloud CLI
# macOS (using Homebrew)
brew install --cask google-cloud-sdk

# Or download from Google Cloud
# https://cloud.google.com/sdk/docs/install

# Add to PATH (if needed)
echo 'source /usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.zsh.inc' >> ~/.zshrc
source ~/.zshrc
```

### Permission Denied Errors

**Problem**: Insufficient permissions to deploy or access resources.

**Solution**:
```bash
# Check your current IAM roles
gcloud projects get-iam-policy archivo-comercial \
  --flatten="bindings[].members" \
  --filter="bindings.members:jeninefer@abacocapital.co"

# Required roles for Cloud Run deployment:
# - roles/run.admin
# - roles/iam.serviceAccountUser
# - roles/cloudbuild.builds.editor

# Contact your GCP administrator to grant these roles if missing
```

### Build Failures

**Problem**: Cloud Build fails when deploying from source.

**Solution**:
```bash
# Check Cloud Build logs
gcloud builds list --limit=5

# View specific build details
gcloud builds describe <BUILD_ID>

# Ensure Dockerfile or buildpack detection works
# For Next.js, Google Cloud Buildpacks should auto-detect

# Manual build and deploy (alternative approach)
gcloud builds submit --tag gcr.io/archivo-comercial/abaco-platform
gcloud run deploy abaco-platform --image gcr.io/archivo-comercial/abaco-platform --region us-central1
```

## Best Practices

### 1. Use Separate Configurations for Each Project

```bash
# Work configuration
gcloud config configurations create work-config
gcloud config set account work@company.com
gcloud config set project work-project-id

# Personal configuration
gcloud config configurations create personal-config
gcloud config set account personal@gmail.com
gcloud config set project personal-project-id

# ABACO configuration
gcloud config configurations create abaco-config
gcloud config set account jeninefer@abacocapital.co
gcloud config set project archivo-comercial
```

### 2. Keep ADC in Sync

Always ensure your Application Default Credentials quota project matches your active project:

```bash
# After switching configurations, update ADC quota project
gcloud auth application-default set-quota-project $(gcloud config get-value project)
```

### 3. Secure Your Credentials

```bash
# Never commit credentials to version control
echo "application_default_credentials.json" >> .gitignore

# Use Secret Manager for sensitive values
gcloud secrets create abaco-supabase-url --data-file=-
# Enter your secret value, then press Ctrl+D

# Access secrets in Cloud Run
gcloud run deploy abaco-platform \
  --set-secrets=NEXT_PUBLIC_SUPABASE_URL=abaco-supabase-url:latest
```

### 4. Monitor Costs and Quotas

```bash
# Check current quota usage
gcloud compute project-info describe --project=archivo-comercial

# Set up budget alerts in Google Cloud Console:
# https://console.cloud.google.com/billing/budgets

# Monitor Cloud Run costs
gcloud run services list --platform managed
```

## Configuration Script

Create a reusable setup script `setup_gcloud_abaco.sh`:

```bash
#!/bin/bash

echo "🚀 Setting up Google Cloud for ABACO Platform"
echo "=============================================="

# Configuration name
CONFIG_NAME="abaco-config"
ACCOUNT="jeninefer@abacocapital.co"
PROJECT="archivo-comercial"

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
gcloud auth application-default set-quota-project $PROJECT 2>/dev/null || echo "⚠ ADC quota project update requires re-authentication"

# Enable required APIs
echo "✓ Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

echo ""
echo "✅ Google Cloud configuration complete!"
echo ""
echo "To resolve any quota warnings, run:"
echo "  gcloud auth application-default login"
echo ""
echo "To deploy ABACO platform, run:"
echo "  gcloud run deploy abaco-platform --source . --region us-central1"
```

Make it executable and run:

```bash
chmod +x setup_gcloud_abaco.sh
./setup_gcloud_abaco.sh
```

## Verification Checklist

After setup, verify everything is configured correctly:

- [ ] Configuration is active: `gcloud config configurations list`
- [ ] Account is set: `gcloud config get-value account`
- [ ] Project is set: `gcloud config get-value project`
- [ ] ADC is authenticated: `gcloud auth application-default print-access-token`
- [ ] Required APIs are enabled: `gcloud services list --enabled`
- [ ] No quota warnings appear when running gcloud commands
- [ ] Can successfully deploy to Cloud Run: `gcloud run deploy --help`

## Additional Resources

- [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Managing gcloud Configurations](https://cloud.google.com/sdk/docs/configurations)
- [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)

## Support

For ABACO-specific deployment issues:
- Technical Support: Please open an issue in the [ABACO GitHub repository](https://github.com/abaco-platform/abaco/issues) or contact your ABACO account representative.
- Documentation: See `/docs` folder in repository

For Google Cloud issues:
- [Google Cloud Support](https://cloud.google.com/support)
- [Stack Overflow - google-cloud-platform](https://stackoverflow.com/questions/tagged/google-cloud-platform)

---

*This guide is part of the ABACO Financial Intelligence Platform deployment documentation.*
