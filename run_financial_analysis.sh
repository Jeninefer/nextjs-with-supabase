#!/bin/bash

echo "🚀 ABACO Financial Intelligence Platform"
echo "======================================="

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Check if virtual environment exists
if [ ! -d "abaco_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv abaco_venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source abaco_venv/bin/activate

# Upgrade pip and install requirements
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

echo "📦 Installing Python dependencies..."
if [ -f "notebooks/requirements.txt" ]; then
    pip install -r notebooks/requirements.txt
else
    pip install pandas numpy plotly matplotlib seaborn pdfplumber jupyter ipython scikit-learn openpyxl
fi

# Create necessary directories
mkdir -p notebooks/charts
mkdir -p notebooks/exports

# Run the financial analysis
echo "💰 Running ABACO Financial Intelligence Analysis..."
python notebooks/abaco_financial_intelligence.py

echo "✅ Analysis complete!"
echo ""
echo "📁 Generated files:"
echo "  - notebooks/financial_analysis_results.csv"
echo "  - notebooks/charts/ (Interactive HTML visualizations)"
echo ""
echo "🎯 Next steps:"
echo "  1. Open charts in browser for interactive analysis"
echo "  2. Import CSV data into your Next.js application"
echo "  3. Use Jupyter for advanced analysis: jupyter notebook notebooks/"
