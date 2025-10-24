# Git Troubleshooting Guide

This guide helps you resolve common Git issues when working with this repository.

## Table of Contents

- [Branch Tracking Issues](#branch-tracking-issues)
- [Push/Pull Failures](#pushpull-failures)
- [Quick Fixes](#quick-fixes)
- [Advanced Configuration](#advanced-configuration)

## Branch Tracking Issues

### Problem: "No tracking information for the current branch"

**Symptoms:**
```bash
$ git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
```

**Error:**
```bash
$ git push
fatal: The current branch main has no upstream branch.
To push the current branch and set the remote as upstream, use
    git push --set-upstream origin main
```

### Solution 1: Use the Automated Setup Script (Recommended)

We provide a helper script that automatically configures branch tracking:

```bash
# Run the setup script
bash setup-git-tracking.sh
```

This script will:
- ✅ Configure tracking for your current branch
- ✅ Update fetch configuration to track all remote branches
- ✅ Enable automatic push setup for future branches
- ✅ Display current tracking status

### Solution 2: Manual Setup for Current Branch

If you prefer to manually configure branch tracking:

```bash
# For the main branch
git branch --set-upstream-to=origin/main main

# For other branches, replace 'branch-name' with your branch
git branch --set-upstream-to=origin/branch-name branch-name
```

### Solution 3: Set Tracking When Pushing

When pushing a new branch for the first time:

```bash
# Push and set upstream in one command
git push -u origin branch-name

# Or use the shorter form
git push --set-upstream origin branch-name
```

## Push/Pull Failures

### Problem: Cannot Pull from Remote

**Error:**
```bash
$ git pull
fatal: refusing to merge unrelated histories
```

**Solution:**
```bash
# Allow merging unrelated histories (use with caution)
git pull origin main --allow-unrelated-histories
```

### Problem: Cannot Push to Remote

**Error:**
```bash
$ git push
error: failed to push some refs to 'origin'
```

**Solution:**
```bash
# First, fetch and merge remote changes
git fetch origin
git merge origin/main

# Or use pull with rebase
git pull --rebase origin main

# Then push your changes
git push origin main
```

## Quick Fixes

### Fix: Enable Automatic Upstream Configuration

Make Git automatically set up tracking when you push new branches:

```bash
# Set globally (applies to all repositories)
git config --global push.autoSetupRemote true

# Set locally (applies to current repository only)
git config push.autoSetupRemote true
```

After this configuration, you can simply use `git push` for new branches, and Git will automatically set up tracking.

### Fix: Configure Fetch to Track All Branches

By default, some repositories may only fetch specific branches. Configure to fetch all branches:

```bash
# Update fetch refspec
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

# Fetch all branches
git fetch origin
```

### Fix: View Current Tracking Status

Check which branches are tracking remote branches:

```bash
# Verbose branch listing with tracking info
git branch -vv

# Show remote branches
git branch -r

# Show all branches (local and remote)
git branch -a
```

## Advanced Configuration

### Configure Default Pull Behavior

Set the default behavior for `git pull`:

```bash
# Use merge (recommended for beginners)
git config pull.rebase false

# Use rebase (keeps history cleaner)
git config pull.rebase true

# Fail and require explicit merge/rebase choice
git config pull.ff only
```

### Setup Multiple Remotes

If you work with forks or multiple remotes:

```bash
# Add an upstream remote
git remote add upstream https://github.com/original-owner/repo.git

# Fetch from upstream
git fetch upstream

# Set tracking to upstream
git branch --set-upstream-to=upstream/main main
```

### Verify Git Configuration

Check your current Git configuration:

```bash
# Show all configuration
git config --list

# Show remote configuration
git remote -v

# Show branch configuration
git config --get-regexp branch
```

## Common Scenarios

### Scenario 1: Starting Fresh with a Cloned Repository

When you first clone the repository:

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs-with-supabase

# Main branch should already have tracking configured
# Verify with:
git branch -vv

# If not, run the setup script
bash setup-git-tracking.sh
```

### Scenario 2: Creating a New Feature Branch

When creating a new branch:

```bash
# Create and switch to new branch
git checkout -b feature/my-new-feature

# Make your changes and commit
git add .
git commit -m "Add new feature"

# Push with upstream setup
git push -u origin feature/my-new-feature

# Or if you've enabled push.autoSetupRemote:
git push
```

### Scenario 3: Switching Between Branches

When switching to a branch that exists on remote:

```bash
# Fetch latest remote branches
git fetch origin

# Switch to remote branch
git checkout branch-name

# If tracking isn't set up, run:
bash setup-git-tracking.sh
```

## Getting Help

If you continue to experience issues:

1. **Check Git version**: Ensure you have Git 2.0+ installed
   ```bash
   git --version
   ```

2. **Review Git status**: Always check what Git sees
   ```bash
   git status
   git remote -v
   git branch -vv
   ```

3. **Check repository documentation**: Review the [README.md](../README.md) for additional setup instructions

4. **Contact support**: For persistent issues, reach out to the development team

## Prevention Tips

To avoid branch tracking issues in the future:

1. ✅ Always use `git push -u origin <branch>` when pushing a new branch
2. ✅ Run `git config --global push.autoSetupRemote true` once on your system
3. ✅ Use `git branch -vv` regularly to check tracking status
4. ✅ Keep your local repository synchronized with `git fetch origin` regularly
5. ✅ Use the provided `setup-git-tracking.sh` script when setting up a new branch

## Additional Resources

- [Git Official Documentation](https://git-scm.com/doc)
- [GitHub Git Guides](https://github.com/git-guides)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

**Last Updated:** October 2025  
**Maintained by:** ExampleOrg DevOps Team
