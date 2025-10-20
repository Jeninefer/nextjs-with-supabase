#!/bin/bash

echo "🔄 Activating ABACO virtual environment..."

# Check if we're in the right directory
if [ ! -f "notebooks/abaco_financial_intelligence.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "abaco_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv abaco_venv
fi

# Activate the environment
echo "✅ Activating virtual environment..."
source abaco_venv/bin/activate

echo "🐍 Python environment is now active!"
echo "💡 Available commands:"
echo "   python notebooks/abaco_financial_intelligence.py"
echo "   jupyter notebook notebooks/"
echo "   deactivate  # to exit the environment"
echo ""

# Show Python version and location
echo "📍 Python details:"
which python
python --version
echo ""

# Start an interactive shell with the environment
echo "🚀 Starting new shell with activated environment..."
exec "$SHELL"
