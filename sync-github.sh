#!/bin/bash
set -e

echo "🚀 Syncing Office Add-in Figma project to GitHub..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Initialize git if needed
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Step 1: Initializing Git repository...${NC}"
    git init
    git branch -M main
else
    echo -e "${GREEN}✓ Git repository already initialized${NC}"
fi

# Step 2: Add files to staging
echo -e "${BLUE}Step 2: Adding files to Git (excluding node_modules and dist)...${NC}"
git add \
    .gitignore \
    .eslintrc.json \
    .vscode/ \
    README.md \
    babel.config.json \
    manifest.xml \
    package.json \
    package-lock.json \
    webpack.config.js \
    assets/ \
    src/

echo -e "${GREEN}✓ Files staged${NC}"

# Step 3: Create initial commit if there are changes
echo -e "${BLUE}Step 3: Creating initial commit...${NC}"
if git diff --cached --quiet; then
    echo -e "${GREEN}✓ No changes to commit${NC}"
else
    git commit -m "Initial commit: Office Add-in Figma project

- Office Add-in taskpane setup
- Webpack configuration for development and production builds
- Manifest for Excel, Word, PowerPoint, and Outlook
- Assets and source files
- Dev server running on port 3000"
    echo -e "${GREEN}✓ Initial commit created${NC}"
fi

# Step 4: Instructions for creating GitHub repo
echo ""
echo -e "${BLUE}Step 4: Create GitHub repository${NC}"
echo "You need to create a GitHub repository manually. Choose one of these options:"
echo ""
echo "Option A: Using GitHub web interface"
echo "  1. Go to https://github.com/new"
echo "  2. Repository name: OfficeAddinApps-Figma"
echo "  3. Description: Office Add-in for Figma integration"
echo "  4. Choose Private or Public"
echo "  5. DO NOT initialize with README, .gitignore, or license"
echo "  6. Click 'Create repository'"
echo ""
echo "Option B: Using gh CLI (if you have repo creation permissions)"
echo "  Run: gh repo create OfficeAddinApps-Figma --private --description='Office Add-in for Figma integration'"
echo ""
echo "After creating the repository, run these commands to push:"
echo ""
echo -e "${GREEN}git remote add origin https://github.com/Jeninefer/OfficeAddinApps-Figma.git${NC}"
echo -e "${GREEN}git push -u origin main${NC}"
echo ""
echo "Note: Replace 'Jeninefer' with your actual GitHub username if different"
