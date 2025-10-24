# GitHub Actions Deployment Workflows

This directory contains GitHub Actions workflows for automated deployment of the ABACO Financial Intelligence Platform.

## 📋 Available Workflows

### deploy.yml

The main deployment workflow that:
1. **Builds and Tests** the application on every push and PR
2. **Deploys to Vercel** automatically on main branch pushes (recommended)
3. **Deploys to Google Cloud Run** optionally (can be enabled)

## 🚀 Setup Instructions

### Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### For Vercel Deployment (Recommended)

1. `VERCEL_TOKEN` - Your Vercel authentication token
   - Get from: https://vercel.com/account/tokens
   
2. `VERCEL_ORG_ID` - Your Vercel organization/team ID
   - Get from: https://vercel.com/[your-org]/settings
   
3. `VERCEL_PROJECT_ID` - Your Vercel project ID
   - Get from: https://vercel.com/[your-org]/[project]/settings

#### For Supabase Integration

4. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - Get from: https://app.supabase.com/project/_/settings/api
   
5. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` - Your Supabase anon/public key
   - Get from: https://app.supabase.com/project/_/settings/api

#### For Google Cloud Run (Optional)

6. `GCP_CREDENTIALS` - Google Cloud service account credentials JSON
   - Create a service account with Cloud Run Admin role
   - Download the JSON key file
   - Paste the entire JSON content as the secret value

### Optional Variables

To enable Google Cloud Run deployment, add this variable:
(Settings → Secrets and variables → Actions → Variables)

- `ENABLE_CLOUD_RUN_DEPLOY` = `true`

## 🔧 Workflow Behavior

### On Pull Requests
- ✅ Runs linting
- ✅ Performs type checking
- ✅ Builds the application
- ❌ Does NOT deploy

### On Push to Main Branch
- ✅ Runs linting
- ✅ Performs type checking
- ✅ Builds the application
- ✅ Deploys to Vercel (if configured)
- ✅ Deploys to Google Cloud Run (if enabled and configured)

### Manual Trigger
You can manually trigger the workflow from the Actions tab using the "Run workflow" button.

## 📦 Build Process

The workflow performs the following steps:

1. **Checkout** - Clones the repository
2. **Setup Node.js** - Installs Node.js 20.x with npm caching
3. **Install Dependencies** - Runs `npm ci` for clean installation
4. **Lint** - Runs ESLint to check code quality
5. **Type Check** - Runs TypeScript compiler for type validation
6. **Build** - Creates optimized production build with Next.js
7. **Upload Artifacts** - Stores build artifacts for 7 days

## 🎯 Deployment Platforms

### Vercel (Recommended)
- **Best for**: Next.js applications (native support)
- **Features**: 
  - Automatic preview deployments for PRs
  - Edge network CDN
  - Zero-configuration deployment
  - Built-in analytics
  - Serverless functions

### Google Cloud Run (Optional)
- **Best for**: Custom container requirements or GCP integration
- **Features**:
  - Fully managed container platform
  - Automatic scaling
  - Custom domains
  - VPC networking
  - Pay per use

## 🔍 Troubleshooting

### Build Failures

**Issue**: Build fails with "secrets not found"
- **Solution**: Add the required Supabase secrets to your repository

**Issue**: Type check fails
- **Solution**: Run `npm run type-check` locally to identify issues

### Deployment Failures

**Issue**: Vercel deployment fails
- **Solution**: Verify all three Vercel secrets are correctly configured
- Check token permissions at https://vercel.com/account/tokens

**Issue**: Cloud Run deployment fails
- **Solution**: Verify GCP credentials have Cloud Run Admin role
- Check that the variable `ENABLE_CLOUD_RUN_DEPLOY` is set to `true`

## 📝 Customization

### Change Node.js Version
Edit the `NODE_VERSION` environment variable in `deploy.yml`:
```yaml
env:
  NODE_VERSION: '20.x'  # Change to desired version
```

### Change Cloud Run Region
Edit the `--region` flag in the Cloud Run deployment step:
```yaml
--region us-central1  # Change to desired region
```

### Add More Deployment Targets
Create additional jobs following the pattern of `deploy-vercel` or `deploy-cloud-run`.

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Support

For issues with the workflow:
1. Check the Actions tab for detailed error logs
2. Verify all secrets and variables are correctly configured
3. Review the troubleshooting section above
4. Contact: tech@abaco-platform.com
