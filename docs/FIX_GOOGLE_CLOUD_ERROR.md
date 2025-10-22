# 🔧 Fix Google Cloud Dataproc Error - Complete Solution

This guide provides a permanent fix for Google Cloud Dataproc environment variable interference with ABACO development.

## 🚨 The Problem

Google Cloud SDK sometimes auto-configures environment variables that can interfere with:
- Next.js development server
- Python analytics execution
- Local database connections
- Build processes

Common error symptoms:
- Unexpected Google Cloud authentication prompts
- Dataproc cluster configuration errors
- Environment variable conflicts
- Build or runtime failures

## ✅ Quick Fix - One-Liner

Run this single command to fix everything:

```bash
./scripts/setup_clean_environment.sh
```

## 📋 Manual Step-by-Step Fix

If you prefer to fix things manually, follow these steps:

### Step 1: Clear Google Cloud Environment Variables

```bash
./scripts/clear_google_cloud_env.sh
```

This clears all Google Cloud-related environment variables including:
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GOOGLE_CLOUD_PROJECT`
- `GCLOUD_PROJECT`
- `CLOUDSDK_*` variables
- `DATAPROC_*` variables

### Step 2: Disable gcloud Auto-Configuration

```bash
./scripts/disable_gcloud_autoconfig.sh
```

This disables:
- gcloud command completion prompts
- Usage reporting
- Automatic project configuration

### Step 3: Update Shell Configuration Files

Add these lines to your `~/.bashrc` or `~/.zshrc`:

```bash
# ABACO: Prevent Google Cloud auto-configuration
export CLOUDSDK_CORE_DISABLE_PROMPTS=1
export CLOUDSDK_CORE_DISABLE_USAGE_REPORTING=1
```

### Step 4: Verify Environment is Clean

Check that no Google Cloud variables remain:

```bash
env | grep -i "GOOGLE\|GCLOUD\|DATAPROC"
```

Expected output: Empty or only `CHROME_BIN` (which is harmless)

### Step 5: Restart Terminal & Test

```bash
# Close and reopen your terminal, then test:

# Test 1: Check environment
env | grep -i "GOOGLE\|GCLOUD\|DATAPROC"

# Test 2: Start Next.js
npm run dev

# Test 3: Run Python analysis
./run_financial_analysis.sh

# Test 4: Verify new terminal sessions
# Open a new terminal and repeat Test 1
```

## 🔍 Why This Error Happens

Google Cloud SDK automatically adds configuration to shell startup files (`.bashrc`, `.zshrc`) and sets environment variables that can:

1. **Conflict with local development**: Environment variables intended for cloud deployment interfere with local servers
2. **Trigger authentication prompts**: SDK tries to authenticate for services not being used
3. **Override default behaviors**: Cloud configurations override local tool defaults
4. **Break build processes**: Build tools may try to connect to cloud resources

## ✅ Verify the Fix

### Test 1: No Google Cloud Variables

```bash
env | grep -E "^(GOOGLE_|GCLOUD_|CLOUDSDK_|GCP_|DATAPROC_)"
# Should return nothing (no output means success)
```

Or use the comprehensive verification script:

```bash
./scripts/verify_environment.sh
# Will check all aspects of your environment
```

### Test 2: Start Next.js Without Errors

```bash
npm run dev
# Should start on http://localhost:3000 without any Google Cloud errors
```

Expected output:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
✓ Ready in 2s
```

### Test 3: Run Python Analysis

```bash
./run_financial_analysis.sh
# Should execute without cloud authentication prompts
```

### Test 4: New Terminal Sessions

```bash
# Open a new terminal
./scripts/verify_environment.sh
# Should show all tests passing
```

## 📋 What ABACO Actually Uses

ABACO platform does **NOT** require Google Cloud for local development:

✅ **What we use:**
- Next.js 15 (Node.js runtime)
- Supabase (PostgreSQL database)
- Python virtual environment (local analytics)
- Local development server
- Git version control

❌ **What we DON'T use locally:**
- Google Cloud Dataproc
- Google Cloud Storage
- Google Cloud authentication
- Any GCP services

## 🚀 After Fix - Your Workflow

Once the fix is applied, your development workflow should be:

```bash
# 1. Navigate to project
cd /path/to/nextjs-with-supabase

# 2. Start Next.js development server
npm run dev
# Opens http://localhost:3000

# 3. Run Python analytics (separate terminal)
./run_financial_analysis.sh
# Generates charts and exports

# 4. Access Jupyter notebooks (optional)
source abaco_venv/bin/activate
jupyter notebook
```

## 🎯 Permanent Fix - One-Liner

To apply all fixes permanently:

### For bash users:
1. Change to your project directory:
   ```bash
   cd /path/to/nextjs-with-supabase

## 🛟 Support

If you still encounter issues after applying this fix:

1. Check if other Google Cloud tools are running: `ps aux | grep gcloud`
2. Verify shell configuration: `cat ~/.bashrc | grep CLOUD` (or `~/.zshrc`)
3. Check for global Git hooks: `git config --global --list | grep gcloud`
4. Review system-wide environment: `cat /etc/environment | grep GOOGLE`

## 📚 Additional Resources

- [ABACO Quick Start Guide](../QUICK_START.md)
- [Build Success Documentation](./BUILD_SUCCESS.md)
- [Deployment Guide](./DEPLOYMENT-READY.md)

---

**ABACO Financial Intelligence Platform** - Clean, cloud-independent local development.
