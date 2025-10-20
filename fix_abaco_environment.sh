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
python -c "
packages = [
   ('plotly', 'Plotly'),
   ('matplotlib', 'Matplotlib'),
   ('jinja2', 'Jinja2'),
   ('numpy', 'NumPy'),
   ('pandas', 'Pandas'),
   ('scipy', 'SciPy'),
   ('sklearn', 'Scikit-learn'),
   ('seaborn', 'Seaborn'),
]
import sys
for pkg, name in packages:
   try:
       mod = __import__(pkg)
       ver = getattr(mod, '__version__', 'unknown')
       print(f'{name}: {ver}')
   except Exception as e:
       print(f'❌ Failed to import {name} ({pkg}): {e}', file=sys.stderr)
       sys.exit(1)
" || exit 1

echo "🎉 ABACO environment setup complete!"
echo "💡 Now restart your Jupyter kernel and re-run the notebook"
