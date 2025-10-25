# Google Cloud Deployment Guide

## Overview

This guide explains how to deploy the ABACO Financial Intelligence Platform to Google Cloud using **Cloud Run**. 

> **Important:** This application uses **Cloud Run** for deploying containerized web applications, NOT Cloud Dataproc which is a different service for managing Apache Spark/Hadoop data processing clusters.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **Project created** in Google Cloud Console

## Step-by-Step Deployment

### 1. Install and Configure gcloud CLI

If you haven't already, install the Google Cloud SDK:

```bash
# Install gcloud (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version
```

### 2. Authenticate

```bash
# Login to your Google Cloud account
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Verify current configuration
gcloud config list
```

### 3. Enable Required APIs

**Enable Cloud Run API** (this is what you need for deploying this web application):

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

**DO NOT enable Dataproc API** unless you specifically need it for big data processing. This application does not use Dataproc.

### 4. Set Default Region

```bash
# Set your preferred region (e.g., us-central1, europe-west1, asia-east1)
gcloud config set run/region us-central1
```

### 5. Deploy to Cloud Run

From your project directory:

```bash
# Build and deploy in one command
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# Or with custom settings
gcloud run deploy abaco-platform \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
### 6. Set Environment Variables

```bash
# Set Supabase environment variables
gcloud run services update abaco-platform \
  --region us-central1 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=your-supabase-url" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key"
```

## Troubleshooting

### Error: "Cloud Dataproc API has not been used in project"

This error means you're accidentally trying to use Dataproc commands instead of Cloud Run commands.

**Common causes:**
- Running `gcloud dataproc clusters list` instead of `gcloud run services list`
- Following a guide for Dataproc instead of Cloud Run

**Solution:**
1. Use Cloud Run commands, not Dataproc commands
2. For this application, use: `gcloud run services list`
3. If you don't need Dataproc, do NOT enable the Dataproc API

### Verify Your Deployment

```bash
# List Cloud Run services (NOT Dataproc clusters)
gcloud run services list

# Get service details
gcloud run services describe abaco-platform --region us-central1

# View logs
gcloud run services logs read abaco-platform --region us-central1
```

## Cloud Run vs Dataproc

| Service | Purpose | Use Case |
|---------|---------|----------|
| **Cloud Run** | Deploy containerized web apps | This ABACO application |
| **Cloud Dataproc** | Manage Spark/Hadoop clusters | Big data batch processing |

For deploying the ABACO Financial Intelligence Platform, you need **Cloud Run**, not Dataproc.

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Quickstart](https://cloud.google.com/run/docs/quickstarts)
- [Cloud Run vs Other Services](https://cloud.google.com/run/docs/overview/what-is-cloud-run)

## Cost Estimation

Cloud Run pricing is based on:
- Request count
- Compute time (CPU and memory)
- Egress traffic

Free tier includes:
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

See [Cloud Run Pricing](https://cloud.google.com/run/pricing) for details.
