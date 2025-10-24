#!/bin/bash
# Production readiness validation

echo "🔍 Validating Production Readiness..."

# Check environment variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo "   Update .env.local with your Supabase credentials"
    exit 1
fi

# Validate TypeScript
if ! npx tsc --noEmit --skipLibCheck; then
    echo "❌ TypeScript validation failed"
    exit 1
fi

# Check for security issues
if grep -r "your-" .env.* 2>/dev/null; then
    echo "❌ Found placeholder values in environment files"
    echo "   Update all credentials before deployment"
    exit 1
fi

echo "✅ Production validation passed!"
