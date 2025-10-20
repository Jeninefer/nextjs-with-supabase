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

# Create a symlink for convenience
if [ ! -f "/usr/local/bin/python" ] && [ "$PYTHON_CMD" = "python3" ]; then
    echo "🔗 Creating python symlink..."
    sudo ln -sf $(which python3) /usr/local/bin/python
fi

echo "✅ Python setup complete!"
echo "🐍 Using: $PYTHON_CMD"
$PYTHON_CMD --version
