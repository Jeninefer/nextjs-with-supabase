#!/bin/bash
# ABACO Financial Intelligence Platform - Post-Cleanup Validation

echo "🔍 ABACO Financial Intelligence - Post-Cleanup Validation"
echo "======================================================"

VALIDATION_ERRORS=0

# Check for duplicate files
echo "🔍 Checking for duplicate files..."
DUPLICATE_WORKFLOWS=$(find .github/workflows -name "*sonar*" -type f | wc -l)
if [[ $DUPLICATE_WORKFLOWS -gt 0 ]]; then
    echo "❌ Duplicate workflow files found"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo "✅ No duplicate workflow files"
fi

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
if npm run type-check >/dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation issues"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# Check for untitled files
echo "🔍 Checking for untitled files..."
UNTITLED_FILES=$(find . -name "Untitled-*" | wc -l)
if [[ $UNTITLED_FILES -gt 0 ]]; then
    echo "❌ Untitled files found"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo "✅ No untitled files"
fi

# Summary
echo ""
if [[ $VALIDATION_ERRORS -eq 0 ]]; then
    echo "🎉 All validations passed - Platform ready!"
    exit 0
else
    echo "❌ $VALIDATION_ERRORS validation errors found"
    exit 1
fi
