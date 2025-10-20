#!/bin/bash

echo "🚀 ABACO Financial Intelligence Platform"
echo "======================================="

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found! Running Python setup..."
    ./fix_python_path.sh
    PYTHON_CMD="python3"
fi

echo "🐍 Using Python: $(which $PYTHON_CMD)"
$PYTHON_CMD --version

# Check if virtual environment exists
if [ ! -d "abaco_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    $PYTHON_CMD -m venv abaco_venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source abaco_venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install only essential packages (avoid problematic ones)
echo "📦 Installing Python dependencies (essential only)..."
pip install pandas numpy plotly matplotlib seaborn pdfplumber jupyter ipython requests

# Create necessary directories
mkdir -p notebooks/charts
mkdir -p notebooks/exports

# Run the financial analysis
echo "💰 Running ABACO Financial Intelligence Analysis..."
$PYTHON_CMD notebooks/abaco_financial_intelligence.py

echo "✅ Analysis complete!"
echo ""
echo "📁 Generated files:"
echo "  - notebooks/financial_analysis_results.csv"
echo "  - notebooks/charts/ (Interactive HTML visualizations)"
echo ""
echo "🎯 Next steps:"
echo "  1. Open charts: open notebooks/charts/"
echo "  2. View results: cat notebooks/financial_analysis_results.csv | head"
echo "  3. Run Jupyter: jupyter notebook notebooks/"
echo "  4. Commit changes: ./commit_changes.sh"
