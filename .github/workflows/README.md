# GitHub Actions Deployment Workflow

This repository includes an automated CI/CD pipeline for deploying the Next.js application to Vercel.

## Workflow Overview

The deployment workflow (`.github/workflows/deploy.yml`) consists of two main jobs:

### 1. Build Job
Runs on every push and pull request to the `main` branch:
- Checks out the code
- Sets up Node.js 20
- Installs dependencies
- Runs ESLint
- Performs TypeScript type checking
- Builds the Next.js application
- Uploads build artifacts

### 2. Deploy Job
Runs only on pushes to the `main` branch:
- Deploys the application to Vercel production

## Required Secrets

To enable automatic deployment to Vercel, you need to configure the following secrets in your GitHub repository:

### Setting Up Secrets

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

#### `VERCEL_TOKEN`
- Your Vercel authentication token
- Get it from: https://vercel.com/account/tokens
- Click "Create" and save the generated token

#### `VERCEL_ORG_ID`
- Your Vercel organization/team ID
- Find it in your Vercel project settings or by running:
  ```bash
  vercel link
  cat .vercel/project.json
  ```

#### `VERCEL_PROJECT_ID`
- Your specific project ID on Vercel
- Find it in the same `.vercel/project.json` file

## Local Development

The workflow automatically runs on pull requests, allowing you to:
- Verify your code passes linting
- Ensure type checking succeeds
- Confirm the build completes successfully

Before pushing, you can run these checks locally:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Type check
npm run type-check

# Build
npm run build
```

## Troubleshooting

### Workflow Fails on Lint
- Run `npm run lint` locally to see the errors
- Fix any ESLint issues before pushing

### Workflow Fails on Type Check
- Run `npm run type-check` locally
- Resolve any TypeScript errors

### Workflow Fails on Build
- Run `npm run build` locally to reproduce the issue
- Check for missing environment variables or configuration issues

### Deployment Fails
- Verify all three Vercel secrets are correctly configured
- Ensure your Vercel project is properly linked
- Check the Vercel dashboard for deployment logs

## Manual Deployment

If you need to deploy manually instead of using the workflow:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

## Workflow Customization

You can modify `.github/workflows/deploy.yml` to:
- Change the Node.js version
- Add additional testing steps
- Modify the deployment conditions
- Add environment-specific deployments (staging, preview, etc.)
