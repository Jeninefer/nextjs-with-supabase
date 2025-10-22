# Google Cloud Dataproc Error Fix - Usage Examples

This document provides practical examples of how to use the Google Cloud fix scripts.

## Scenario 1: First Time Setup

If you're setting up the ABACO platform for the first time:

```bash
# Clone the repository
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase

# Run the complete fix
./scripts/setup_clean_environment.sh

# Install dependencies
npm install

# Verify everything is ready
./scripts/verify_environment.sh

# Start development
npm run dev
```

## Scenario 2: Existing Installation Having Issues

If you already have the project but are experiencing Google Cloud errors:

```bash
# Navigate to project
cd nextjs-with-supabase

# Quick fix
./scripts/setup_clean_environment.sh

# Verify the fix
./scripts/verify_environment.sh

# Restart your development server
npm run dev
```

## Scenario 3: Continuous Integration / Automated Setup

For CI/CD pipelines or automated setup scripts:

```bash
#!/bin/bash
set -e

# Clear any Google Cloud interference
./scripts/clear_google_cloud_env.sh

# Disable gcloud auto-configuration
export CLOUDSDK_CORE_DISABLE_PROMPTS=1
export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1

# Install dependencies
npm install

# Run build
npm run build

# Run tests
npm run lint
npm run type-check
```

## Scenario 4: Individual Script Usage

### Clear Environment Variables Only

```bash
./scripts/clear_google_cloud_env.sh
```

**Output:**
```
🔧 Clearing Google Cloud Environment Variables
==============================================
📝 Unsetting Google Cloud environment variables...
  ✓ Unsetting GOOGLE_APPLICATION_CREDENTIALS
  ✓ Unsetting GOOGLE_CLOUD_PROJECT
  ✓ Unsetting DATAPROC_REGION
✅ Google Cloud environment variables cleared!

🔍 Verifying environment is clean...
✅ No Google Cloud variables found

✅ Environment is now clean and ready for ABACO development!
```

### Disable gcloud Auto-Configuration Only

```bash
./scripts/disable_gcloud_autoconfig.sh
```

**Output:**
```
🔧 Disabling gcloud Auto-Configuration
======================================
📝 Disabling gcloud auto-configuration...
  Found gcloud SDK at: /usr/local/google-cloud-sdk
  ✓ Disabled gcloud prompts and usage reporting
✅ gcloud auto-configuration disabled!

💡 To make this permanent, add these lines to your shell configuration:
   export CLOUDSDK_CORE_DISABLE_PROMPTS=1
   export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1
```

### Verify Environment Only

```bash
./scripts/verify_environment.sh
```

**Successful Output:**
```
🔍 ABACO Environment Verification
==================================

Test 1: Google Cloud Environment Variables
-------------------------------------------
✅ PASS: No Google Cloud environment variables found

Test 2: Node.js Installation
-----------------------------
✅ PASS: Node.js installed (v20.19.5)

Test 3: npm Installation
------------------------
✅ PASS: npm installed (10.8.2)

Test 4: Python Installation
---------------------------
✅ PASS: Python installed (Python 3.12.3)

Test 5: Dependencies Installation
----------------------------------
✅ PASS: node_modules directory exists

Test 6: Environment Configuration
----------------------------------
✅ PASS: .env.local file exists

Test 7: Shell Configuration
---------------------------
✅ PASS: Shell configured to prevent Google Cloud interference

Test 8: Python Virtual Environment
-----------------------------------
✅ PASS: Python virtual environment exists

======================================
📊 Verification Summary
======================================
✅ Passed: 8

🎉 All tests passed!
Your environment is ready for ABACO development.

🚀 Next steps:
  1. npm run dev    # Start Next.js server
  2. ./run_financial_analysis.sh  # Run Python analytics
```

## Scenario 5: Making Changes Permanent

To prevent Google Cloud interference permanently across all terminal sessions:

**For Bash users:**
```bash
echo -e '\n# ABACO: Prevent Google Cloud auto-configuration\nexport CLOUDSDK_CORE_DISABLE_PROMPTS=1\nexport CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1' >> ~/.bashrc
source ~/.bashrc
```

