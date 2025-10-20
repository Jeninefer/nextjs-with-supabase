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

# Create requirements.txt if it doesn't exist
if [ ! -f "requirements.txt" ]; then
    echo "plotly==5.20.0" > requirements.txt
    echo "matplotlib==3.8.4" >> requirements.txt
    echo "seaborn==0.13.2" >> requirements.txt
    echo "jinja2==3.1.3" >> requirements.txt
    echo "numpy==1.26.4" >> requirements.txt
    echo "pandas==2.2.2" >> requirements.txt
    echo "scipy==1.13.1" >> requirements.txt
    echo "scikit-learn==1.4.2" >> requirements.txt
fi

# Install required packages
echo "📊 Installing ABACO dependencies from requirements.txt..."
python -m pip install -r requirements.txt || { 
    echo "❌ Failed to install dependencies"; 
    exit 1; 
}

# Verify installation
echo "✅ Verifying installation..."
python3 -c "import plotly; print(f'Plotly: {plotly.__version__}')" || exit 1
python3 -c "import matplotlib; print(f'Matplotlib: {matplotlib.__version__}')" || exit 1
python3 -c "import jinja2; print(f'Jinja2: {jinja2.__version__}')" || exit 1
python3 -c "import numpy; print(f'NumPy: {numpy.__version__}')" || exit 1
python3 -c "import pandas; print(f'Pandas: {pandas.__version__}')" || exit 1
python3 -c "import scipy; print(f'SciPy: {scipy.__version__}')" || exit 1
python3 -c "import sklearn; print(f'Scikit-learn: {sklearn.__version__}')" || exit 1
python3 -c "import seaborn; print(f'Seaborn: {seaborn.__version__}')" || exit 1

echo "🎉 ABACO environment setup complete!"
echo "💡 Now restart your Jupyter kernel and re-run the notebook"
