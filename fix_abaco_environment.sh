#!/bin/bash
# ABACO Environment Fix Script

echo "🔧 ABACO Environment Fix"
echo "========================"

# Check current Python setup
echo "Current Python setup:"
which python3
python3 --version

# Install package manager if missing
echo "📦 Ensuring pip is available..."
python3 -m ensurepip --upgrade 2>/dev/null || echo "pip already available"

# Install required packages
echo "📊 Installing ABACO dependencies..."
python3 -m pip install --user plotly matplotlib seaborn jinja2 numpy pandas scipy scikit-learn || { 
    echo "❌ Failed to install dependencies"; 
    exit 1; 
}

# Verify installation
echo "✅ Verifying installation..."
python3 -c "import plotly; print(f'Plotly: {plotly.__version__}')"
python3 -c "import matplotlib; print(f'Matplotlib: {matplotlib.__version__}')"
python3 -c "import jinja2; print(f'Jinja2: {jinja2.__version__}')" || exit 1
python3 -c "import numpy; print(f'Numpy: {numpy.__version__}')" || exit 1
python3 -c "import pandas; print(f'Pandas: {pandas.__version__}')" || exit 1
python3 -c "import scipy; print(f'Scipy: {scipy.__version__}')" || exit 1
python3 -c "import sklearn; print(f'Scikit-learn: {sklearn.__version__}')" || exit 1
python3 -c "import seaborn; print(f'Seaborn: {seaborn.__version__}')" || exit 1

echo "🎉 ABACO environment setup complete!"
echo "💡 Now restart your Jupyter kernel and re-run the notebook"
