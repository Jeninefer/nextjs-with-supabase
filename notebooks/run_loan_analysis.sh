#!/bin/bash
#
# Example script to run ABACO Loan Analysis
# This demonstrates how to use the loan analysis script with custom data paths
#

# Set this to your actual data directory
# If not set, defaults to: {repository_root}/data/shared
# export SHARED_FOLDER_PATH="/path/to/your/loan/data"

# Navigate to notebooks directory
cd "$(dirname "$0")"

# Run the analysis
echo "Running ABACO Loan Analysis..."
python3 abaco_loan_analysis.py

echo ""
echo "Analysis complete! Check the loan_analysis directory for outputs:"
echo "  - CSV files: notebooks/loan_analysis/*.csv"
echo "  - Charts: notebooks/loan_analysis/charts/*.html"
