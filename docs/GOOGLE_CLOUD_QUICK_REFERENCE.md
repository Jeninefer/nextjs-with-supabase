# Google Cloud Quick Reference - ABACO Platform

Quick reference for common Google Cloud operations when working with the ABACO Financial Intelligence Platform.

## Initial Setup

```bash
# Login to Google Cloud
gcloud auth login

# List available projects
gcloud projects list

# Set active project
gcloud config set project YOUR-PROJECT-ID

# Get current project
gcloud config get-value project
```

## Enable Required APIs

```bash
# Essential APIs for deployment
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# AI/ML APIs (if using AI features)
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# List all enabled APIs
gcloud services list --enabled
```

## IAM & Permissions

```bash
# View your permissions
gcloud projects get-iam-policy YOUR-PROJECT-ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:user:YOUR_EMAIL"

# Grant yourself Editor role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/editor"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/run.admin"
```

## Deployment

```bash
# Deploy to Cloud Run (simple)
gcloud run deploy abaco-platform --source .

# Deploy with environment variables
gcloud run deploy abaco-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"

# Deploy with custom resources
gcloud run deploy abaco-platform \
    --source . \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --region us-central1
```

## Service Management

```bash
# List Cloud Run services
gcloud run services list

# Describe specific service
gcloud run services describe abaco-platform --region us-central1

# View service logs
gcloud run services logs read abaco-platform

# Delete service
gcloud run services delete abaco-platform --region us-central1
```

## Environment Variables

```bash
# Set environment variables
gcloud run services update abaco-platform \
    --set-env-vars "KEY1=value1,KEY2=value2"

# Update specific variable
gcloud run services update abaco-platform \
    --update-env-vars "KEY1=new_value"

# Remove environment variable
gcloud run services update abaco-platform \
    --remove-env-vars "KEY1"

# View current environment variables
gcloud run services describe abaco-platform --format="value(spec.template.spec.containers[0].env)"
```

## Troubleshooting

```bash
# Check project access
gcloud projects list

# Verify current authentication
gcloud auth list

# Test API status
gcloud services list --enabled | grep run

# View Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID

# Check service status
gcloud run services describe abaco-platform --region us-central1

# View recent logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

## Git Commands (Common Issues)

```bash
# Set upstream branch
git push -u origin main

# Configure default push behavior
git config --global push.default current

# Check branch tracking
git branch -vv

# Pull with upstream
git pull origin main

# Fix "no tracking information"
git branch --set-upstream-to=origin/main main
```

## Billing & Costs

```bash
# List billing accounts
gcloud billing accounts list

# Link project to billing
gcloud billing projects link YOUR-PROJECT-ID \
    --billing-account=BILLING_ACCOUNT_ID

# View project billing info
gcloud billing projects describe YOUR-PROJECT-ID
```

## Common Error Solutions

### "You need additional access to the project"
```bash
# Check your projects
gcloud projects list

# If not listed, request access from owner or create new project
gcloud projects create YOUR-NEW-PROJECT-ID
```

### "API has not been used in project before"
```bash
# Enable the specific API
gcloud services enable API_NAME.googleapis.com

# Example for Dataproc
gcloud services enable dataproc.googleapis.com
```

### "The current branch has no upstream branch"
```bash
# Set upstream and push
git push -u origin main
```

### "Permission denied"
```bash
# Grant yourself necessary permissions
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/editor"
```

## Useful Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Google Cloud
alias gcp='gcloud config get-value project'
alias gcpl='gcloud projects list'
alias gcps='gcloud config set project'
alias gcr='gcloud run'
alias gcrd='gcloud run deploy'
alias gcrl='gcloud run services list'

# Git
alias gpo='git push origin'
alias gpl='git pull origin'
alias gst='git status'
alias gaa='git add .'
alias gcm='git commit -m'
```

## Environment Setup Checklist

- [ ] Install `gcloud` CLI
- [ ] Run `gcloud auth login`
- [ ] Set project: `gcloud config set project YOUR-PROJECT-ID`
- [ ] Enable APIs: `gcloud services enable run.googleapis.com cloudbuild.googleapis.com`
- [ ] Configure `.env.local` with Supabase credentials
- [ ] Test build: `npm run build`
- [ ] Deploy: `gcloud run deploy abaco-platform --source .`

## Quick Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Cloud Run**: https://console.cloud.google.com/run
- **IAM & Admin**: https://console.cloud.google.com/iam-admin
- **APIs & Services**: https://console.cloud.google.com/apis
- **Billing**: https://console.cloud.google.com/billing

## Documentation

- [Full Google Cloud Setup Guide](./GOOGLE_CLOUD_SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [MCP Setup Guide](./MCP_SETUP_GUIDE.md)

---

*Keep this file handy for quick reference when working with Google Cloud!*
