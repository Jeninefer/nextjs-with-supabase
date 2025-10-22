#!/usr/bin/env python3
"""
ABACO Financial Intelligence Dashboard
Comprehensive financial data analysis and visualization platform.
"""

import subprocess
import sys
import warnings
warnings.filterwarnings('ignore')

def install_package(package):
    """Install a Python package if not already available"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}")

def check_and_install_dependencies():
    """Check and install required packages"""
    packages = {
        'pandas': 'pandas',
        'numpy': 'numpy', 
        'plotly': 'plotly',
        'matplotlib': 'matplotlib',
        'seaborn': 'seaborn',
        'pdfplumber': 'pdfplumber'
    }
    
    print("🔍 Checking dependencies...")
    for package_name, install_name in packages.items():
        try:
            __import__(package_name)
            print(f"✅ {package_name} is available")
        except ImportError:
            print(f"📦 Installing {package_name}...")
            install_package(install_name)

def main():
    """Main execution function"""
    print("🚀 Starting ABACO Financial Intelligence Dashboard")
    print("=" * 50)
    
    # Install dependencies
    check_and_install_dependencies()
    
    # Import required libraries
    try:
        import pandas as pd
        import numpy as np
        
        # Data visualization imports
        import plotly.express as px
        import plotly.graph_objects as go
        from plotly.subplots import make_subplots
        import plotly
        
        import matplotlib.pyplot as plt
        import matplotlib
        import seaborn as sns
        
        print(f"📊 Plotly version: {plotly.__version__}")
        print(f"📈 Matplotlib version: {matplotlib.__version__}")
        print(f"🎨 Seaborn version: {sns.__version__}")
        
        visualization_available = True
        
    except ImportError as e:
        print(f"⚠️ Visualization libraries not fully available: {e}")
        visualization_available = False
    
    # Generate sample financial data
    print("\n💰 Generating sample financial data...")
    
    # Create comprehensive financial dataset
    np.random.seed(42)
    n_records = 1000
    
    # Generate realistic financial data
    data = {
        'customer_id': range(1, n_records + 1),
        'account_balance': np.round(np.random.lognormal(8, 1.5, n_records), 2),
        'credit_limit': np.random.uniform(1000, 50000, n_records),
        'monthly_spending': np.round(np.random.uniform(200, 5000, n_records), 2),
        'credit_score': np.random.choice([300, 400, 500, 600, 700, 800, 850], n_records),
        'account_type': np.random.choice(['Checking', 'Savings', 'Credit', 'Investment'], n_records),
        'risk_category': np.random.choice(['Low', 'Medium', 'High'], n_records),
        'years_with_bank': np.random.randint(1, 20, n_records),
        'monthly_income': np.round(np.random.uniform(2000, 15000, n_records), 2),
        'loan_amount': np.round(np.random.uniform(0, 100000, n_records), 2),
        'payment_history_score': np.random.uniform(0.5, 1.0, n_records)
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Calculate derived metrics
    df['utilization_ratio'] = np.round((df['monthly_spending'] / df['credit_limit']).clip(0, 1), 3)
    df['debt_to_income'] = np.round((df['loan_amount'] / (df['monthly_income'] * 12)).clip(0, 2), 3)
    df['risk_score'] = np.round((1 - df['payment_history_score']) * df['utilization_ratio'] * 100, 2)
    df['profit_margin'] = np.round(df['monthly_spending'] * 0.02 + df['account_balance'] * 0.001, 2)
    
    print(f"📋 Generated {len(df)} customer records")
    print("\n📊 Dataset Overview:")
    print(df.head())
    print(f"\n📈 Dataset Info:")
    print(df.info())
    
    # Basic analysis
    print("\n🔍 Financial Analysis Summary:")
    print("=" * 40)
    
    analysis_results = {
        'total_customers': len(df),
        'avg_account_balance': df['account_balance'].mean(),
        'total_portfolio_value': df['account_balance'].sum(),
        'avg_credit_utilization': df['utilization_ratio'].mean(),
        'high_risk_customers': len(df[df['risk_category'] == 'High']),
        'avg_credit_score': df['credit_score'].mean()
    }
    
    for metric, value in analysis_results.items():
        if isinstance(value, float):
            print(f"{metric.replace('_', ' ').title()}: ${value:,.2f}" if 'balance' in metric or 'value' in metric or 'income' in metric 
                  else f"{metric.replace('_', ' ').title()}: {value:.2f}")
        else:
            print(f"{metric.replace('_', ' ').title()}: {value:,}")
    
    # Risk Analysis
    print(f"\n⚠️ Risk Distribution:")
    risk_dist = df['risk_category'].value_counts()
    for category, count in risk_dist.items():
        percentage = (count / len(df)) * 100
        print(f"  {category} Risk: {count:,} customers ({percentage:.1f}%)")
    
    # Generate visualizations if available
    if visualization_available:
        print("\n📊 Generating visualizations...")
        create_financial_dashboard(df)
    
    # Save results
    output_file = '/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase/notebooks/financial_analysis_results.csv'
    df.to_csv(output_file, index=False)
    print(f"\n💾 Results saved to: {output_file}")
    
    print("\n✅ ABACO Financial Intelligence Dashboard completed successfully!")
    return df

def create_financial_dashboard(df):
    """Create financial dashboard visualizations"""
    try:
        import plotly.express as px
        import plotly.graph_objects as go
        from plotly.subplots import make_subplots
        
        # Create risk distribution chart
        risk_counts = df['risk_category'].value_counts()
        
        fig_risk = px.pie(
            values=risk_counts.values,
            names=risk_counts.index,
            title="Customer Risk Distribution"
        )
        
        # Create account balance distribution
        fig_balance = px.histogram(
            df, 
            x='account_balance',
            nbins=30,
            title="Account Balance Distribution"
        )
        
        # Create credit utilization vs risk score
        fig_scatter = px.scatter(
            df,
            x='utilization_ratio',
            y='risk_score',
            color='risk_category',
            title="Credit Utilization vs Risk Score"
        )
        
        # Save charts
        charts_dir = '/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase/notebooks/charts'
        import os
        os.makedirs(charts_dir, exist_ok=True)
        
        fig_risk.write_html(f"{charts_dir}/risk_distribution.html")
        fig_balance.write_html(f"{charts_dir}/balance_distribution.html") 
        fig_scatter.write_html(f"{charts_dir}/utilization_risk_analysis.html")
        
        print(f"📊 Charts saved to: {charts_dir}")
        
    except Exception as e:
        print(f"⚠️ Error creating visualizations: {e}")

if __name__ == "__main__":
    main()
