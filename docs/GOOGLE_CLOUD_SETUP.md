# Google Cloud Platform Setup Guide

This guide provides comprehensive instructions for setting up Google Cloud Platform (GCP) integration with the ABACO Financial Intelligence Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [API Configuration](#api-configuration)
4. [IAM Permissions](#iam-permissions)
5. [Common Issues](#common-issues)
6. [Deployment Options](#deployment-options)

## Prerequisites

Before starting, ensure you have:

- A Google Cloud account ([Sign up here](https://cloud.google.com/))
- Billing enabled on your Google Cloud account
- `gcloud` CLI installed ([Installation guide](https://cloud.google.com/sdk/docs/install))
- Owner or Editor role on your Google Cloud project

## Project Setup

### 1. Create a New Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create YOUR-PROJECT-ID --name="ABACO Financial Platform"

# Set the project as default
gcloud config set project YOUR-PROJECT-ID

# Enable billing (replace BILLING_ACCOUNT_ID with your billing account)
gcloud billing projects link YOUR-PROJECT-ID --billing-account=BILLING_ACCOUNT_ID
```

### 2. Verify Project Access

```bash
# Check current project
gcloud config get-value project

# List your projects
gcloud projects list

# Verify you have necessary permissions
gcloud projects get-iam-policy YOUR-PROJECT-ID
```

## API Configuration

### Required APIs for ABACO Platform

The following APIs are required based on your deployment and feature needs:

#### For Basic Deployment (Cloud Run)

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

#### For AI/ML Features

```bash
# Enable AI Platform APIs
gcloud services enable aiplatform.googleapis.com

# Enable Generative Language API (for AI insights)
gcloud services enable generativelanguage.googleapis.com

# Enable Natural Language API (for text analysis)
gcloud services enable language.googleapis.com
```

#### For Data Processing (Optional)

```bash
# Enable Cloud Dataproc API (for big data processing)
gcloud services enable dataproc.googleapis.com

# Enable BigQuery API (for data analytics)
gcloud services enable bigquery.googleapis.com

# Enable Cloud Storage API
gcloud services enable storage-api.googleapis.com
```

### Enable APIs via Console

Alternatively, enable APIs through the Google Cloud Console:

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project from the dropdown
3. Go to **APIs & Services > Library**
4. Search for the required API
5. Click **Enable**

### Verify API Status

```bash
# List enabled APIs
gcloud services list --enabled

# Check if specific API is enabled
gcloud services list --enabled --filter="name:run.googleapis.com"
```

## IAM Permissions

### Understanding Required Permissions

When you encounter permission errors like `resourcemanager.projects.get`, you need appropriate IAM roles.

### Common Required Roles

#### For Development

- **Viewer**: Read-only access to all resources
- **Browser**: Browse project hierarchy

#### For Deployment

- **Cloud Run Admin**: Deploy and manage Cloud Run services
- **Service Account User**: Act as service accounts
- **Storage Admin**: Manage Cloud Storage

#### For Full Access

- **Editor**: Modify resources
- **Owner**: Full project control

### Grant Permissions to Your Account

```bash
# Grant yourself the necessary role (replace USER_EMAIL with your email)
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:USER_EMAIL" \
    --role="roles/editor"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:USER_EMAIL" \
    --role="roles/run.admin"

# Grant Service Account User role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:USER_EMAIL" \
    --role="roles/iam.serviceAccountUser"
```

### Create Service Account for Application

```bash
# Create service account
gcloud iam service-accounts create abaco-platform \
    --description="ABACO Platform Service Account" \
    --display-name="ABACO Platform"

# Grant necessary roles to service account
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="serviceAccount:abaco-platform@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
    --role="roles/run.invoker"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=abaco-platform@YOUR-PROJECT-ID.iam.gserviceaccount.com
```

### Request Additional Access

If you don't have sufficient permissions:

1. **Identify Required Role**:
   - Review the error message for missing permissions
   - Find the role that contains those permissions

2. **Request Access**:
   - Navigate to [IAM & Admin](https://console.cloud.google.com/iam-admin)
   - Click **Grant Access**
   - Enter your email address
   - Select the required role
   - Add justification
   - Submit request to project owner

3. **Alternative**: Contact your Google Cloud organization administrator

## Common Issues

### Issue: "You need additional access to the project"

**Cause**: Your account lacks necessary IAM permissions.

**Solution**:
```bash
# Check your current permissions
gcloud projects get-iam-policy YOUR-PROJECT-ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:user:YOUR_EMAIL"

# Request the "Viewer" role minimum
# Contact project owner or use Cloud Console to request access
```

### Issue: "API has not been used in project before or it is disabled"

**Cause**: Required API is not enabled for your project.

**Solution**:
```bash
# Enable the specific API (example with Dataproc)
gcloud services enable dataproc.googleapis.com

# Verify it's enabled
gcloud services list --enabled | grep dataproc
```

**Via Console**:
1. Click the link in the error message
2. Click **Enable API**
3. Wait 1-2 minutes for propagation

### Issue: "The current branch has no upstream branch"

**Cause**: Git branch is not tracking a remote branch.

**Solution**:
```bash
# Set upstream for current branch
git push --set-upstream origin main

# Or use shorthand
git push -u origin main

# Verify tracking
git branch -vv
```

### Issue: "Insufficient permissions" during deployment

**Cause**: Service account lacks deployment permissions.

**Solution**:
```bash
# Grant Cloud Run Admin to service account
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="serviceAccount:YOUR-SERVICE-ACCOUNT@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Grant Storage Admin for container images
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="serviceAccount:YOUR-SERVICE-ACCOUNT@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

### Issue: Billing not enabled

**Cause**: Project doesn't have billing enabled.

**Solution**:
1. Go to [Billing](https://console.cloud.google.com/billing)
2. Select your project
3. Link a billing account
4. Enable billing

## Deployment Options

### Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy abaco-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# With custom settings
gcloud run deploy abaco-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-key"
```

### Deploy with Docker

```bash
# Build container
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/abaco-platform

# Deploy from container
gcloud run deploy abaco-platform \
    --image gcr.io/YOUR-PROJECT-ID/abaco-platform \
    --platform managed \
    --region us-central1
```

## Environment Variables

### Required for Google Cloud Integration

Add these to your `.env.local`:

```bash
# Google Cloud Project
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_REGION=us-central1

# Service Account (if using)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# Google APIs (if using)
GOOGLE_SEARCH_API_KEY=your-api-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id

# Generative AI (if using)
GOOGLE_AI_API_KEY=your-generative-ai-key
```

### For Cloud Run Deployment

Set environment variables during deployment:

```bash
gcloud run deploy abaco-platform \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=your-project-id" \
    --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
```

## Security Best Practices

1. **Never commit credentials**: Add `.env.local` and `key.json` to `.gitignore`
2. **Use Secret Manager**: Store sensitive data in Google Secret Manager
3. **Rotate keys regularly**: Update service account keys periodically
4. **Principle of least privilege**: Grant only necessary permissions
5. **Enable audit logging**: Monitor access and changes
6. **Use workload identity**: For GKE deployments, use workload identity instead of service account keys

## Next Steps

1. ✅ Complete project setup
2. ✅ Enable required APIs
3. ✅ Configure IAM permissions
4. ✅ Set up environment variables
5. ✅ Deploy to Cloud Run
6. ✅ Monitor and optimize

## Additional Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [IAM Documentation](https://cloud.google.com/iam/docs)
- [Best Practices for Google Cloud](https://cloud.google.com/docs/enterprise/best-practices-for-enterprise-organizations)

## Support

For Google Cloud specific issues:
- [Google Cloud Support](https://cloud.google.com/support)
- [Stack Overflow - google-cloud-platform](https://stackoverflow.com/questions/tagged/google-cloud-platform)

For ABACO platform issues:
- Email: support@abaco-platform.com
- GitHub Issues: [Create an issue](https://github.com/Jeninefer/nextjs-with-supabase/issues)

---

*Last updated: October 2025*
