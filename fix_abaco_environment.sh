#!/bin/bash
# ABACO Environment Fix Script

echo "🔧 ABACO Environment Fix"
echo "========================"

# Set up Python virtual environment
echo "🐍 Setting up Python virtual environment in .venv"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv || { echo "❌ Failed to create virtual environment"; exit 1; }
fi
# shellcheck disable=SC1091
source .venv/bin/activate || { echo "❌ Failed to activate virtual environment"; exit 1; }

# Upgrade pip, setuptools, and wheel for reliability
echo "⬆️  Upgrading pip, setuptools, and wheel..."
python -m pip install --upgrade pip setuptools wheel || { echo "❌ Failed to upgrade pip/setuptools/wheel"; exit 1; }

# Install required packages
if [ -f "requirements.txt" ]; then
    echo "📊 Installing ABACO dependencies from requirements.txt..."
    python -m pip install -r requirements.txt || { 
        echo "❌ Failed to install dependencies"; 
        exit 1; 
    }
else
    echo "⚠️ requirements.txt not found. Installing default ABACO dependencies directly..."
    python -m pip install plotly matplotlib jinja2 numpy pandas scipy scikit-learn seaborn || {
        echo "❌ Failed to install default dependencies";
        exit 1;
    }
fi
# Verify installation
echo "✅ Verifying installation..."
python -c "import plotly; print(f'Plotly: {plotly.__version__}')" || exit 1
python -c "import matplotlib; print(f'Matplotlib: {matplotlib.__version__}')" || exit 1
python -c "import jinja2; print(f'Jinja2: {jinja2.__version__}')" || exit 1
python -c "import numpy; print(f'NumPy: {numpy.__version__}')" || exit 1
python -c "import pandas; print(f'Pandas: {pandas.__version__}')" || exit 1
python -c "import scipy; print(f'SciPy: {scipy.__version__}')" || exit 1
python -c "import sklearn; print(f'Scikit-learn: {sklearn.__version__}')" || exit 1
python -c "import seaborn; print(f'Seaborn: {seaborn.__version__}')" || exit 1

echo "🎉 ABACO environment setup complete!"
echo "💡 Now restart your Jupyter kernel and re-run the notebook"
