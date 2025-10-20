# Git Workflow Guide for ABACO Platform

## Quick Reference Commands

### Check Repository Status

```bash
# View current status
git status

# View recent commits
git log --oneline -10

# View changes
git diff

# View staged changes
git diff --cached
```

### Making Changes

```bash
# Stage all changes
git add .

# Stage specific files
git add path/to/file

# Commit changes with a message
git commit -m "Your descriptive commit message"

# Commit with detailed message
git commit -m "Brief summary" -m "Detailed description of changes"
```

### Syncing with Remote

```bash
# Pull latest changes
git pull origin main

# Push your changes
git push origin main

# Force sync (DANGER: This will permanently delete all uncommitted local changes!)
# WARNING: The following command will irreversibly discard ALL local changes (staged and unstaged) that have not been committed.
# This action CANNOT be undone. If you want to preserve your changes, run `git stash` before proceeding.
git fetch origin
git reset --hard origin/main
```

### Common Workflows

#### 1. Daily Development Workflow

```bash
# Start your day
cd ~/Documents/GitHub/nextjs-with-supabase
git status
git pull origin main

# Make your changes...

# Review what changed
git status
git diff

# Stage and commit
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin main
```

#### 2. Fixing Commit Message Errors

```bash
# If you get "error: switch `m' requires a value"
# Always provide a commit message after -m

# Incorrect:
git commit -m

# Correct:
git commit -m "Your commit message here"
```

#### 3. Handling Untracked Files

```bash
# See untracked files
git status

# Add specific files
git add file1.js file2.js

# Add all files in a directory
git add app/

# Add everything
git add .

# Ignore specific files (add to .gitignore)
echo "node_modules/" >> .gitignore
echo ".env.local" >> .gitignore
```

#### 4. Cleaning Up Repository

```bash
# Remove untracked files (dry run first)
git clean -n

# Actually remove untracked files
git clean -f

# Remove untracked directories too
git clean -fd

# Remove ignored files as well
git clean -fdx
```

### Branch Management

```bash
# List branches
git branch -a

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

### Troubleshooting

#### Problem: "nothing to commit, working tree clean"
**Solution:** You've already committed all changes. No action needed.

#### Problem: "Your branch is up to date"
**Solution:** Your local branch matches the remote. This is good!

#### Problem: Untracked files showing up
**Solution:** Either add them with `git add`, or add to `.gitignore` if they shouldn't be tracked.

#### Problem: Merge conflicts
**Solution:**
```bash
# View conflicts
git status

# Edit conflicted files manually
# Look for <<<<<<, ======, >>>>>> markers

# After resolving
git add resolved-file.js
git commit -m "fix: resolve merge conflict"
```

## ABACO Platform Specific Workflows

### Deploying to Production

```bash
# 1. Ensure everything is committed
git status

# 2. Build and test locally
npm run build
npm run type-check

# 3. Commit production-ready changes
git add .
git commit -m "chore: prepare for production deployment"

# 4. Tag the release
git tag -a v1.0.0 -m "Production release v1.0.0"

# 5. Push everything
git push origin main
git push origin v1.0.0
```

### Working with Database Changes

```bash
# 1. Create migration file
# Edit: supabase/migrations/00X_description.sql

# 2. Test locally (if using local Supabase)
supabase db reset

# 3. Commit migration
git add supabase/migrations/
git commit -m "feat: add customer analytics schema"

# 4. Apply in production via Supabase Dashboard
# Dashboard → Database → SQL Editor → Paste SQL
```

### Syncing Data Files

```bash
# Data files are tracked in Git
git add notebooks/financial_analysis_results.csv
git commit -m "data: update customer financial data"

# Large files should use Git LFS (if needed)
git lfs track "*.csv"
git add .gitattributes
```

## Best Practices

### Commit Message Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: add customer risk analysis dashboard"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update production deployment guide"
git commit -m "chore: update dependencies"
```

### What to Track vs Ignore

**Always track:**
- Source code (.ts, .tsx, .js, .jsx)
- Configuration files (package.json, tsconfig.json)
- Documentation (.md files)
- Database migrations (.sql files)
- Public assets (images, fonts)

**Never track (add to .gitignore):**
- `node_modules/`
- `.next/`
- `.env.local`
- `.env`
- `dist/`
- Build artifacts
- IDE settings (except shared configs)

### Daily Checklist

Before starting work:
- [ ] `git pull origin main`
- [ ] `npm install` (if package.json changed)
- [ ] Check `git status`

After making changes:
- [ ] `npm run type-check`
- [ ] `npm run build`
- [ ] Review changes: `git diff`
- [ ] Stage files: `git add .`
- [ ] Commit: `git commit -m "descriptive message"`
- [ ] Push: `git push origin main`

## Emergency Recovery

### Undo Last Commit (not pushed)

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Undo After Push

```bash
# Create new commit that reverses changes
git revert HEAD
git push origin main
```

### Recover Lost Changes

```bash
# View all actions
git reflog

# Restore to specific point
git reset --hard HEAD@{2}
```

## Getting Help

```bash
# Help for any command
git help <command>
git help commit
git help push

# Quick help
git <command> -h
git commit -h
```

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
