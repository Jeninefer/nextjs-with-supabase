# Google Cloud Platform Setup Guide for ABACO Financial Intelligence Platform

## Overview

This guide will help you set up the necessary Google Cloud Platform (GCP) resources and permissions to deploy the ABACO Financial Intelligence Platform to Google Cloud Run.

## Prerequisites

- A Google Cloud Platform account
- Google Cloud SDK (`gcloud`) installed on your local machine
- Project billing enabled
- Access to create projects or proper permissions on an existing project

## Common Issues and Solutions

### Issue: "You need additional access to the project"

**Error Message:**
```
You need additional access to the project: your-project-id
Missing or blocked permissions: resourcemanager.projects.get
```

**Solution:**

This error occurs when your Google Cloud user account lacks the necessary IAM permissions. Follow these steps:

#### Option 1: Request Access from Project Owner/Administrator

1. Contact your Google Cloud project administrator
2. Provide them with:
   - Your Google Cloud email: `user@example.com`
   - Project ID: `your-project-id`
   - Required permission: `resourcemanager.projects.get`
   - Recommended role: **Viewer** or **Editor**

3. Ask them to grant you one of these roles:
   - **Viewer** – For broad read-only access to most resources
   - **Editor** - For deployment capabilities
   - **Owner** - For full project control

#### Option 2: Use the Troubleshooting Tool

Visit the troubleshooting URL provided in the error message to see detailed permission issues:
```
console.cloud.google.com/iam-admin/troubleshooter/summary
```

#### Option 3: Create Your Own Project

If you cannot get access to the existing project, create a new one:

```bash
# Set your project name
export PROJECT_ID="abaco-platform-$(date +%s)"

# Create new project
gcloud projects create $PROJECT_ID --name="ABACO Platform"

# Set as active project
gcloud config set project $PROJECT_ID

# Enable billing (replace BILLING_ACCOUNT_ID with your billing account)
gcloud billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

## Required Google Cloud APIs

Enable the following APIs for your project:

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
```

## Required IAM Roles and Permissions

### For Deployment

To deploy the ABACO platform to Google Cloud Run, you need:

**Minimum Required Roles:**
- `roles/run.developer` - Cloud Run Developer
- `roles/iam.serviceAccountUser` - Service Account User
- `roles/storage.admin` - Storage Admin (for container registry)

**Recommended Role for Full Deployment:**
- `roles/editor` - Editor (includes all necessary permissions)

### Setting Up Permissions

If you're a project administrator, grant permissions to a user:

```bash
# Replace with actual values
export PROJECT_ID="your-project-id"
export USER_EMAIL="user@example.com"

# Grant Editor role (recommended for deployment)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:${USER_EMAIL}" \
  --role="roles/editor"

# Or grant specific roles for minimal permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:${USER_EMAIL}" \
  --role="roles/run.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:${USER_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:${USER_EMAIL}" \
  --role="roles/storage.admin"
```

## Service Account Setup

Create a service account for Cloud Run with minimal necessary permissions:

```bash
# Create service account
gcloud iam service-accounts create abaco-platform-sa \
  --display-name="ABACO Platform Service Account"

# Grant necessary permissions to the service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:abaco-platform-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

## Deployment Steps

### 1. Initial Setup

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project $PROJECT_ID

# Set default region
gcloud config set run/region us-central1
```

### 2. Configure Environment Variables

Create a `.env.production` file (do not commit to Git):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Add other environment variables as needed
```

### 3. Deploy Using Cloud Build

```bash
# Submit build to Google Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Or deploy directly using gcloud
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### 4. Deploy Using Docker

```bash
# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/abaco-platform:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/abaco-platform:latest

# Deploy to Cloud Run
gcloud run deploy abaco-platform \
  --image gcr.io/$PROJECT_ID/abaco-platform:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

## Setting Environment Variables in Cloud Run

```bash
gcloud run services update abaco-platform \
  --region us-central1 \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"
```

## Troubleshooting Common Issues

### 1. Cloud Dataproc API Not Enabled

**Error:**
```
Cloud Dataproc API has not been used in project before or it is disabled
```

**Solution:**
```bash
gcloud services enable dataproc.googleapis.com
```

### 2. Permission Denied Errors

**Error:**
```
ERROR: (gcloud.run.deploy) User [email] does not have permission to access
```

**Solution:**
- Verify you have the correct roles assigned
- Check that APIs are enabled
- Ensure billing is enabled on the project

### 3. Resource Manager API Permission

**Error:**
```
Missing or blocked permissions: resourcemanager.projects.get
```

**Solution:**
- Request `roles/viewer` or higher from project administrator
- Or create a new project where you have Owner permissions

### 4. Quota Exceeded

If you encounter quota issues:

```bash
# Check quotas
gcloud compute project-info describe --project $PROJECT_ID

# Request quota increase through GCP Console
# Navigation: IAM & Admin > Quotas
```

## Best Practices

### Security

1. **Never commit credentials to Git**
   - Use `.env.local` for local development
   - Use Cloud Run environment variables for production
   - Use Google Secret Manager for sensitive data

2. **Use least privilege principle**
   - Grant minimum necessary permissions
   - Use service accounts for application runtime
   - Regularly audit IAM permissions

3. **Enable audit logging**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision"
   ```

### Cost Optimization

1. **Set CPU throttling**
   ```bash
   gcloud run services update abaco-platform \
     --cpu-throttling \
     --region us-central1
   ```

2. **Configure autoscaling**
   ```bash
   gcloud run services update abaco-platform \
     --min-instances 0 \
     --max-instances 10 \
     --region us-central1
   ```

### Monitoring

1. **View logs**
   ```bash
   gcloud run services logs read abaco-platform --region us-central1
   ```

2. **Monitor metrics in Cloud Console**
   - Navigate to: Cloud Run > abaco-platform > Metrics

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure Cloud CDN for static assets
3. Set up Cloud Monitoring alerts
4. Configure backup and disaster recovery
5. Implement CI/CD pipeline with Cloud Build triggers

## Support

If you continue to experience issues:

1. Check the [GCP Status Dashboard](https://status.cloud.google.com/)
2. Review [Cloud Run documentation](https://cloud.google.com/run/docs)
3. Contact your organization's GCP administrator
4. Open a support ticket with Google Cloud Support

## Additional Resources

- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [Cloud Run Quickstart](https://cloud.google.com/run/docs/quickstarts)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Best Practices for Cloud Run](https://cloud.google.com/run/docs/best-practices)

---

*This guide is part of the ABACO Financial Intelligence Platform documentation.*
