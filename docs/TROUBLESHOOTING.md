# Troubleshooting Guide

This guide covers common issues and their solutions for the Next.js with Supabase Starter Template.

## Table of Contents

- [SonarQube Docker ENOENT Error](#sonarqube-docker-enoent-error)
- [Port Already in Use](#port-already-in-use)
- [Git Sync Issues](#git-sync-issues)
- [Build Failures](#build-failures)

## SonarQube Docker ENOENT Error

### Problem

When starting the SonarQube server from VSCode, you encounter the error:

```
Error spawn docker ENOENT
Connection state: Error spawn docker ENOENT
```

### Root Cause

This error occurs when the SonarQube VSCode extension cannot find the Docker executable in its PATH. Even though Docker may be installed on your system, VSCode extensions may not have access to it due to PATH configuration issues.

### Solutions

#### Solution 1: Configure Docker Path in VSCode Settings

1. Open VSCode Settings (File > Preferences > Settings or `Cmd/Ctrl + ,`)
2. Search for "Docker path"
3. Add the Docker executable path to your VSCode settings:

   **For macOS/Linux:**
   ```json
   {
     "terminal.integrated.env.osx": {
       "PATH": "/usr/local/bin:/usr/bin:${env:PATH}"
     },
     "terminal.integrated.env.linux": {
       "PATH": "/usr/local/bin:/usr/bin:${env:PATH}"
     }
   }
   ```

   **For Windows:**
   ```json
   {
     "terminal.integrated.env.windows": {
       "PATH": "C:\\Program Files\\Docker\\Docker\\resources\\bin;${env:PATH}"
     }
   }
   ```

#### Solution 2: Verify Docker Installation

Ensure Docker is installed and running:

```bash
# Check if Docker is installed
docker --version

# Check if Docker daemon is running
docker info

# On macOS:
# If you use Docker Desktop (the recommended way to run Docker on macOS):
open -a Docker
# Wait for Docker Desktop's GUI to show that Docker is "running" before running Docker commands.

# If you use a command-line Docker installation (e.g., via Homebrew), check if the Docker daemon is running:
pgrep -fl dockerd
```

#### Solution 3: Install Docker if Not Present

**macOS:**
```bash
brew install --cask docker
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

**Windows:**
Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

#### Solution 4: Alternative - Use SonarQube Cloud Instead

If Docker issues persist, consider using SonarQube Cloud instead of the local Docker-based SonarQube:

1. Go to [SonarCloud](https://sonarcloud.io)
2. Sign up/Login with your GitHub account
3. Configure the SonarQube extension to use SonarCloud instead of local server
4. Update VSCode settings:
   ```json
   {
     "sonarlint.connectedMode.connections.sonarcloud": [
       {
         "organizationKey": "your-org-key",
         "token": "your-token"
       }
     ]
   }
   ```

#### Solution 5: Disable SonarQube Extension Temporarily

If you don't need SonarQube analysis immediately:

1. Open VSCode Extensions panel (`Cmd/Ctrl + Shift + X`)
2. Search for "SonarLint" or "SonarQube"
3. Click "Disable" to temporarily disable the extension
4. Restart VSCode

#### Solution 6: Use SonarQube Docker Script

This repository includes a management script for running SonarQube in Docker:

```bash
# Start SonarQube
./scripts/sonarqube-docker.sh start

# Check status
./scripts/sonarqube-docker.sh status

# View logs
./scripts/sonarqube-docker.sh logs

# Stop SonarQube
./scripts/sonarqube-docker.sh stop

# Clean up (remove container and volumes)
./scripts/sonarqube-docker.sh clean
```

After starting SonarQube, access the admin UI at http://localhost:9000 with default credentials (admin/admin).

## Port Already in Use

### Problem
The development server fails to start with "Port already in use" error.

### Solution

```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

## Git Sync Issues

### Problem
Unable to push or pull changes from the repository.

### Solutions

```bash
# Check current status
git status

# Pull latest changes
git pull origin main

# If there are conflicts, resolve them and commit
git add .
git commit -m "Resolve merge conflicts"

# Push changes
git push origin main
```

## Build Failures

### Problem
`npm run build` fails with various errors.

### Solutions

```bash
# Clean build artifacts
npm run clean

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Fix linting issues
npm run lint -- --fix

# Try building again
npm run build
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Quick Start Guide](../QUICK_START.md)
- [Build Success Log](../BUILD_SUCCESS.md)

## Getting Help

If you encounter issues not covered in this guide:

- **GitHub Issues:** Create an issue in the repository

---

Last updated: 2025-10-22
