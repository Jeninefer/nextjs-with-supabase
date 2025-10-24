# GitHub Actions Workflows

This directory contains CI/CD workflows for automated deployment of the Next.js application.

## Available Workflows

### 1. deploy.yml - Vercel Deployment (Paid Stack)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
- Checks out code
- Sets up Node.js 18
- Installs dependencies with `npm ci`
- Runs type checking (with warnings allowed)
- Runs linting (with warnings allowed)
- Builds the project with production environment variables
- Deploys to Vercel (preview for PRs, production for main)
- Provides deployment summary

**Required Secrets:**
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `VERCEL_TOKEN` - Vercel deployment token
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `FIGMA_ACCESS_TOKEN` - Figma API token (optional)
- `FIGMA_FILE_KEY` - Figma file key (optional)
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `XAI_API_KEY` - XAI API key (optional)

**Usage:**
This workflow runs automatically on push/PR. No manual action needed.

### 2. deploy-netlify.yml - Netlify Deployment (Free Stack)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
- Checks out code
- Sets up Node.js 18
- Installs dependencies with `npm ci`
- Runs type checking (with warnings allowed)
- Runs linting (with warnings allowed)
- Builds the project with free services environment variables
- Deploys to Netlify (preview for PRs, production for main)
- Provides deployment summary with cost information

**Required Secrets:**
- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site ID
- `POCKETBASE_URL` - Your PocketBase instance URL
- `GEMINI_API_KEY` - Google Gemini API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `FIGMA_ACCESS_TOKEN` - Figma API token (optional)
- `FIGMA_FILE_KEY` - Figma file key (optional)

**Usage:**
This workflow runs automatically on push/PR. Ideal for free services stack.

## Choosing a Workflow

### Use deploy.yml (Vercel) if:
- You're using Supabase backend
- You have a Vercel Pro account
- You prefer PostgreSQL over SQLite
- You need Vercel-specific features

### Use deploy-netlify.yml (Netlify) if:
- You've migrated to free services (PocketBase, Gemini, Cloudinary)
- You want to minimize costs ($0/month)
- You're using the free tier for everything
- You prefer Netlify's deployment model

## Setting Up Secrets

### GitHub Repository Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret for your chosen workflow

### Getting Secrets

#### Vercel Stack
```bash
# Get Vercel credentials
npx vercel login
npx vercel link
cat .vercel/project.json  # Contains ORG_ID and PROJECT_ID

# Get Vercel token from: https://vercel.com/account/tokens
```

#### Netlify Stack
```bash
# Get Netlify credentials
npx netlify login
npx netlify link
npx netlify sites:list  # Shows SITE_ID

# Get auth token from: https://app.netlify.com/user/applications/personal
```

#### Other Services
- **Supabase:** https://app.supabase.com/project/_/settings/api
- **PocketBase:** Your self-hosted URL or PocketBase Cloud URL
- **Gemini:** https://makersuite.google.com/app/apikey
- **Cloudinary:** https://cloudinary.com/console
- **Figma:** https://www.figma.com/developers/api#access-tokens

## Disabling Unused Workflows

If you're only using one deployment method:

### Disable deploy.yml (Vercel)
```bash
# Rename to disable
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
```

### Disable deploy-netlify.yml (Netlify)
```bash
# Rename to disable
mv .github/workflows/deploy-netlify.yml .github/workflows/deploy-netlify.yml.disabled
```

Or comment out the workflow triggers:
```yaml
# on:
#   push:
#     branches: [main]
#   pull_request:
#     branches: [main]
```

## Troubleshooting

### Build Fails with Type Errors
**Solution:** Type errors are expected and handled with `|| echo` fallback. If you want strict type checking, remove the fallback:
```yaml
# Before (lenient)
- run: npm run type-check || echo "TypeScript check completed with warnings"

# After (strict)
- run: npm run type-check
```

### Deployment Fails
**Check:**
1. All required secrets are set
2. Secrets don't have extra spaces
3. API keys are valid
4. Build completes locally: `npm run build`

### Environment Variables Not Working
**Solution:** Verify:
1. Secret names match exactly in workflow
2. Values don't have quotes in GitHub Secrets UI
3. Restart workflow after adding secrets

### Netlify Deployment Hangs
**Solution:**
- Check Netlify build logs
- Ensure `netlify.toml` is configured correctly
- Verify NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID

## Local Testing

### Test Build
```bash
# Install dependencies
npm ci

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

### Test Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## Workflow Outputs

Both workflows provide:
- ✅ Build status
- ✅ Deployment URL (in PR comments for preview)
- ✅ Branch and commit information
- ✅ Environment type (preview/production)
- ✅ Cost information (Netlify workflow)

## Migration Path

### From Vercel to Netlify

1. Set up Netlify secrets in GitHub
2. Run migration script: `bash scripts/migrate-to-free-services.sh`
3. Disable `deploy.yml` workflow
4. Push to trigger `deploy-netlify.yml`

### From Netlify to Vercel

1. Set up Vercel secrets in GitHub
2. Update environment variables
3. Disable `deploy-netlify.yml` workflow
4. Push to trigger `deploy.yml`

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Netlify Deployment](https://docs.netlify.com/site-deploys/overview/)
- [Migration Guide](../QUICK_START_MIGRATION.md)
- [Service Comparison](../SERVICE_COMPARISON.md)

## Support

For issues with:
- **Workflows:** Check GitHub Actions logs
- **Vercel:** See Vercel deployment logs
- **Netlify:** See Netlify build logs
- **Migration:** See [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)

---

**Choose your deployment method and enjoy automatic CI/CD!** 🚀
