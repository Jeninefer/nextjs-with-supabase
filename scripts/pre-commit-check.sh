#!/usr/bin/env bash
# Quick pre-commit checker to prevent committing license duplicates or temp files
STAGED=$(git diff --cached --name-only)
if echo "$STAGED" | grep -E '\.(bak|old|copy|tmp)$' >/dev/null; then
  echo "ERROR: You are trying to commit temp/duplicate files. Remove them before committing."
  echo "$STAGED" | grep -E '\.(bak|old|copy|tmp)$'
  exit 1
fi

if echo "$STAGED" | grep -Ei 'license|licence|copying' | grep -v '^LICENSE$' >/dev/null; then
  echo "ERROR: Attempting to commit license files other than root LICENSE. Remove or consolidate."
  echo "$STAGED" | grep -Ei 'license|licence|copying' | grep -v '^LICENSE$'
  exit 1
fi

# All good
exit 0
