#!/bin/bash

echo "🚀 ABACO Environment Setup - Virtual Environment Solution"
echo "========================================================"

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Step 1: Create virtual environment
echo "🐍 Creating ABACO virtual environment..."
rm -rf abaco_venv  # Remove any existing environment

# Use the best available Python version
if command -v python3.14 &> /dev/null; then
    python3.14 -m venv abaco_venv
    echo "✅ Using Python 3.14"
elif command -v python3.13 &> /dev/null; then
    python3.13 -m venv abaco_venv
    echo "✅ Using Python 3.13"
else
    python3 -m venv abaco_venv
    echo "✅ Using default Python 3"
fi

# Step 2: Activate environment
echo "🔄 Activating virtual environment..."
source abaco_venv/bin/activate

# Step 3: Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Step 4: Install ABACO dependencies
echo "📊 Installing ABACO dependencies..."
pip install plotly matplotlib seaborn jinja2 numpy pandas scipy scikit-learn

# Step 5: Install Jupyter
echo "📚 Installing Jupyter..."
pip install jupyter ipykernel

# Step 6: Register kernel
echo "🔧 Registering ABACO kernel..."
python -m ipykernel install --user --name=abaco_env --display-name="ABACO Environment"

echo ""
echo "✅ ABACO Environment Setup Complete!"
echo "🎉 Virtual environment created successfully!"
echo ""
echo "🔄 To activate the environment:"
echo "   source abaco_venv/bin/activate"
echo ""
echo "📓 To start Jupyter:"
echo "   jupyter notebook"
echo "   (Select 'ABACO Environment' kernel)"
echo ""
echo "🧪 To test installation:"
echo "   python -c \"import plotly, matplotlib, pandas; print('✅ All packages working!')\""
