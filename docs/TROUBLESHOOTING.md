# Troubleshooting Guide - Google Cloud & Git Issues

This guide helps resolve common issues when working with Google Cloud Platform integration and Git repository management for the ABACO Financial Intelligence Platform.

## Table of Contents

1. [Google Cloud Access Issues](#google-cloud-access-issues)
2. [API Configuration Issues](#api-configuration-issues)
3. [Git Repository Issues](#git-repository-issues)
4. [Deployment Issues](#deployment-issues)
5. [Permission Issues](#permission-issues)

## Google Cloud Access Issues

### Problem: "You need additional access to the project"

**Error Message**:
```
You need additional access to the project: gen-lang-client-0516194156
This could be because you have insufficient permissions to access the resource,
or because a deny or principal access boundary policy is blocking your access.
Missing or blocked permissions: resourcemanager.projects.get
```

**Root Cause**:
- Your Google Cloud account doesn't have the necessary IAM roles
- A resource policy is blocking access
- You're not added as a member to the project

**Solutions**:

#### Solution 1: Request Access from Project Owner

1. **Via Google Cloud Console**:
   - Navigate to [Cloud Console](https://console.cloud.google.com/)
   - Try to access the project - you'll see the access request dialog
   - Click "Request Access"
   - Select the role you need (e.g., "Viewer", "Editor")
   - Add a justification
   - Submit the request

2. **Contact Project Owner Directly**:
   - Email the project owner with your Google account email
   - Request specific roles: `roles/viewer` (minimum) or `roles/editor` (for deployments)

#### Solution 2: Use Your Own Project

If you don't need access to the specific project:

```bash
# Create your own project
gcloud projects create YOUR-NEW-PROJECT-ID --name="My ABACO Platform"

# Set as default
gcloud config set project YOUR-NEW-PROJECT-ID

# Enable billing
gcloud billing projects link YOUR-NEW-PROJECT-ID --billing-account=BILLING_ACCOUNT_ID

# Update your environment variables
# In .env.local:
GOOGLE_CLOUD_PROJECT=YOUR-NEW-PROJECT-ID
```

#### Solution 3: Check Current Permissions

```bash
# Verify which projects you have access to
gcloud projects list

# Check your permissions on a specific project
gcloud projects get-iam-policy PROJECT-ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:user:YOUR_EMAIL"
```

### Problem: "Billing account required"

**Error Message**:
```
You are now incurring charges in your billing account
```

**Root Cause**:
- Google Cloud requires billing for most APIs
- Free tier has limits that may have been exceeded

**Solutions**:

1. **Set up billing**:
   - Go to [Billing Console](https://console.cloud.google.com/billing)
   - Create or link a billing account
   - Monitor costs in the [Cost Management](https://console.cloud.google.com/billing/reports) section

2. **Use free tier**:
   ```bash
   # Check current usage
   gcloud alpha billing accounts list
   
   # View quotas
   gcloud compute project-info describe --project=YOUR-PROJECT-ID
   ```

3. **Set budget alerts**:
   - Navigate to Billing → Budgets & alerts
   - Create a budget
   - Set alert thresholds (e.g., 50%, 90%, 100%)

## API Configuration Issues

### Problem: "API has not been used in project before or it is disabled"

**Error Message**:
```
Error listing clusters: Error: Cloud Dataproc API has not been used in 
project gen-lang-client-0516194156 before or it is disabled.
Visit https://console.developers.google.com/apis/api/dataproc.googleapis.com/overview?project=XXX 
to enable it.
```

**Root Cause**:
- The API is not enabled for your project
- API enablement hasn't propagated yet (can take 1-2 minutes)

**Solutions**:

#### Solution 1: Enable via gcloud CLI

```bash
# Enable specific API
gcloud services enable dataproc.googleapis.com

# Enable multiple APIs at once
gcloud services enable \
    dataproc.googleapis.com \
    generativelanguage.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com

# Verify enabled
gcloud services list --enabled | grep dataproc
```

#### Solution 2: Enable via Console

1. Click the link in the error message (or navigate manually)
2. Click "Enable API" button
3. Wait 1-2 minutes for propagation
4. Retry your operation

#### Solution 3: Enable all required APIs

For ABACO platform, run:

```bash
# Core APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# AI/ML APIs (if needed)
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# Data processing APIs (if needed)
gcloud services enable dataproc.googleapis.com
gcloud services enable bigquery.googleapis.com
```

### Problem: API quota exceeded

**Error Message**:
```
Quota exceeded for quota metric 'Queries' and limit 'Queries per day'
```

**Solutions**:

1. **Check quota usage**:
   ```bash
   # View quotas
   gcloud compute project-info describe --project=YOUR-PROJECT-ID
   ```

2. **Request quota increase**:
   - Navigate to [Quotas page](https://console.cloud.google.com/iam-admin/quotas)
   - Select the quota to increase
   - Click "Edit Quotas"
   - Fill out the request form

3. **Implement rate limiting**:
   - Add delays between API calls
   - Cache results when possible
   - Use batch operations

## Git Repository Issues

### Problem: "The current branch has no upstream branch"

**Error Message**:
```
fatal: The current branch main has no upstream branch.
To push the current branch and set the remote as upstream, use:
    git push --set-upstream origin main
```

**Root Cause**:
- Local branch is not tracking a remote branch
- First push to a new branch

**Solutions**:

#### Solution 1: Set upstream and push

```bash
# Set upstream for current branch
git push -u origin main

# Or with full command
git push --set-upstream origin main

# Verify tracking
git branch -vv
```

#### Solution 2: Configure default push behavior

```bash
# Set default push behavior
git config --global push.default current

# Now git push will automatically track
git push
```

#### Solution 3: For new repositories

```bash
# Initialize repository with main branch
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### Problem: "There is no tracking information for the current branch"

**Error Message**:
```
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
```

**Solutions**:

```bash
# Set upstream branch
git branch --set-upstream-to=origin/main main

# Pull with upstream set
git pull

# Alternative: specify branch in pull
git pull origin main
```

### Problem: Merge conflicts

**Solutions**:

```bash
# Check status
git status

# Option 1: Abort merge
git merge --abort

# Option 2: Resolve conflicts manually
# Edit conflicted files
git add .
git commit -m "Resolve merge conflicts"

# Option 3: Use theirs or ours
git checkout --theirs path/to/file  # Use remote version
git checkout --ours path/to/file    # Use local version
git add .
git commit -m "Resolve conflicts"
```

### Problem: Authentication failed

**Solutions**:

```bash
# Use HTTPS with token
git remote set-url origin https://TOKEN@github.com/USERNAME/REPO.git

# Or use SSH
git remote set-url origin git@github.com:USERNAME/REPO.git

# Check remote URL
git remote -v
```

## Deployment Issues

### Problem: Cloud Run deployment fails with permission errors

**Error Message**:
```
ERROR: (gcloud.run.deploy) User [...] does not have permission to access 
service [...] (or it may not exist): Permission 'run.services.get' denied
```

**Solutions**:

#### Grant necessary permissions:

```bash
# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/run.admin"

# Grant Service Account User role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/iam.serviceAccountUser"

# Grant Cloud Build Editor role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/cloudbuild.builds.editor"
```

### Problem: Container build fails

**Error Message**:
```
ERROR: build step 0 failed: error pulling build step...
```

**Solutions**:

1. **Check Dockerfile**:
   ```bash
   # Test build locally
   docker build -t test-image .
   ```

2. **Enable required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Check Cloud Build logs**:
   ```bash
   # View recent builds
   gcloud builds list --limit=5
   
   # View specific build log
   gcloud builds log BUILD_ID
   ```

### Problem: Environment variables not set

**Solutions**:

```bash
# Set environment variables during deployment
gcloud run deploy SERVICE_NAME \
    --set-env-vars "VAR1=value1,VAR2=value2"

# Update existing service
gcloud run services update SERVICE_NAME \
    --update-env-vars "VAR1=new_value"

# Load from file
gcloud run services update SERVICE_NAME \
    --env-vars-file=.env.yaml
```

## Permission Issues

### Problem: Service account permissions

**Error Message**:
```
Permission denied on resource project
```

**Solutions**:

```bash
# List service accounts
gcloud iam service-accounts list

# Grant role to service account
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
    --role="roles/ROLE_NAME"

# Common roles for ABACO platform:
# - roles/run.invoker (for Cloud Run)
# - roles/datastore.user (for Firestore)
# - roles/storage.objectViewer (for Cloud Storage)
```

### Problem: Cross-project permissions

**Solutions**:

```bash
# Grant access to resource in another project
gcloud projects add-iam-policy-binding OTHER-PROJECT-ID \
    --member="user:YOUR_EMAIL" \
    --role="roles/viewer"

# Use service account impersonation
gcloud config set auth/impersonate_service_account SERVICE_ACCOUNT_EMAIL
```

## Quick Diagnosis Checklist

When troubleshooting, check these in order:

- [ ] **Project Access**: Can you see the project in `gcloud projects list`?
- [ ] **APIs Enabled**: Run `gcloud services list --enabled`
- [ ] **Permissions**: Check with `gcloud projects get-iam-policy`
- [ ] **Billing**: Verify at [Billing Console](https://console.cloud.google.com/billing)
- [ ] **Git Remote**: Check with `git remote -v`
- [ ] **Git Upstream**: Verify with `git branch -vv`
- [ ] **Environment Variables**: Confirm `.env.local` is configured
- [ ] **Authentication**: Run `gcloud auth list` to see active account

## Getting Help

### Google Cloud Support

1. **Community Support**:
   - [Stack Overflow - google-cloud-platform](https://stackoverflow.com/questions/tagged/google-cloud-platform)
   - [Google Cloud Community](https://www.googlecloudcommunity.com/)

2. **Official Support**:
   - [Google Cloud Support](https://cloud.google.com/support)
   - [Contact Support](https://cloud.google.com/support/docs/contact-support)

3. **Documentation**:
   - [Google Cloud Docs](https://cloud.google.com/docs)
   - [Troubleshooting Guide](https://cloud.google.com/docs/troubleshooting)

### ABACO Platform Support

- **Email**: tech@abaco-platform.com
- **GitHub Issues**: [Report an issue](https://github.com/Jeninefer/nextjs-with-supabase/issues)
- **Documentation**: Check `/docs` directory

## Preventive Measures

To avoid common issues:

1. **Use consistent project**:
   ```bash
   # Set and stick with one project
   gcloud config set project YOUR-PROJECT-ID
   ```

2. **Enable all APIs upfront**:
   ```bash
   # Run the setup script (create if needed)
   bash scripts/setup-gcloud.sh
   ```

3. **Document your setup**:
   - Keep track of which APIs you enable
   - Document custom IAM roles
   - Note any special configurations

4. **Use version control properly**:
   ```bash
   # Always set upstream
   git push -u origin branch-name
   
   # Pull before push
   git pull origin main
   ```

5. **Test locally first**:
   ```bash
   # Build locally before deploying
   npm run build
   npm run start
   ```

---

*For additional help, refer to [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) for complete setup instructions.*
