#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG="scripts/cleanup.log"
echo "Cleanup run at: $(date -u)" >> "$LOG"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1) Find license files (excluding root /LICENSE)
echo "Finding license files..." | tee -a "$LOG"
mapfile -t LIC_FILES < <(find . -type f \( -iname "license*" -o -iname "licence*" -o -iname "copying" \) -not -path "./LICENSE" -not -path "./.git/*")
if [ ${#LIC_FILES[@]} -eq 0 ]; then
  echo "No extra license files found." | tee -a "$LOG"
else
  echo "Extra license files:" | tee -a "$LOG"
  for f in "${LIC_FILES[@]}"; do
    echo " - $f" | tee -a "$LOG"
  done

  # Backup them first
  BACKUP="scripts/license-backup-$(date +%Y%m%dT%H%M%SZ).zip"
  echo "Backing up extra license files to $BACKUP" | tee -a "$LOG"
  zip -q "$BACKUP" "${LIC_FILES[@]}"
  echo "Backup created." | tee -a "$LOG"

  # Delete extra license files
  echo "Deleting extra license files..." | tee -a "$LOG"
  for f in "${LIC_FILES[@]}"; do
    rm -f "$f"
    echo "Deleted: $f" >> "$LOG"
  done
fi

# 2) Remove common temporary/duplicate patterns
echo "Removing common duplicate/temp files..." | tee -a "$LOG"
find . -type f \( -iname "*.bak" -o -iname "*.old" -o -iname "*.copy" -o -iname "*copy*" -o -iname "*.tmp" \) -not -path "./.git/*" -print -delete >> "$LOG" 2>&1 || true

# ============================================
# 3. Fix Git configuration
# ============================================
echo -e "\n${YELLOW}🔧 Step 3: Fixing Git configuration...${NC}" | tee -a "$LOG"

# Remove invalid remote with placeholder
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if echo "$CURRENT_REMOTE" | grep -q "YOUR_USERNAME"; then
  echo -e "${RED}⚠️  Found invalid remote with placeholder${NC}" | tee -a "$LOG"
  echo "   Current: $CURRENT_REMOTE" | tee -a "$LOG"
  
  # Remove the invalid remote
  git remote remove origin 2>/dev/null || true
  echo -e "${GREEN}✅ Removed invalid remote${NC}" | tee -a "$LOG"
  
  # Inform user how to add correct remote
  echo -e "${BLUE}💡 To add your GitHub remote, run:${NC}" | tee -a "$LOG"
  echo "   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/OfficeAddinApps-Figma.git" | tee -a "$LOG"
  echo "   (Replace YOUR_GITHUB_USERNAME with your actual GitHub username)" | tee -a "$LOG"
fi

# Check if no remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
  echo -e "${YELLOW}ℹ️  No remote configured${NC}" | tee -a "$LOG"
  echo "   This is normal for a local repository." | tee -a "$LOG"
fi

# Set up branch tracking properly
if ! git config --get branch.main.remote >/dev/null 2>&1; then
  echo "Setting up local branch configuration..." | tee -a "$LOG"
  git config branch.main.merge refs/heads/main 2>/dev/null || true
fi

echo -e "${GREEN}✅ Git configuration cleaned${NC}" | tee -a "$LOG"

# 4) Log summary
echo "Cleanup finished at: $(date -u)" >> "$LOG"
echo "----" >> "$LOG"
echo "Done. Review $LOG for details."
echo "Note: backups stored as $BACKUP if any files were removed."
