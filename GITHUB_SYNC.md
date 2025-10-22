# GitHub Sync Instructions

## Current Status

✅ Dev server running on port 3000  
✅ Dependencies installed (1073 packages)  
✅ Files ready to commit

## Quick Sync to GitHub

### Step 1: Create Repository on GitHub

Go to [GitHub New Repository](https://github.com/new) and create a repository with these settings:
Go to [GitHub New Repository](https://github.com/new) and create a repository with these settings:

- **Repository name**: `OfficeAddinApps-Figma`
- **Description**: Office Add-in for Figma/PowerPoint integration
- **Visibility**: Private (recommended) or Public
- **⚠️ Important**: Do NOT initialize with README, .gitignore, or license

### Step 2: Run These Commands

Once the repository is created, run these commands in the terminal:

```bash
# Initialize git (if not already done)
git init
git branch -M main

# Add files (excluding node_modules and dist via .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: Office Add-in Figma project"

# Add remote (replace YOUR_USERNAME if different from Jeninefer)
git remote add origin https://github.com/Jeninefer/OfficeAddinApps-Figma.git

# Push to GitHub
git push -u origin main
```

### Alternative: Use gh CLI

If you have permissions to create repos via CLI:

```bash
gh repo create OfficeAddinApps-Figma --private --source=. --push
```

## Files Included in Sync

The following files will be committed:

- ✅ Source code (`src/`)
- ✅ Configuration files (`package.json`, `webpack.config.js`, etc.)
- ✅ Assets (`assets/`)
- ✅ VS Code settings (`.vscode/`)
- ✅ Manifest file (`manifest.xml`)
- ❌ `node_modules/` (excluded via .gitignore)
- ❌ `dist/` (excluded via .gitignore)

## Troubleshooting

### If git commands hang

```bash
# Kill any hanging git processes
pkill git

# Reinitialize
rm -rf .git
git init
```

### If you need to change the remote URL later

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

## After Pushing

Once pushed, you can:

1. View your repo at: `https://github.com/Jeninefer/OfficeAddinApps-Figma`
2. Set up GitHub Actions for CI/CD
3. Enable GitHub Pages for documentation
4. Add collaborators if needed

## Current Project Info

- **Location**: `/home/codespace/OfficeAddinApps/Figma`
- **Node Version**: v22.17.0
- **NPM Version**: 9.8.1
- **Dev Server**: Port 3000 (running)
- **GitHub User**: Jeninefer (<jeninefer@abacocapital.co>)
