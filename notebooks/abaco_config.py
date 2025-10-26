"""
ABACO Configuration
Central configuration for ABACO Financial Intelligence Platform
"""

from pathlib import Path
from datetime import datetime

# Project structure
PROJECT_ROOT = Path(__file__).parent.parent
NOTEBOOKS_DIR = PROJECT_ROOT / "notebooks"
DATA_DIR = PROJECT_ROOT / "data"
EXPORTS_DIR = PROJECT_ROOT / "exports"
CHARTS_DIR = NOTEBOOKS_DIR / "charts"

# Create directories if they don't exist
for directory in [DATA_DIR, EXPORTS_DIR, CHARTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Analysis configuration
DEFAULT_CUSTOMER_COUNT = 1000
RANDOM_SEED = 42

# Financial thresholds
RISK_THRESHOLDS = {
    "high_utilization": 0.8,
    "high_debt_income": 0.4,
    "low_credit_score": 600,
}

# Export settings
EXPORT_TIMESTAMP_FORMAT = "%Y%m%d_%H%M%S"
CSV_ENCODING = "utf-8"

# Logging configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Chart styling
CHART_THEME = "plotly"
CHART_COLOR_PALETTE = [
    "#8B5CF6",  # Purple (primary)
    "#A78BFA",  # Light purple
    "#6D28D9",  # Dark purple
    "#EC4899",  # Pink
    "#F59E0B",  # Amber
]

# Portfolio metrics display
CURRENCY_SYMBOL = "$"
DECIMAL_PLACES = 2

print(f"✅ ABACO Configuration loaded - Exports: {EXPORTS_DIR}")
