# GitHub Secrets Configuration Guide

This guide explains how to securely configure your API keys and secrets in GitHub for automated deployment.

## Why Use GitHub Secrets?

✅ **Secure** - Keys never appear in code or logs  
✅ **Encrypted** - GitHub encrypts all secrets at rest  
✅ **Centralized** - Manage all keys in one place  
✅ **Team-friendly** - Share access without sharing keys  
✅ **CI/CD Ready** - Automatic deployment with GitHub Actions

## Required Secrets

You need to add these secrets to your GitHub repository:

### Vercel Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | [Vercel Account Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Run `vercel` locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Same as above |

### API Keys

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SUPABASE_URL` | Supabase project URL | [Supabase Dashboard → Settings → API](https://app.supabase.com) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Same as above |
| `FIGMA_ACCESS_TOKEN` | Figma personal access token | [Figma Settings → Personal Access Tokens](https://www.figma.com/settings) |
| `FIGMA_FILE_KEY` | Your Figma file key | Extract from Figma URL |
| `OPENAI_API_KEY` | OpenAI API key | [OpenAI Platform → API Keys](https://platform.openai.com/api-keys) |
| `XAI_API_KEY` | xAI (Grok) API key | [xAI Console](https://console.x.ai/) |

## Step-by-Step Setup

### 1. Get Vercel Credentials

#### A. Get Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Set scope to "Full Account"
5. Click "Create"
6. **Copy the token immediately** (you won't see it again)

#### B. Get Vercel Organization and Project IDs

```bash
# In your project directory
cd /home/codespace/OfficeAddinApps/Figma

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Your IDs are now in .vercel/project.json
cat .vercel/project.json
```

The output will look like:

```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

### 2. Add Secrets to GitHub

#### Via GitHub Web Interface

1. Go to your repository on GitHub: `https://github.com/Jeninefer/OfficeAddinApps-Figma`

2. Click **Settings** (tab at the top)

3. In the left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret**

5. Add each secret:
   - **Name**: `VERCEL_TOKEN`
   - **Value**: (paste your Vercel token)
   - Click **Add secret**

6. Repeat for all secrets:
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `FIGMA_ACCESS_TOKEN`
   - `FIGMA_FILE_KEY`
   - `OPENAI_API_KEY`
   - `XAI_API_KEY`

#### Via GitHub CLI (Alternative)

```bash
# Install GitHub CLI if not already installed
# In Codespaces, it's already installed

# Authenticate
gh auth login

# Add secrets one by one
gh secret set VERCEL_TOKEN
# Paste your token when prompted, then press Enter

gh secret set VERCEL_ORG_ID
# Paste your org ID, then press Enter

gh secret set VERCEL_PROJECT_ID
# Paste your project ID, then press Enter

gh secret set SUPABASE_URL
gh secret set SUPABASE_ANON_KEY
gh secret set FIGMA_ACCESS_TOKEN
gh secret set FIGMA_FILE_KEY
gh secret set OPENAI_API_KEY
gh secret set XAI_API_KEY
```

### 3. Verify Secrets Are Set

```bash
# List all secrets (values are hidden)
gh secret list
```

Expected output:

```text
FIGMA_ACCESS_TOKEN    Updated 2024-01-01
FIGMA_FILE_KEY        Updated 2024-01-01
OPENAI_API_KEY        Updated 2024-01-01
SUPABASE_ANON_KEY     Updated 2024-01-01
SUPABASE_URL          Updated 2024-01-01
VERCEL_ORG_ID         Updated 2024-01-01
VERCEL_PROJECT_ID     Updated 2024-01-01
VERCEL_TOKEN          Updated 2024-01-01
XAI_API_KEY           Updated 2024-01-01
```

### 4. Test the Workflow

