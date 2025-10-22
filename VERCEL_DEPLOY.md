# Vercel Deployment Guide

This guide explains how to deploy your Office Add-in to Vercel with all integrated services (Supabase, Figma API, OpenAI, xAI/Grok).

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) installed globally
- All API keys configured (see [Environment Variables](#environment-variables))

## Quick Deploy

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy with GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

## Environment Variables

### Required Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Same as above |
| `FIGMA_ACCESS_TOKEN` | Figma personal access token | [Figma Settings](https://www.figma.com/settings) → Personal Access Tokens |
| `FIGMA_FILE_KEY` | Your Figma file key | Extract from Figma URL |
| `OPENAI_API_KEY` | OpenAI API key | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `XAI_API_KEY` | xAI (Grok) API key | [xAI API](https://x.ai/api) |

### Setting Environment Variables in Vercel

#### Via Vercel Dashboard

1. Go to your project on Vercel
2. Click "Settings"
3. Click "Environment Variables"
4. Add each variable with its value
5. Select environments (Production, Preview, Development)
6. Click "Save"

#### Via Vercel CLI

```bash
# Set a single variable
vercel env add SUPABASE_URL production

# Import from .env file (BE CAREFUL - only use for non-sensitive test data)
vercel env pull .env.production
```

## Project Configuration

### vercel.json

The `vercel.json` file configures your deployment:

```json
{
  "version": 2,
  "name": "office-addin-figma",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

### package.json Scripts

Required scripts for Vercel:

```json
{
  "scripts": {
    "vercel-build": "npm run build",
    "build": "webpack --mode production"
  }
}
```

## Build Process

Vercel will automatically:

1. Install dependencies (`npm install`)
2. Run build command (`npm run vercel-build`)
3. Deploy static files from `dist/` directory
4. Configure environment variables
5. Set up custom domain (if configured)

## Custom Domain

### Add Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Enter your domain name
3. Follow DNS configuration instructions
4. Wait for DNS propagation

### Update manifest.xml

After deploying, update your `manifest.xml` with the production URL:

```xml
<SourceLocation DefaultValue="https://your-project.vercel.app/taskpane.html"/>
```

## Deployment Workflow

### Development

```bash
# Run locally
npm run dev-server

# Preview on Vercel (creates preview deployment)
vercel
```

### Production

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if GitHub integration enabled)
git push origin main
```

## Post-Deployment

### 1. Test the Deployment

Visit your Vercel URL to verify:
- ✅ Static files are served correctly
- ✅ Environment variables are loaded
- ✅ HTTPS is working
- ✅ All API integrations work

### 2. Update Office Add-in Manifest

Update `manifest.xml` with your Vercel URL:

```xml
<SourceLocation DefaultValue="https://your-app.vercel.app/taskpane.html"/>
```

### 3. Sideload the Updated Add-in

- PowerPoint Desktop: File → Options → Add-ins → Manage: COM Add-ins
- PowerPoint Online: Insert → Add-ins → Upload My Add-in

## Monitoring & Logs

### View Deployment Logs

```bash
# View recent deployments
vercel ls

# View logs for specific deployment
vercel logs [deployment-url]
```

### Vercel Dashboard

Monitor in real-time:
- Deployment status
- Build logs
- Runtime logs
- Analytics
- Error tracking

## Troubleshooting

### Build Fails

**Problem**: `Error: Command "vercel-build" not found`

**Solution**: Add to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

### Environment Variables Not Working

**Problem**: Variables are undefined in production

**Solutions**:

1. Verify variables are set in Vercel Dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Ensure webpack is configured with dotenv-webpack

### CORS Errors

**Problem**: Cross-origin requests blocked

**Solution**: Already configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Large Bundle Size

**Problem**: Deployment exceeds size limits

**Solutions**:

1. Enable tree-shaking in webpack
2. Use dynamic imports for large libraries
3. Optimize images and assets
4. Remove unused dependencies

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly**
4. **Set up rate limiting** for API endpoints
5. **Enable Vercel Authentication** if needed
6. **Use HTTPS only** (Vercel provides this automatically)
7. **Monitor usage** to detect anomalies

## Cost Optimization

### Vercel Free Tier Includes

- 100 GB bandwidth/month
- 6,000 build minutes/month
- Automatic HTTPS
- Unlimited deployments
- Preview deployments

### Tips

1. Optimize build time with caching
2. Use static generation where possible
3. Minimize API calls
4. Compress assets
5. Use CDN for large files

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Useful Commands

```bash
# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm [deployment-url]

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add [name]

# List environment variables
vercel env ls
```

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure all environment variables
3. ✅ Test all API integrations
4. ✅ Update manifest.xml with production URL
5. ✅ Sideload add-in in Office applications
6. ✅ Set up monitoring and alerts
7. ✅ Configure custom domain (optional)

For detailed integration guides, see:
- [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) - Supabase setup
- [AI_APIS.md](./AI_APIS.md) - AI APIs setup (OpenAI, xAI)
- [FIGMA_API.md](./FIGMA_API.md) - Figma API setup
