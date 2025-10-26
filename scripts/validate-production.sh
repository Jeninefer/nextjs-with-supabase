#!/bin/bash
# ABACO Financial Intelligence Platform - Production Validation
# Following AI Toolkit best practices

set -euo pipefail

cd /workspaces/nextjs-with-supabase

echo "🔍 ABACO Financial Intelligence Platform - Production Validation"
echo "==============================================================="

VALIDATION_ERRORS=0

validate_step() {
    local step="$1"
    local command="$2"
    
    echo -n "Validating $step... "
    if eval "$command" >/dev/null 2>&1; then
        echo "✅"
    else
        echo "❌"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
}

echo "🔧 Environment Validation:"
validate_step "Node.js installation" "node --version"
validate_step "npm availability" "npm --version"
validate_step "TypeScript compilation" "npx tsc --noEmit"
validate_step "Package.json validity" "jq . package.json"

echo ""
echo "📊 Database Validation:"
validate_step "Supabase config exists" "test -f supabase/config.toml"
validate_step "Migration file exists" "test -f supabase/migrations/20251019000000_create_threading_tables.sql"

echo ""
echo "🔐 Security Validation:"
validate_step "Environment example exists" "test -f .env.example"
validate_step "No hardcoded secrets" "! grep -r 'sk-' --include='*.ts' --include='*.js' --include='*.tsx' --include='*.jsx' ."

echo ""
echo "🏗️ Build Validation:"
if [[ -d "node_modules" ]]; then
    validate_step "Next.js build" "npm run build"
else
    echo "Skipping build validation - dependencies not installed"
fi

echo ""
echo "📋 Validation Summary:"
if [[ $VALIDATION_ERRORS -eq 0 ]]; then
    echo "✅ All validations passed - Production ready!"
    exit 0
else
    echo "❌ $VALIDATION_ERRORS validation errors found"
    echo "💡 Run ./scripts/production-audit-fix.sh to fix issues"
    exit 1
fi