```bash
# Commit and push to trigger the workflow
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### 5. Monitor Deployment

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see your workflow running
4. Click on the workflow run to see detailed logs
5. Wait for deployment to complete (usually 2-5 minutes)

## Security Best Practices

### ✅ DO

- **Use GitHub Secrets** for all sensitive data
- **Rotate keys regularly** (every 3-6 months)
- **Use different keys** for development and production
- **Enable 2FA** on all accounts (GitHub, Vercel, etc.)
- **Monitor secret access** in GitHub audit logs
- **Set minimal permissions** for service accounts

### ❌ DON'T

- **Never commit** secrets to git
- **Never log** secret values
- **Never share** secrets via email/chat
- **Don't use** production keys in development
- **Don't grant** unnecessary permissions

## Updating Secrets

### Update a Single Secret

Via GitHub CLI:

```bash
gh secret set OPENAI_API_KEY
# Paste new value
```

Via Web Interface:

1. Go to Settings → Secrets and variables → Actions
2. Click on the secret name
3. Click "Update secret"
4. Enter new value
5. Click "Update secret"

### Rotate All Keys

When rotating keys:

1. Generate new key in service (OpenAI, Figma, etc.)
2. Update GitHub secret with new value
3. Verify deployment works with new key
4. Revoke old key in service

## Troubleshooting

### Workflow Fails with "Secret not found"

**Problem**: Secret name mismatch

**Solution**:

```bash
# Check secret names
gh secret list

# Make sure they match exactly in .github/workflows/deploy.yml
```

### Vercel Deployment Fails

**Problem**: Invalid Vercel credentials

**Solutions**:

1. Verify `VERCEL_TOKEN` is valid:

   ```bash
   vercel whoami --token=$VERCEL_TOKEN
   ```

2. Regenerate token if needed

3. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`:

   ```bash
   cat .vercel/project.json
   ```

### API Keys Not Working

**Problem**: Keys not loaded in build

**Solution**: Ensure secrets are listed in workflow `env` section:

```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  # ... etc
```

### Build Fails with Environment Variable Error

**Problem**: dotenv-webpack not loading secrets

**Solution**: Secrets are injected by GitHub Actions, not from `.env`. The workflow passes them as environment variables.

## Environment-Specific Secrets

### Production vs Preview

You can set different secrets for different environments:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. For preview/staging, prefix with `STAGING_`:
   - `STAGING_SUPABASE_URL`
   - `STAGING_OPENAI_API_KEY`
   - etc.

### Update Workflow

```yaml
- name: Build project
  run: npm run build
  env:
    SUPABASE_URL: ${{ github.ref == 'refs/heads/main' && secrets.SUPABASE_URL || secrets.STAGING_SUPABASE_URL }}
```

## Secret Access Logs

View who accessed secrets:

1. Go to Settings → Logs → Audit log
2. Filter by "secret"
3. Review access patterns

## Removing Secrets

```bash
# Via CLI
gh secret delete SECRET_NAME

# Via Web Interface
# Settings → Secrets and variables → Actions → Click secret → Delete
```

## Complete Setup Checklist

- [ ] Created Vercel token
- [ ] Got Vercel org and project IDs
- [ ] Added all 9 secrets to GitHub
- [ ] Verified secrets with `gh secret list`
- [ ] Committed workflow file
- [ ] Pushed to GitHub
- [ ] Checked Actions tab for workflow run
- [ ] Verified deployment succeeded
- [ ] Tested deployed application
- [ ] Revoked any exposed keys
- [ ] Documented key rotation schedule

## Quick Reference Commands

```bash
# List secrets
gh secret list

# Add secret
gh secret set SECRET_NAME

# Delete secret
gh secret delete SECRET_NAME

# View workflow runs
gh run list

# View workflow run logs
gh run view

# Trigger workflow manually
gh workflow run deploy.yml

# Check Vercel credentials
cat .vercel/project.json
vercel whoami
```

## Next Steps

1. ✅ Add all secrets to GitHub
2. ✅ Commit and push workflow
3. ✅ Monitor first deployment
4. ✅ Test deployed app
5. ✅ Set up status badges (optional)
6. ✅ Configure branch protection (optional)

## Support

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Status Badge (Optional)

Add to your README.md:

```markdown
![Deploy](https://github.com/Jeninefer/OfficeAddinApps-Figma/actions/workflows/deploy.yml/badge.svg)
```

This will show the deployment status at the top of your README! 🎉
