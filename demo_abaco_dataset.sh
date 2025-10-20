#!/bin/bash
set -euo pipefail
# ABACO Quick Start Demo
# This script demonstrates the complete ABACO dataset generation workflow

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   ABACO FINANCIAL INTELLIGENCE PLATFORM - QUICK START DEMO        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Environment Setup
echo "📦 Step 1: Setting up ABACO environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash fix_abaco_environment.sh
echo ""

# Step 2: Dataset Generation
echo "📊 Step 2: Generating comprehensive financial dataset..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd notebooks
python3 abaco_dataset_generator.py
echo ""

# Step 3: Verify Output
echo "✅ Step 3: Verifying generated files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "abaco_comprehensive_dataset.csv" ]; then
    echo "✓ Dataset file: abaco_comprehensive_dataset.csv"
    ls -lh abaco_comprehensive_dataset.csv
fi

if [ -f "abaco_comprehensive_dataset_summary.txt" ]; then
    echo "✓ Summary file: abaco_comprehensive_dataset_summary.txt"
    ls -lh abaco_comprehensive_dataset_summary.txt
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEMO COMPLETE!                              ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Generated files are located in the notebooks/ directory"
echo "📖 For more information, see notebooks/README_ABACO_DATASET.md"
echo ""
