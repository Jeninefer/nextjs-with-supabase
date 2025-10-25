#!/bin/bash

# ABACO Environment Verification Script
# This script checks if the ABACO environment is properly set up

echo "🔍 ABACO Environment Verification"
echo "=================================="
echo ""

# Check 1: Python installation
echo "1️⃣ Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✅ Python installed: $PYTHON_VERSION"
else
    echo "   ❌ Python 3 not found!"
    echo "   Install Python 3 to continue"
    exit 1
fi

# Check 2: Virtual environment
echo ""
echo "2️⃣ Checking virtual environment..."
if [ -d "abaco_venv" ]; then
    echo "   ✅ Virtual environment exists: abaco_venv/"
    
    # Check if activated
    if [ -n "$VIRTUAL_ENV" ]; then
        echo "   ✅ Virtual environment is activated"
    else
        echo "   ℹ️  Virtual environment not activated"
        echo "   Run: source abaco_venv/bin/activate"
    fi
else
    echo "   ❌ Virtual environment not found"
    echo "   Run: ./setup_abaco_environment.sh"
    exit 1
fi

# Check 3: Jupyter kernel
echo ""
echo "3️⃣ Checking Jupyter kernel..."
if command -v jupyter &> /dev/null; then
    if jupyter kernelspec list | grep -q "abaco_env"; then
        echo "   ✅ ABACO kernel registered"
    else
        echo "   ⚠️  ABACO kernel not found"
        echo "   This may be normal if setup just ran"
    fi
else
    echo "   ⚠️  Jupyter is not installed or not available in the current environment."
    echo "   Activate your virtual environment and/or install Jupyter."
fi

# Check 4: Python packages (if environment is activated)
if [ -n "$VIRTUAL_ENV" ]; then
    echo ""
    echo "4️⃣ Checking Python packages..."
    
    packages=("pandas" "numpy" "plotly" "matplotlib" "jupyter")
    all_installed=true
    
    for pkg in "${packages[@]}"; do
        if python3 -c "import $pkg" 2>/dev/null; then
            echo "   ✅ $pkg"
        else
            echo "   ❌ $pkg (missing)"
            all_installed=false
        fi
    done
    
    if [ "$all_installed" = false ]; then
        echo ""
        echo "   Some packages are missing. Install with:"
        echo "   pip install -r notebooks/requirements.txt"
    fi
fi

# Check 5: Documentation
echo ""
echo "5️⃣ Checking documentation..."
docs=("notebooks/README.md" "docs/GOOGLE_CLOUD_SETUP.md")
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✅ $doc"
    else
        echo "   ❌ $doc (missing)"
    fi
done

# Check 6: Google Cloud environment variables
echo ""
echo "6️⃣ Checking Google Cloud configuration..."
if [ ! -z "$GOOGLE_APPLICATION_CREDENTIALS" ] || [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "   ⚠️  Google Cloud variables detected:"
    [ ! -z "$GOOGLE_CLOUD_PROJECT" ] && echo "      GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT"
    [ ! -z "$GOOGLE_APPLICATION_CREDENTIALS" ] && echo "      GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS"
    echo ""
    echo "   If you encounter Cloud API errors, you may want to:"
    echo "   - Enable the required APIs in your GCP project"
    echo "   - Or unset these variables to run locally only"
    echo "   See: docs/GOOGLE_CLOUD_SETUP.md"
else
    echo "   ✅ No Google Cloud variables set (running in local mode)"
fi

# Summary
echo ""
echo "=================================="
echo "Verification complete!"
echo ""
echo "Next steps:"
echo "1. source abaco_venv/bin/activate    (if not already activated)"
echo "2. jupyter notebook                   (start Jupyter)"
echo "3. Open notebooks/abaco_financial_intelligence_unified.ipynb"
echo ""
