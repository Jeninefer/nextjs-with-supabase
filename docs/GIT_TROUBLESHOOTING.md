# Git Troubleshooting Guide

This guide helps you resolve common Git synchronization issues in the Next.js with Supabase project.

## Common Git Issues and Solutions

### Issue 1: Push Failed - No Upstream Branch

**Error Message:**
```
fatal: The current branch has no upstream branch.
To push the current branch and set the remote as upstream, use:
    git push --set-upstream origin <branch-name>
```

**Solution:**
```bash
# Set upstream and push in one command
git push --set-upstream origin main

# Or set upstream for current branch
git push -u origin $(git branch --show-current)
```

**Prevention:**
When creating a new branch, set upstream immediately:
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

---

### Issue 2: Push Rejected - Non-Fast-Forward

**Error Message:**
```
! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'origin'
hint: Updates were rejected because the tip of your current branch is behind
```

**What This Means:**
Your local branch is behind the remote branch. Someone else pushed changes while you were working.

**Solution:**

**Option A: Pull and Merge (Recommended)**
```bash
# Pull latest changes and merge
git pull origin main

# If there are conflicts, resolve them, then:
git add .
git commit -m "Merge remote changes"

# Now push
git push origin main
```

**Option B: Pull with Rebase (For cleaner history)**
```bash
# Pull with rebase
git pull --rebase origin main

# If conflicts occur, resolve them, then:
git add .
git rebase --continue

# Push changes
git push origin main
```

**Prevention:**
Always pull before starting work:
```bash
# Start of work session
git pull origin main

# Make your changes...

# Before pushing, pull again
git pull origin main
git push origin main
```

---

### Issue 3: Merge Conflicts

**Error Message:**
```
CONFLICT (content): Merge conflict in <filename>
Automatic merge failed; fix conflicts and then commit the result.
```

**Solution:**

1. **Check which files have conflicts:**
   ```bash
   git status
   ```

2. **Open conflicted files and look for conflict markers:**
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Remote changes
   >>>>>>> branch-name
   ```

3. **Resolve conflicts:**
   - Edit the file to keep the correct version
   - Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Save the file

4. **Complete the merge:**
   ```bash
   git add <resolved-file>
   git commit -m "Resolve merge conflicts"
   git push origin main
   ```

**Tools to Help:**
- VS Code has built-in merge conflict resolution
- Use `git mergetool` for visual merge tools

---

### Issue 4: Diverged Branches

**Error Message:**
```
Your branch and 'origin/main' have diverged,
and have X and Y different commits each, respectively.
```

**Solution:**

**Option A: Merge remote changes**
```bash
git pull origin main
# Resolve any conflicts
git push origin main
```

**Option B: Rebase onto remote**
```bash
git pull --rebase origin main
# Resolve conflicts if any
git push origin main
```

---

### Issue 5: Accidentally Committed Wrong Files

**Solutions:**

**Remove file from staging (before commit):**
```bash
git reset HEAD <file>
```

**Remove file from last commit (not pushed yet):**
```bash
# Remove file but keep changes
git reset --soft HEAD^
git reset HEAD <file>
git commit -m "Your commit message"

# Or amend the commit
git rm --cached <file>
git commit --amend
```

**Remove file from Git but keep locally:**
```bash
git rm --cached <file>
git commit -m "Remove file from git"

# Add to .gitignore
echo "<file>" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
```

---

## Best Practices

### 1. Check Status Frequently
```bash
git status
```

### 2. Pull Before Starting Work
```bash
git pull origin main
```

### 3. Commit Often with Clear Messages
```bash
git add .
git commit -m "feat: add user authentication"
git push origin main
```

### 4. Use Branches for Features
```bash
git checkout -b feature/new-feature
# Make changes
git push -u origin feature/new-feature
```

### 5. Keep .gitignore Updated
Ensure temporary files, build artifacts, and local configs are ignored:
- `node_modules/`
- `.env.local`
- `.next/`
- `*.log`
- Temporary troubleshooting scripts

---

## Quick Reference Commands

### View Status and History
```bash
git status                  # Check current status
git log --oneline -10      # View recent commits
git branch -vv             # View branch tracking info
git remote -v              # View remote repositories
```

### Sync with Remote
```bash
git fetch origin           # Download remote changes
git pull origin main       # Fetch and merge
git push origin main       # Push local changes
```

### Undo Changes
```bash
git checkout -- <file>     # Discard changes to file
git reset HEAD <file>      # Unstage file
git reset --soft HEAD^     # Undo last commit, keep changes
git reset --hard HEAD^     # Undo last commit, discard changes (DANGEROUS)
```

### Branch Management
```bash
git branch                 # List branches
git checkout -b <branch>   # Create and switch to branch
git branch -d <branch>     # Delete branch (safe)
git branch -D <branch>     # Force delete branch
```

---

## Emergency Recovery

### If You're Completely Stuck

1. **Save your work:**
   ```bash
   git stash
   ```

2. **Reset to remote state:**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

3. **Restore your work:**
   ```bash
   git stash pop
   ```

4. **Manually resolve and commit:**
   ```bash
   git add .
   git commit -m "Apply my changes"
   git push origin main
   ```

---

## Getting Help

### From Git
```bash
git help <command>         # Detailed help for command
git <command> --help       # Same as above
```

### Additional Resources
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

## Common Git Workflows

### Daily Development Workflow
```bash
# Morning: Start work
git checkout main
git pull origin main
git checkout -b feature/my-feature

# During work: Commit frequently
git add .
git commit -m "Descriptive message"

# End of day: Push your branch
git push -u origin feature/my-feature

# When feature is done: Merge
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
```

### Hotfix Workflow
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix and test
git add .
git commit -m "fix: resolve critical bug"

# Merge back immediately
git checkout main
git merge hotfix/critical-bug
git push origin main

# Clean up
git branch -d hotfix/critical-bug
```

---

## Avoiding Future Issues

1. **Never work directly on main** - Use feature branches
2. **Pull frequently** - Stay in sync with remote
3. **Commit logical units** - One feature/fix per commit
4. **Write clear commit messages** - Future you will thank you
5. **Review before pushing** - Use `git diff` and `git status`
6. **Don't commit sensitive data** - Check `.env.local` is in `.gitignore`
7. **Don't commit build artifacts** - Keep `.gitignore` updated
8. **Don't create troubleshooting scripts in the repo** - Use your system's temporary directory (e.g., `/tmp` on Unix/Linux, `%TEMP%` on Windows) for temporary scripts

---

Last updated: 2025-10-24
