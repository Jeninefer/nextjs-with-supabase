#!/bin/bash

echo "🚀 ABACO Environment Setup - macOS Fix"
echo "======================================"

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Step 1: Clean up any existing virtual environment
echo "🧹 Cleaning existing environment..."
rm -rf abaco_venv

# Step 2: Create fresh virtual environment  
echo "🐍 Creating Python virtual environment..."
/opt/homebrew/bin/python3 -m venv abaco_venv

# Step 3: Activate and install packages (in one command to avoid shell issues)
echo "📦 Installing ABACO dependencies..."
bash -c "source abaco_venv/bin/activate && pip install --upgrade pip && pip install plotly matplotlib seaborn jinja2 numpy pandas scipy scikit-learn jupyter ipykernel"

# Step 4: Register with Jupyter
echo "📓 Setting up Jupyter kernel..."
bash -c "source abaco_venv/bin/activate && python -m ipykernel install --user --name=abaco_venv --display-name='ABACO Environment'"

echo ""
echo "✅ ABACO Environment Setup Complete!"
echo ""
echo "🔄 To use the environment:"
echo "   cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase"
echo "   source abaco_venv/bin/activate"
echo "   jupyter notebook"
echo ""
echo "📊 The notebook 'abaco_financial_intelligence_fixed.ipynb' is ready to use!"
echo "   It includes comprehensive error handling and fallback options."
