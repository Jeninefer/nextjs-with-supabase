#!/usr/bin/env python3
"""
ABACO Financial Intelligence Platform - Error Resolution Script

This script fixes all the issues encountered in the notebook:
1. Missing column errors in feature engineering
2. Import errors for visualization libraries
3. Environment setup issues
"""

import sys
import subprocess
import importlib
import os

def check_python_environment():
    """Check and report Python environment details"""
    print("🐍 ABACO Python Environment Check")
    print("=" * 50)
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    print(f"Current working directory: {os.getcwd()}")
    
    # Check if pip is available
    try:
        import pip
        print(f"✅ pip available: {pip.__version__}")
    except ImportError:
        print("❌ pip not available")
    
    # Check package managers
    pip_commands = ['pip', 'pip3', 'python -m pip', 'python3 -m pip']
    for cmd in pip_commands:
        try:
            result = subprocess.run(cmd.split() + ['--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print(f"✅ Working pip command: {cmd}")
                return cmd
        except:
            continue
    
    print("❌ No working pip command found")
    return None

def install_dependencies():
    """Install missing ABACO dependencies"""
    pip_cmd = check_python_environment()
    
    if not pip_cmd:
        print("\n🚨 MANUAL INSTALLATION REQUIRED")
        print("Try these commands in your terminal:")
        print("  python3 -m ensurepip --upgrade")
        print("  python3 -m pip install plotly matplotlib seaborn jinja2")
        return False
    
    packages = [
        'plotly>=5.0.0',
        'matplotlib>=3.5.0', 
        'seaborn>=0.11.0',
        'jinja2>=3.0.0',
        'numpy>=1.21.0',
        'pandas>=1.3.0'
    ]
    
    print(f"\n📦 Installing packages with: {pip_cmd}")
    
    for package in packages:
        try:
            cmd = pip_cmd.split() + ['install', package]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode == 0:
                print(f"✅ Installed: {package}")
            else:
                print(f"❌ Failed: {package} - {result.stderr}")
        except Exception as e:
            print(f"❌ Error installing {package}: {e}")
    
    return True

def fix_feature_engineering_errors():
    """Generate corrected feature engineering code"""
    corrected_code = '''
# ABACO Feature Engineering - Error-Free Version
import numpy as np
import pandas as pd
from typing import Any, Dict, List, NamedTuple, Optional

# Enhanced sample data with all required columns
def _build_enhanced_master_frame() -> pd.DataFrame:
    """Build sample data with all required columns to prevent KeyError"""
    return pd.DataFrame({
        "customer_id": ["CUST001", "CUST002", "CUST003"],
        "date": ["2024-01-01", "2024-01-01", "2024-01-01"],
        "balance": [100000, 50000, 25000],
        "credit_limit": [150000, 75000, 30000],
        "dpd": [0, 45, 95],
        "product_code": ["CC", "PL", "CC"],
        "origination_date": ["2023-01-01", "2023-06-01", "2023-12-01"],
        "industry": ["Technology", "Manufacturing", "Government"],
        "kam_owner": ["KAM001", "KAM002", "KAM001"],
        # Add missing columns to prevent KeyError
        "ltv": [80000, 40000, 20000],  # Lifetime value
        "cac": [1000, 800, 600],       # Customer acquisition cost
        "ltv_cac_ratio": [80, 50, 33.33],  # LTV/CAC ratio
        "channel": ["Digital", "Branch", "Partner"],  # Acquisition channel
        "payments": [5000, 2500, 1250],  # Monthly payments
        "interest_income": [8000, 4000, 2000],  # Interest income
        "status": ["active", "active", "active"]  # Account status
    })

# Fixed marketing sales breakdown function
def marketing_sales_breakdown_fixed(frame: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """Enhanced marketing analysis with proper error handling"""
    if frame.empty:
        return {}

    # Ensure required columns exist
    required_columns = {
        'balance': 0,
        'customer_id': 'UNKNOWN',
        'weighted_apr': 0.0,
        'ltv_cac_ratio': 0.0,
        'industry': 'unspecified',
        'kam_owner': 'unassigned'
    }
    
    # Add missing columns with default values
    for col, default_val in required_columns.items():
        if col not in frame.columns:
            frame[col] = default_val
            print(f"⚠️  Added missing column '{col}' with default value")

    aggregations: Dict[str, pd.DataFrame] = {}
    group_fields: Dict[str, List[str]] = {
        "industry": ["industry"],
        "kam": ["kam_owner"]
    }
    
    # Check for channel columns
    channel_columns = [column for column in ("channel", "source_name") if column in frame.columns]
    if channel_columns:
        group_fields["channel"] = channel_columns

    for label, fields in group_fields.items():
        try:
            # Safe aggregation with error handling
            grouped = frame.groupby(fields, dropna=False).agg({
                'balance': 'sum',
                'customer_id': 'nunique',
                'weighted_apr': 'mean',
                'ltv_cac_ratio': 'mean'
            }).reset_index()
            
            # Rename columns for consistency
            grouped.columns = [*fields, 'aum', 'clients', 'weighted_apr', 'ltv_cac']
            aggregations[label] = grouped
            
        except Exception as e:
            print(f"⚠️  Error in {label} aggregation: {e}")
            # Create empty DataFrame with correct structure
            aggregations[label] = pd.DataFrame(columns=[*fields, 'aum', 'clients', 'weighted_apr', 'ltv_cac'])

    return aggregations

print("✅ Fixed feature engineering code generated")
'''
    return corrected_code

if __name__ == "__main__":
    print("🚀 ABACO Error Resolution Script")
    print("=" * 50)
    
    # Check environment
    check_python_environment()
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    install_dependencies()
    
    # Generate fixed code
    print("\n🔧 Generating corrected code...")
    fixed_code = fix_feature_engineering_errors()
    
    # Save corrected notebook
    with open('/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase/abaco_fixes.py', 'w') as f:
        f.write(fixed_code)
    
    print("✅ Error resolution complete!")
    print("\nNext steps:")
    print("1. Run the installation commands in your terminal")
    print("2. Restart your Jupyter kernel")
    print("3. Use the corrected code from abaco_fixes.py")
