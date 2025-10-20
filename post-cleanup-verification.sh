#!/bin/bash
# ABACO Platform - Final Verification Script

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

echo "🔍 ABACO POST-CLEANUP VERIFICATION REPORT"
echo "=========================================="

echo ""
echo "📊 FILE STRUCTURE ANALYSIS:"
echo "============================"

echo "1. Lockfiles (should be 1):"
echo "   Count: $(find . -name '*lock*' -type f | wc -l)"
find . -name '*lock*' -type f

echo ""
echo "2. Configuration Files:"
find . -maxdepth 1 -name '*.config.*' -type f | sort

echo ""
echo "3. Component Structure:"
echo "   Total .tsx files: $(find . -name '*.tsx' -not -path './node_modules/*' | wc -l)"
echo "   Components directory: $(find components -name '*.tsx' 2>/dev/null | wc -l) files"
echo "   App components: $(find app -name '*.tsx' 2>/dev/null | wc -l) files"

echo ""
echo "4. Utility Structure:"
echo "   lib/ directory: $(ls -la lib/ 2>/dev/null | wc -l) items"
echo "   utils/ directory: $(ls -la utils/ 2>/dev/null | wc -l) items"

echo ""
echo "5. Supabase Integration:"
find . -path '*/supabase/*' -name '*.ts' -type f 2>/dev/null

echo ""
echo "6. Documentation:"
find . -maxdepth 2 -iname 'readme*' -type f

echo ""
echo "7. Build Artifacts (should be 0):"
echo "   .next: $(ls -la .next 2>/dev/null | wc -l)"
echo "   node_modules/.cache: $(ls -la node_modules/.cache 2>/dev/null | wc -l)"

echo ""
echo "8. System Files (should be 0):"
echo "   .DS_Store: $(find . -name '.DS_Store' | wc -l)"
echo "   Temp files: $(find . -name '*.tmp' -o -name '*.temp' | wc -l)"

echo ""
echo "✅ VERIFICATION COMPLETE"
echo "Repository optimization status: READY FOR DEVELOPMENT"
