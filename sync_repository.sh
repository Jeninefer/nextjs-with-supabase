#!/bin/bash
# ABACO Financial Intelligence Platform - Git Synchronization Helper
# This script keeps your local repository in sync with the remote origin
# and provides gentle guidance for managing Supabase-first development.

set -euo pipefail

# Resolve the repository root based on the script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"

cd "${REPO_ROOT}"

if [[ ! -d .git ]]; then
  echo "❌ Error: ${REPO_ROOT} is not a Git repository"
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "🔄 ABACO Repository Synchronization"
echo "=================================="
echo "📍 Repository: ${REPO_ROOT}"
echo "🌿 Active branch: ${CURRENT_BRANCH}"

# Show a concise status snapshot before pulling
if git status --short | grep -q "."; then
  echo "\n📊 Working tree changes detected:"
  git status --short
else
  echo "\n✅ Working tree is currently clean"
fi

# Ensure we are up to date with origin
echo "\n⬇️ Fetching latest changes from origin/${CURRENT_BRANCH}..."
if git pull --rebase origin "${CURRENT_BRANCH}"; then
  echo "✅ Repository successfully updated"
else
  echo "⚠️ Pull completed with conflicts. Resolve them and re-run the script."
  exit 1
fi

# Re-check the status to guide the developer on next steps
if git status --short | grep -q "."; then
  echo "\n📝 Pending changes remain in your working tree."
  echo "   Use 'git add <file>' to stage them and 'git commit' to capture your work."
else
  echo "\n✨ Working tree remains clean after synchronization."
fi

# Provide a quick Supabase environment reminder
REQUIRED_ENV=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY")
if [[ ! -f .env.local ]]; then
  echo "\n💡 Tip: create a .env.local file with your Supabase project credentials."
  echo "   You can copy .env.example as a starting point: cp .env.example .env.local"
else
  MISSING_VARS=()
  for VAR in "${REQUIRED_ENV[@]}"; do
    if ! grep -q "^${VAR}=" .env.local; then
      MISSING_VARS+=("${VAR}")
    fi
  done
  if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo "\n⚠️ Supabase environment variables missing from .env.local: ${MISSING_VARS[*]}"
    echo "   Update the file with the values from your Supabase dashboard."
  else
    echo "\n🔐 Supabase environment variables detected in .env.local"
  fi
fi

echo "\n🏁 Synchronization complete. Happy building!"
