#!/bin/bash

echo "🔧 Fixing Python PATH issues..."

# Check for Python installations
echo "🔍 Checking Python installations:"

if command -v python3 &> /dev/null; then
    echo "✅ python3 found at: $(which python3)"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    echo "✅ python found at: $(which python)"
    PYTHON_CMD="python"
else
    echo "❌ No Python installation found!"
    echo "📦 Installing Python via Homebrew..."
    
    if command -v brew &> /dev/null; then
        brew install python
        PYTHON_CMD="python3"
    else
        echo "❌ Homebrew not found. Please install Python manually."
        exit 1
    fi
fi

# Set up a Python virtual environment for project isolation
if [ ! -d "venv" ]; then
    echo "🛠️  Creating a virtual environment in ./venv ..."
    $PYTHON_CMD -m venv venv
fi

# Activate the virtual environment
. venv/bin/activate
PYTHON_CMD="python"

echo "✅ Python virtual environment setup complete!"
echo "🐍 Using: $PYTHON_CMD from virtual environment"
$PYTHON_CMD --version
