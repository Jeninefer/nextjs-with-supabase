# Google Cloud Platform Setup Guide

## Overview

This guide helps you set up and configure Google Cloud Platform (GCP) services for the ABACO Financial Intelligence Platform. This includes enabling necessary APIs and resolving common configuration issues.

## Prerequisites

- Google Cloud Platform account
- gcloud CLI installed (optional but recommended)
- Project with billing enabled

## Common Cloud API Errors

### Cloud Dataproc API Error

If you encounter an error like:

```
Error: Cloud Dataproc API has not been used in project gen-lang-client-XXXXXXXXX 
before or it is disabled. Enable it by visiting 
https://console.developers.google.com/apis/api/dataproc.googleapis.com/overview?project=PROJECT_ID
```

**This error typically means:**
1. You're running code that attempts to use Google Cloud services
2. The specific API hasn't been enabled in your GCP project
3. Your environment may have GCP credentials configured that are being used automatically

**Note:** The ABACO notebook doesn't require Cloud Dataproc by default. This error usually indicates:
- A misconfigured environment variable pointing to a GCP project
- Code attempting to use cloud services when local processing would suffice
- Leftover configuration from another project

## Recommended Setup

### Option 1: Local Development (No Cloud Required)

The ABACO Financial Intelligence Platform can run entirely locally without any Google Cloud services:

1. **Use the local Python environment:**
   ```bash
   cd /path/to/nextjs-with-supabase
   source abaco_venv/bin/activate
   ```

2. **Run the notebook locally:**
   ```bash
   jupyter notebook notebooks/abaco_financial_intelligence_unified.ipynb
   ```

3. **No GCP APIs needed** - All processing happens on your local machine

### Option 2: Google Cloud Integration (Advanced)

If you want to use Google Cloud services for enhanced capabilities:

#### Step 1: Enable Required APIs

Visit the Google Cloud Console and enable these APIs for your project:

1. **Cloud SQL API** (for database operations)
   - URL: `https://console.cloud.google.com/apis/library/sqladmin.googleapis.com`
   
2. **Cloud Storage API** (for data storage)
   - URL: `https://console.cloud.google.com/apis/library/storage-api.googleapis.com`

3. **Cloud Dataproc API** (optional - only if using distributed computing)
   - URL: `https://console.cloud.google.com/apis/library/dataproc.googleapis.com`

#### Step 2: Create Service Account

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create abaco-service-account \
    --display-name="ABACO Platform Service Account" \
    --project=$PROJECT_ID

# Create and download key
gcloud iam service-accounts keys create ~/abaco-key.json \
    --iam-account=abaco-service-account@${PROJECT_ID}.iam.gserviceaccount.com
```

#### Step 3: Set Environment Variables

Add to your `.env.local`:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/abaco-key.json

# Cloud SQL (if using)
CLOUD_SQL_CONNECTION_NAME=project:region:instance
CLOUD_SQL_DATABASE=abaco_production
CLOUD_SQL_USERNAME=abaco_user
CLOUD_SQL_PASSWORD=your-secure-password
CLOUD_SQL_PORT=3306
```

## Troubleshooting

### Python Command Not Found

If you see `/bin/sh: python: command not found`:

1. **Install Python 3:**
   ```bash
   # macOS
   brew install python3
   
   # Ubuntu/Debian
   sudo apt-get install python3 python3-pip
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv abaco_venv
   source abaco_venv/bin/activate
   ```

3. **Verify installation:**
   ```bash
   which python
   python --version
   ```

### Disabling Unwanted Cloud Integration

If you're getting cloud API errors but don't want to use GCP:

1. **Check for GCP credentials:**
   ```bash
   echo $GOOGLE_APPLICATION_CREDENTIALS
   echo $GOOGLE_CLOUD_PROJECT
   ```

2. **Unset if present:**
   ```bash
   unset GOOGLE_APPLICATION_CREDENTIALS
   unset GOOGLE_CLOUD_PROJECT
   ```

3. **Remove from shell profile:**
   Edit `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile` and remove any GCP-related exports

### API Quota Exceeded

If you see quota errors:

1. Check your quota usage in [GCP Console > IAM & Admin > Quotas](https://console.cloud.google.com/iam-admin/quotas)
2. Request quota increases if needed
3. Implement rate limiting in your code

### Authentication Errors

If you see authentication errors:

1. **Verify credentials are valid:**
   ```bash
   gcloud auth application-default login
   ```

2. **Check service account permissions:**
   ```bash
   gcloud projects get-iam-policy $PROJECT_ID \
       --flatten="bindings[].members" \
       --filter="bindings.members:serviceAccount:abaco-service-account@*"
   ```

3. **Grant necessary roles:**
   ```bash
   gcloud projects add-iam-policy-binding $PROJECT_ID \
       --member="serviceAccount:abaco-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
       --role="roles/cloudsql.client"
   ```

## Cost Optimization

### Free Tier Usage

- Cloud SQL: Free tier not available, but you can use small instances
- Cloud Storage: 5 GB/month free
- Cloud Functions: 2 million invocations/month free

### Best Practices

1. **Use local development** whenever possible
2. **Set up billing alerts** in GCP Console
3. **Delete unused resources** regularly
4. **Use preemptible instances** for batch processing
5. **Monitor costs** in [GCP Console > Billing](https://console.cloud.google.com/billing)

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use service accounts** with minimal required permissions
3. **Rotate keys regularly** (at least every 90 days)
4. **Enable audit logging** for production projects
5. **Use Secret Manager** for sensitive data

## When to Use Cloud vs Local

### Use Local Development When:
- Developing and testing features
- Working with small datasets (< 1GB)
- No need for high availability
- Cost is a concern

### Use Google Cloud When:
- Production deployment required
- Large datasets (> 10GB)
- Need distributed processing
- Require high availability and scalability
- Team collaboration on shared infrastructure

## Additional Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Cloud SQL Setup Guide](https://cloud.google.com/sql/docs/mysql/quickstart)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)
- [ABACO Platform Documentation](../README.md)

## Support

For issues specific to:
- **GCP Setup**: Consult [Google Cloud Support](https://cloud.google.com/support)
- **ABACO Platform**: Contact tech@abaco-platform.com
- **Notebook Issues**: See [notebooks/README.md](../notebooks/README.md)

---

*Last updated: October 2025*
