"""
ABACO Financial Intelligence Platform Configuration
Central configuration file for all financial analysis parameters
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

# Platform Information
PLATFORM_NAME = "ABACO Financial Intelligence"
VERSION = "1.0.0"
AUTHOR = "ABACO Development Team"

# File Paths
BASE_DIR = Path(__file__).parent.parent
NOTEBOOKS_DIR = BASE_DIR / "notebooks"
CHARTS_DIR = NOTEBOOKS_DIR / "charts"
EXPORTS_DIR = NOTEBOOKS_DIR / "exports"
DATA_DIR = NOTEBOOKS_DIR / "data"

# Create directories if they don't exist
for directory in [CHARTS_DIR, EXPORTS_DIR, DATA_DIR]:
    directory.mkdir(exist_ok=True)

# Financial Analysis Parameters
FINANCIAL_CONFIG: Dict[str, Any] = {
    "default_records": 1000,
    "risk_categories": ["Low", "Medium", "High"],
    "account_types": [
        "Checking",
        "Savings",
        "Credit",
        "Investment",
        "Business",
    ],
    "credit_score_ranges": {
        "Poor": (300, 579),
        "Fair": (580, 669),
        "Good": (670, 739),
        "Very Good": (740, 799),
        "Excellent": (800, 850),
    },
    "risk_thresholds": {
        "utilization_high": 0.75,
        "utilization_medium": 0.50,
        "debt_income_high": 0.40,
        "debt_income_medium": 0.20,
    },
}

# Visualization Settings
CHART_CONFIG: Dict[str, Any] = {
    "default_theme": "plotly_white",
    "color_palette": [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
    ],
    "chart_height": 500,
    "chart_width": 800,
}

# Export Settings
EXPORT_CONFIG: Dict[str, Any] = {
    "csv_encoding": "utf-8",
    "excel_engine": "openpyxl",
    "chart_format": "html",
    "include_timestamp": True,
}

# Database Connection (for future integration)
DATABASE_CONFIG: Dict[str, Any] = {
    "supabase_url": os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    "supabase_key": os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    "table_prefix": "abaco_",
    "schema": "public",
}

# Logging Configuration
LOGGING_CONFIG: Dict[str, Any] = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "log_file": NOTEBOOKS_DIR / "abaco.log",
}


def get_config_summary() -> Dict[str, Any]:
    """Return a summary of current configuration"""
    return {
        "platform": PLATFORM_NAME,
        "version": VERSION,
        "base_directory": str(BASE_DIR),
        "charts_directory": str(CHARTS_DIR),
        "exports_directory": str(EXPORTS_DIR),
        "default_records": FINANCIAL_CONFIG["default_records"],
    }
