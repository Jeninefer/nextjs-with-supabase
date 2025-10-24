# GitHub Actions Deployment Setup Guide

This guide explains how to set up automated deployments for the ABACO Financial Intelligence Platform using GitHub Actions and Vercel.

## Overview

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automates:
- Code linting with ESLint
- TypeScript type checking
- Application building
- Preview deployments for pull requests
- Production deployments to Vercel

## Prerequisites

Before setting up automated deployments, ensure you have:

1. **GitHub Repository**: Your code hosted on GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project**: Active Supabase project with credentials
4. **Node.js 18+**: Required for local development and CI/CD

## Setup Instructions

### 1. Vercel Project Setup

First, set up your project on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project to Vercel
vercel link
```

During the linking process:
- Select your Vercel scope (personal or team)
- Link to an existing project or create a new one
- Follow the prompts to complete the setup

### 2. Get Vercel Credentials

You need three pieces of information from Vercel:

1. **Vercel Token**: 
   - Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
   - Create a new token with the name "GitHub Actions"
   - Copy the token (you won't be able to see it again)

2. **Vercel Organization ID**:
   ```bash
   # In your project directory
   cat .vercel/project.json
   ```
   Look for the `orgId` field

3. **Vercel Project ID**:
   ```bash
   # In your project directory
   cat .vercel/project.json
   ```
   Look for the `projectId` field

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret** and add each of the following:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VERCEL_TOKEN` | Your Vercel authentication token | `abc123...` |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `team_abc123` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `prj_abc123` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Your Supabase anon/public key | `eyJ...` |

**Note**: The `NEXT_PUBLIC_*` variables should also be configured in your Vercel project settings.

### 4. Configure Vercel Environment Variables

Set environment variables in Vercel:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add the following variables for all environments (Production, Preview, Development):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

## Workflow Details

### Triggered Events

The workflow runs on:
- **Push to `main` branch**: Triggers production deployment
- **Pull requests to `main`**: Triggers preview deployment

### Jobs Overview

#### 1. Lint Job
- Runs ESLint to check code quality
- Continues even if warnings are found
- Runs in parallel with type checking

#### 2. Type Check Job
- Validates TypeScript types
- Ensures type safety across the codebase
- Runs in parallel with linting

#### 3. Build Job
- Builds the Next.js application
- Requires lint and type-check to pass
- Uploads build artifacts for deployment jobs
- Uses Supabase environment variables

#### 4. Deploy Preview (Pull Requests)
- Deploys to Vercel preview environment
- Only runs for pull requests
- Provides a unique preview URL for testing
- Automatically comments on PR with deployment URL

#### 5. Deploy Production (Main Branch)
- Deploys to Vercel production environment
- Only runs when code is pushed to `main`
- Updates your production site

## Testing the Workflow

### Test with a Pull Request

1. Create a new branch:
   ```bash
   git checkout -b feature/test-deployment
   ```

2. Make a small change (e.g., update README.md)

3. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment workflow"
   git push origin feature/test-deployment
   ```

4. Create a pull request on GitHub

5. Watch the workflow run in the **Actions** tab

6. Check the preview deployment URL in the workflow output

### Test Production Deployment

1. Merge your pull request to `main`

2. Watch the production deployment in the **Actions** tab

3. Verify your changes at your production URL

## Troubleshooting

### Workflow Fails at Build Step

**Problem**: Build fails with module not found errors

**Solution**:
```bash
# Locally, ensure dependencies are up to date
npm install
npm run build

# If successful locally, the issue may be with cached dependencies in CI
# The workflow uses `npm ci` which installs from package-lock.json
```

### Deployment Fails with Authentication Error

**Problem**: Vercel deployment fails with "Invalid token"

**Solution**:
1. Verify `VERCEL_TOKEN` secret is correctly set
2. Generate a new token if the old one expired
3. Ensure the token has the correct permissions

### Environment Variables Not Available

**Problem**: Build succeeds but app doesn't work due to missing env vars

**Solution**:
1. Check that Supabase secrets are set in GitHub
2. Verify environment variables in Vercel dashboard
3. Ensure variable names match exactly (case-sensitive)

### Build Works Locally but Fails in CI

**Problem**: `npm ci` fails or build has different results

**Solution**:
1. Ensure `package-lock.json` is committed
2. Use the same Node.js version locally as in CI (18+)
3. Clear your local `node_modules` and run `npm ci` locally

## Advanced Configuration

### Customize Deployment Behavior

Edit `.github/workflows/deploy.yml` to:

- Add more test jobs (unit tests, e2e tests)
- Configure different deployment strategies
- Add notifications (Slack, Discord, etc.)
- Implement staged rollouts

### Skip Deployment for Certain Commits

Add `[skip ci]` to your commit message:
```bash
git commit -m "Update docs [skip ci]"
```

### Manual Deployment

You can also deploy manually using Vercel CLI:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Monitoring Deployments

### GitHub Actions

- View workflow runs: Repository → **Actions** tab
- See detailed logs for each job
- Download artifacts if needed

### Vercel Dashboard

- Monitor deployments: [vercel.com/dashboard](https://vercel.com/dashboard)
- View deployment logs and analytics
- Manage domain settings

## Security Best Practices

1. **Never commit secrets**: Always use GitHub Secrets for sensitive data
2. **Rotate tokens regularly**: Update Vercel tokens periodically
3. **Use environment-specific secrets**: Separate dev/staging/prod credentials
4. **Review deployment logs**: Monitor for unauthorized deployments
5. **Enable branch protection**: Require PR reviews before merging to `main`

## Next Steps

After setting up automated deployments:

1. Configure custom domain in Vercel
2. Set up branch protection rules in GitHub
3. Add status checks to require successful deployment
4. Configure monitoring and alerting
5. Document your deployment process for team members

## Support

For issues with:
- **GitHub Actions**: Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- **Vercel**: Check [Vercel documentation](https://vercel.com/docs)
- **Next.js**: Check [Next.js deployment docs](https://nextjs.org/docs/deployment)

---

**ABACO Financial Intelligence Platform** - Automated, reliable deployments for enterprise-grade applications.
