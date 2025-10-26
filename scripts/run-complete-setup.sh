#!/bin/bash
# ABACO Financial Intelligence Platform - Execute Complete Setup
# Following AI Toolkit best practices

cd /workspaces/nextjs-with-supabase

echo "🏦 Executing ABACO Financial Intelligence Platform Complete Setup"
echo "==============================================================="

# Make all scripts executable
chmod +x ./scripts/complete-setup.sh
chmod +x ./scripts/test-api-endpoints.sh
chmod +x ./scripts/fix-production-errors.sh
chmod +x ./scripts/production-audit-fix.sh
chmod +x ./scripts/validate-production.sh

# Run the complete setup
./scripts/complete-setup.sh

echo ""
echo "🎉 Setup execution completed!"
echo "Run the commands shown above to start development."
