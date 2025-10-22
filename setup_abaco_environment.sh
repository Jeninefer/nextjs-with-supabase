#!/bin/bash

echo "🚀 ABACO Environment Setup - Virtual Environment Solution"
echo "========================================================"

# Get the script's directory and use it as base
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check for Python installation
echo "🔍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed!"
    echo ""
    echo "Please install Python 3:"
    echo "  macOS:        brew install python3"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip python3-venv"
    echo "  Windows:      Download from https://www.python.org/downloads/"
    exit 1
fi

# Check for venv module
if ! python3 -m venv --help &> /dev/null; then
    echo "❌ Error: Python venv module is not available!"
    echo ""
    echo "Please install python3-venv:"
    echo "  Ubuntu/Debian: sudo apt-get install python3-venv"
    exit 1
fi

# Check for and clear any Google Cloud environment variables
if [ ! -z "$GOOGLE_APPLICATION_CREDENTIALS" ] || [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "⚠️  Warning: Google Cloud environment variables detected"
    echo "   GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS"
    echo "   GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT"
    echo ""
    echo "   These may cause Cloud API errors if not properly configured."
    echo "   The ABACO notebook runs locally and doesn't require Google Cloud."
    echo "   See docs/GOOGLE_CLOUD_SETUP.md for more information."
    echo ""
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. To disable GCP variables temporarily:"
        echo "  unset GOOGLE_APPLICATION_CREDENTIALS"
        echo "  unset GOOGLE_CLOUD_PROJECT"
        exit 1
    fi
fi

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
elif command -v python3.12 &> /dev/null; then
    python3.12 -m venv abaco_venv
    echo "✅ Using Python 3.12"
elif command -v python3.11 &> /dev/null; then
    python3.11 -m venv abaco_venv
    echo "✅ Using Python 3.11"
else
    python3 -m venv abaco_venv
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Using $PYTHON_VERSION"
fi

# Step 2: Activate environment
echo "🔄 Activating virtual environment..."
source abaco_venv/bin/activate

# Verify activation
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
fi

# Step 3: Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip --quiet

# Step 4: Install ABACO dependencies from requirements.txt
if [ -f "notebooks/requirements.txt" ]; then
    echo "📊 Installing ABACO dependencies from requirements.txt..."
    pip install -r notebooks/requirements.txt --quiet
else
    echo "📊 Installing ABACO dependencies (minimal set)..."
    pip install plotly matplotlib seaborn jinja2 numpy pandas scipy scikit-learn --quiet
fi

# Step 5: Install Jupyter
echo "📚 Installing Jupyter..."
pip install jupyter ipykernel notebook --quiet

# Step 6: Register kernel
echo "🔧 Registering ABACO kernel..."
python -m ipykernel install --user --name=abaco_env --display-name="ABACO Environment"

# Step 7: Verify installation
echo ""
echo "🧪 Verifying installation..."
if python -c "import plotly, matplotlib, pandas, numpy" 2>/dev/null; then
    echo "✅ All core packages installed successfully!"
else
    echo "⚠️  Warning: Some packages may not be installed correctly"
    echo "   Run: pip install -r notebooks/requirements.txt"
fi

echo ""
echo "======================================================"
echo "✅ ABACO Environment Setup Complete!"
echo "======================================================"
echo ""
echo "📂 Working directory: $SCRIPT_DIR"
echo "🐍 Virtual environment: $SCRIPT_DIR/abaco_venv"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Activate the environment (required each time):"
echo "   source abaco_venv/bin/activate"
echo ""
echo "2️⃣  Start Jupyter Notebook:"
echo "   jupyter notebook"
echo ""
echo "3️⃣  In Jupyter, select 'ABACO Environment' kernel"
echo ""
echo "4️⃣  Open and run: notebooks/abaco_financial_intelligence_unified.ipynb"
echo ""
echo "📚 Documentation:"
echo "   - notebooks/README.md           - Notebook usage guide"
echo "   - docs/GOOGLE_CLOUD_SETUP.md    - Cloud integration (optional)"
echo "   - README.md                      - Platform overview"
echo ""
echo "⚠️  Troubleshooting:"
echo "   - If you see Cloud API errors, see docs/GOOGLE_CLOUD_SETUP.md"
echo "   - If packages are missing, run: pip install -r notebooks/requirements.txt"
echo "   - For kernel issues, restart Jupyter after running this script"
echo ""
