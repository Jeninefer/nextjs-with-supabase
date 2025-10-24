# GitHub Configuration Guide

## Quick Fix: Correct API URL

❌ **Wrong**: `https://github.com/Jeninefer/api/v3`  
✅ **Correct**: `https://api.github.com`

## Step-by-Step Setup

### 1. Generate GitHub Personal Access Token

1. Go to: [GitHub Tokens Settings](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Set Token Name**: `OfficeAddinApps-Figma`
4. **Select Scopes** (REQUIRED):
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Actions workflows
   - ✅ `user` - Read user profile data
5. **Set Expiration**: 90 days (recommended) or No expiration
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)

### 2. Configure GitHub Settings in VS Code

1. Open Command Palette: `Ctrl+Shift+P` (Linux/Windows) or `Cmd+Shift+P` (Mac)
2. Type: `GitHub Copilot: Configure GitHub Settings`
3. Enter:
   - **GitHub API URL**: `https://api.github.com`
   - **Personal Access Token**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Verify Configuration

```bash
# Test GitHub API access
curl -H "Authorization: token YOUR_TOKEN_HERE" \
  https://api.github.com/user

# Should return your GitHub user info
```

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| 404 Not Found | Ensure the API URL is `https://api.github.com` |
| Invalid token | Regenerate the token with correct scopes |
| Permission denied | Check if the token has `repo` and `workflow` scopes |

## Additional Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Managing GitHub Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot/getting-started-with-github-copilot)

---

**Last Updated:** January 2025
