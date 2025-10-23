# ABACO Platform Troubleshooting Guide

This guide provides detailed solutions for common issues encountered when developing and running the ABACO Financial Intelligence Platform.

## Table of Contents

1. [SonarQube Docker ENOENT Error](#sonarqube-docker-enoent-error)
2. [Port Conflict Resolution](#port-conflict-resolution)
3. [Git Synchronization Issues](#git-synchronization-issues)
4. [Python Analysis Troubleshooting](#python-analysis-troubleshooting)
5. [Build Failure Recovery](#build-failure-recovery)
6. [Cloud Dataproc API Configuration](#cloud-dataproc-api-configuration)

---

## SonarQube Docker ENOENT Error

**Error Message:**
```
Connection state: Error spawn docker ENOENT
```

**Root Cause:**
The SonarQube VSCode extension cannot locate the Docker executable because VSCode extensions don't inherit the full system PATH by default.

### Solution 1: Configure Docker PATH in VSCode Settings (Recommended)

The project includes Docker PATH configuration in `.vscode/settings.json`. If you're still experiencing issues:

1. **Verify the settings are in place:**
   - Open `.vscode/settings.json`
   - Ensure these settings exist:
     ```json
     "terminal.integrated.env.osx": {
         "PATH": "/usr/local/bin:/usr/bin:${env:PATH}"
     },
     "terminal.integrated.env.linux": {
         "PATH": "/usr/local/bin:/usr/bin:${env:PATH}"
     }
     ```

2. **Restart VSCode:**
   - Completely quit VSCode (Cmd+Q on macOS, or close all windows)
   - Reopen the project
   - The extension should now detect Docker

### Solution 2: Verify Docker Installation and Daemon Status

1. **Check if Docker is installed:**
   ```bash
   which docker
   docker --version
   ```

2. **Verify Docker daemon is running:**
   ```bash
   docker ps
   ```

3. **If Docker daemon isn't running:**
   - **macOS:** Open Docker Desktop application
   - **Linux:** 
     ```bash
     sudo systemctl start docker
     sudo systemctl enable docker
     ```
   - **Windows:** Start Docker Desktop

### Solution 3: Install Docker

If Docker is not installed on your system:

#### macOS

1. **Using Homebrew:**
   ```bash
   brew install --cask docker
   ```

2. **Manual Installation:**
   - Download Docker Desktop from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Install and start Docker Desktop
   - Verify installation: `docker --version`

#### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl gnupg lsb-release

# Add Docker's GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows

1. Download Docker Desktop from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Restart your computer
4. Start Docker Desktop
5. Verify installation in PowerShell: `docker --version`

### Solution 4: Use SonarQube Cloud Alternative

If Docker setup is challenging, consider using SonarQube Cloud:

1. Create account at [sonarcloud.io](https://sonarcloud.io)
2. Configure the SonarQube VSCode extension to use Cloud:
   - Open VSCode Settings (Cmd+, or Ctrl+,)
   - Search for "SonarQube"
   - Select "Connected Mode"
   - Enter your SonarQube Cloud credentials

### Solution 5: Temporary Workaround - Disable Extension

If you need to continue working immediately:

1. Open VSCode Extensions (Cmd+Shift+X or Ctrl+Shift+X)
2. Search for "SonarQube"
3. Click "Disable" temporarily
4. Re-enable after resolving Docker issues

---

## Port Conflict Resolution

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solution

1. **Identify process using port 3000:**
   ```bash
   lsof -i :3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```
   Replace `<PID>` with the process ID from step 1.

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Alternative: Use a different port:**
   ```bash
   PORT=3001 npm run dev
   ```

---

## Git Synchronization Issues

### Issue: Uncommitted Changes Blocking Pull

**Error Message:**
```
error: Your local changes to the following files would be overwritten by merge
```

### Solution

1. **Check repository status:**
   ```bash
   git status
   ```

2. **Stash local changes:**
   ```bash
   git stash
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Apply stashed changes:**
   ```bash
   git stash pop
   ```

### Issue: Push Rejected

**Error Message:**
```
! [rejected] main -> main (non-fast-forward)
```

### Solution

1. **Pull with rebase:**
   ```bash
   git pull --rebase origin main
   ```

2. **Resolve any conflicts if they occur**

3. **Push changes:**
   ```bash
   git push origin main
   ```

---

## Python Analysis Troubleshooting

### Issue: Python Script Not Running

**Symptoms:**
- Financial analysis scripts in `notebooks/` directory not executing
- Python import errors

### Solution 1: Verify Python Installation

```bash
python3 --version
which python3
```

### Solution 2: Install Required Python Dependencies

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt  # If requirements.txt exists
```

### Solution 3: Run Financial Analysis

```bash
python3 notebooks/abaco_financial_intelligence.py
```

### Solution 4: Check Python Path in VSCode

Verify the Python interpreter path in `.vscode/settings.json`:
```json
"python.defaultInterpreterPath": "/usr/local/bin/python3"
```

---

## Build Failure Recovery

### Issue: Next.js Build Fails

**Common Error Messages:**
- `Error: Cannot find module`
- `Type error: Cannot find name`
- `Build optimization failed`

### Solution 1: Clean Build Cache

```bash
npm run clean
rm -rf .next
npm install
npm run build
```

### Solution 2: Clear Node Modules

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Solution 3: Type Check

```bash
npm run type-check
```

Fix any TypeScript errors reported.

### Solution 4: Check Environment Variables

Ensure `.env.local` exists with required Supabase credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Cloud Dataproc API Configuration

### Issue: Cloud Dataproc API Not Enabled

**Error Message:**
```
Error listing clusters: Error: Cloud Dataproc API has not been used in project gen-lang-client-0516194156 before or it is disabled.
```

### Solution

1. **Enable the Cloud Dataproc API:**

   Visit: [console.cloud.google.com/apis/library/dataproc.googleapis.com](https://console.cloud.google.com/apis/library/dataproc.googleapis.com)

2. **Or use gcloud CLI:**
   ```bash
   gcloud services enable dataproc.googleapis.com --project=gen-lang-client-0516194156
   ```

3. **Verify API is enabled:**
   ```bash
   gcloud services list --enabled --project=gen-lang-client-0516194156 | grep dataproc
   ```

4. **Check permissions:**
   Ensure your account has the necessary IAM roles:
   - `roles/dataproc.admin` or
   - `roles/dataproc.editor`

5. **Set default project (if needed):**
   ```bash
   gcloud config set project gen-lang-client-0516194156
   ```

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Quick Start Guide](../QUICK_START.md)
- [Build Success Log](../BUILD_SUCCESS.md)

## Getting Help

If you continue to experience issues after following this guide:

1. **Check existing issues:** Review [GitHub Issues](https://github.com/nextjs-with-supabase/issues)
2. **Create a new issue:** Include error messages, steps to reproduce, and your environment details
3. **Contact support:**
   - Technical support: <tech@abaco-platform.com>
   - Community discussions: [GitHub Discussions](https://github.com/abaco-platform/abaco/discussions)

---

**Last Updated:** October 22, 2025
