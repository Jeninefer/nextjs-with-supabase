#!/bin/bash

echo "🚀 ABACO Financial Intelligence Runner"
echo "====================================="

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Check if virtual environment exists
if [ ! -d "abaco_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv abaco_venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source abaco_venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install base dependencies
echo "📦 Installing base dependencies..."
pip install pandas numpy plotly matplotlib seaborn pdfplumber jupyter ipython

# Run the financial analysis
echo "💰 Running ABACO Financial Analysis..."
python notebooks/abaco_financial_intelligence.py

echo "✅ Analysis complete!"
echo ""
echo "📁 Generated files:"
echo "  - notebooks/financial_analysis_results.csv"
echo "  - notebooks/charts/ (HTML visualizations)"
echo ""
echo "🚀 To run Jupyter notebook:"
echo "  source abaco_venv/bin/activate"
echo "  jupyter notebook notebooks/"
