#!/bin/bash
# ABACO Financial Intelligence Platform - Notebook Runner
# Following AI Toolkit best practices

set -euo pipefail

NOTEBOOK_PATH="$1"
TRACE_ID="notebook_$(date +%s)"

echo "🔍 AI Toolkit Trace ID: $TRACE_ID"
echo "📓 Executing notebook: $NOTEBOOK_PATH"

if [[ ! -f "$NOTEBOOK_PATH" ]]; then
    echo "❌ Notebook not found: $NOTEBOOK_PATH"
    exit 1
fi

# Activate virtual environment if available
if [[ -f ".venv/bin/activate" ]]; then
    source .venv/bin/activate
fi

# Execute notebook using Jupyter
if command -v jupyter >/dev/null 2>&1; then
    jupyter nbconvert --to notebook --execute --inplace "$NOTEBOOK_PATH"
    echo "✅ Notebook executed successfully"
else
    echo "❌ Jupyter not available"
    exit 1
fi
