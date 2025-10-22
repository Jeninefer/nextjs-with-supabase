#!/usr/bin/env bash
# Script to generate and display validation results for loan data analysis
#
# Before first use, ensure this script is executable:
#   chmod +x scripts/generate_validation.sh

set -e

echo "================================================"
echo "ABACO Loan Data Validation Results Generator"
echo "================================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed"
    exit 1
fi

# Check if required Python packages are installed
echo "🔍 Checking Python dependencies..."
python3 -c "import pandas, numpy" 2>/dev/null || {
    echo "📦 Installing required Python packages..."
    pip3 install pandas numpy
}

# Generate validation results
echo ""
echo "🔄 Generating validation results..."
if ! pushd notebooks > /dev/null; then
    echo "❌ Error: Failed to change directory to 'notebooks'"
    exit 1
fi
python3 generate_validation_results.py
popd > /dev/null

echo ""
echo "================================================"
echo "✅ Validation results generated successfully!"
echo "================================================"
echo ""
echo "📁 Results saved to: notebooks/validation_results/"
echo ""
echo "To view the results:"
echo "  1. Web Interface: npm run dev then visit http://localhost:3000/dashboard/validation"
echo "  2. API Endpoint: http://localhost:3000/api/validation-results"
echo "  3. CSV Files: Check notebooks/validation_results/*.csv"
echo ""
echo "For more information, see: docs/VALIDATION_RESULTS.md"
echo ""