**For Zsh users:**
```bash
echo -e '\n# ABACO: Prevent Google Cloud auto-configuration\nexport CLOUDSDK_CORE_DISABLE_PROMPTS=1\nexport CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1' >> ~/.zshrc
source ~/.zshrc
```

**Verify the permanent fix:**
```bash
# Close and reopen terminal
./scripts/verify_environment.sh

# Test 7 should now show:
# ✅ PASS: Shell configured to prevent Google Cloud interference
```

## Common Error Messages Fixed

### Before Fix

❌ **Error:** Google Cloud Dataproc region not set
```
Error: DATAPROC_REGION environment variable is not set.
Please configure your Google Cloud Dataproc cluster.
```

❌ **Error:** Authentication required
```
ERROR: (gcloud.auth.application-default.login) Your current active account...
Please run: gcloud auth application-default login
```

❌ **Error:** Project not configured
```
ERROR: (gcloud) The required property [project] is not currently set.
You may set it for your current workspace by running:
  $ gcloud config set project VALUE
```

### After Fix

✅ **Success:** Clean development environment
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
✓ Ready in 2s
```

✅ **Success:** Python analytics run smoothly
```
🚀 ABACO Financial Intelligence Platform
=======================================
🔄 Activating virtual environment...
💰 Running ABACO Financial Intelligence Analysis...
✅ Analysis complete!
```

## Troubleshooting

### Script Permission Denied

If you get "Permission denied" when running scripts:

```bash
chmod +x scripts/*.sh
./scripts/setup_clean_environment.sh
```

### Environment Variables Still Present

If Google Cloud variables persist after running the fix:

```bash
# Check what's setting them
grep -r "GOOGLE_CLOUD\|GCLOUD\|DATAPROC" ~/.bashrc ~/.zshrc ~/.profile 2>/dev/null

# Remove or comment out any Google Cloud configuration

# Restart terminal
exec $SHELL
```

### gcloud SDK Still Interfering

If you have Google Cloud SDK installed and it's still causing issues:

```bash
# Option 1: Rename gcloud SDK temporarily (don't delete - you might need it for other projects)
mv ~/google-cloud-sdk ~/google-cloud-sdk.bak

# Option 2: Remove gcloud from PATH in shell config
# Edit ~/.bashrc or ~/.zshrc and comment out lines like:
# source ~/google-cloud-sdk/path.bash.inc
# source ~/google-cloud-sdk/completion.bash.inc
```

## Integration with Other Tools

### Docker

If using Docker for deployment:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Clear any Google Cloud environment variables
ENV CLOUDSDK_CORE_DISABLE_PROMPTS=1
ENV CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Fix Google Cloud Environment",
      "type": "shell",
      "command": "./scripts/setup_clean_environment.sh",
      "problemMatcher": []
    },
    {
      "label": "Verify Environment",
      "type": "shell",
      "command": "./scripts/verify_environment.sh",
      "problemMatcher": []
    }
  ]
}
```

### Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "env:fix": "./scripts/setup_clean_environment.sh",
    "env:verify": "./scripts/verify_environment.sh",
    "predev": "./scripts/clear_google_cloud_env.sh"
  }
}
```

Then use:
```bash
npm run env:fix      # Fix environment
npm run env:verify   # Verify environment
npm run dev          # Automatically clears Google Cloud env before starting
```

## Complete Workflow Example

Here's a complete workflow from clone to running application:

```bash
# 1. Clone repository
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase

# 2. Fix Google Cloud interference
./scripts/setup_clean_environment.sh

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 5. Verify everything is ready
./scripts/verify_environment.sh

# 6. Build the application
npm run build

# 7. Start development server
npm run dev

# 8. In a new terminal, run Python analytics
source abaco_venv/bin/activate
python notebooks/abaco_financial_intelligence.py

# 9. Access the application
# Open http://localhost:3000 in your browser
```

Success! Your ABACO platform is now running without Google Cloud interference.
