# Quick Reference: Google Cloud IAM Permissions Issue

## Problem
```
You need additional access to the project: gen-lang-client-0516194156
Missing or blocked permissions: resourcemanager.projects.get
```

## Quick Solutions

### Solution 1: Request Access (Recommended if working with existing project)

Contact your Google Cloud administrator and request:

**Your Email:** jeninefer@abacocapital.co  
**Project ID:** gen-lang-client-0516194156  
``` Search in files and complete real information
**Required Role:** Editor (or Viewer for read-only)

### Solution 2: Create Your Own Project

```bash
# Create new project
gcloud projects create abaco-platform-$(date +%s) --name="ABACO Platform"

# Set as active
gcloud config set project YOUR_NEW_PROJECT_ID

# Enable billing (required for deployment)
gcloud billing projects link YOUR_NEW_PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT
```

### Solution 3: Use Deployment Script

```bash
# Run the automated deployment script
./scripts/deploy-gcp.sh
```

The script will:
- Check your permissions
- Enable required APIs
- Guide you through any issues
- Deploy the application

## Required Permissions

For full deployment capabilities, you need one of:

| Role | Permissions | Use Case |
|------|-------------|----------|
| Viewer | 4 permissions | Read-only access |
| Editor | Full deployment | Deploy applications |
| Owner | Complete control | Manage project |

## Enable Required APIs

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

## Deploy to Google Cloud Run

```bash
# Quick deploy
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## Troubleshooting

### Permission Denied
- Verify you're using the correct Google account: `gcloud auth list`
- Check project access: `gcloud projects describe YOUR_PROJECT_ID`
- Request access from project administrator

### API Not Enabled
```bash
# Enable specific API (example: Cloud Dataproc)
gcloud services enable dataproc.googleapis.com
```

### Cannot Access Project
- Use troubleshooting tool: https://console.cloud.google.com/iam-admin/troubleshooter
- Or create a new project where you have Owner role

## Documentation

- Full setup guide: `docs/GOOGLE_CLOUD_SETUP.md`
- Deployment script: `scripts/deploy-gcp.sh`
- Google Cloud Console: https://console.cloud.google.com

## Support

- Check GCP Status: https://status.cloud.google.com/
- IAM Documentation: https://cloud.google.com/iam/docs
- Cloud Run Docs: https://cloud.google.com/run/docs

---

*For detailed instructions, see `docs/GOOGLE_CLOUD_SETUP.md`*
