"""
Example: Using ABACO Loan Analysis Programmatically

This script demonstrates how to use the abaco_loan_analysis module
from your own Python scripts.
"""

import os
import sys
from pathlib import Path

# Add notebooks directory to path if running from repository root
notebooks_dir = Path(__file__).parent
if str(notebooks_dir) not in sys.path:
    sys.path.insert(0, str(notebooks_dir))

import abaco_loan_analysis as ala


def run_analysis_with_custom_path():
    """Example: Run analysis with custom data path"""
    
    # Option 1: Set environment variable before importing
    # os.environ['SHARED_FOLDER_PATH'] = '/custom/data/path'
    
    # Option 2: Modify the module's SHARED_FOLDER after import
    custom_data_path = Path('/path/to/your/data')
    ala.SHARED_FOLDER = custom_data_path
    
    print(f"Using data from: {ala.SHARED_FOLDER}")
    print(f"Outputs will be saved to: {ala.OUTPUT_DIR}")
    
    # Run the analysis
    try:
        ala.main()
        print("\n✅ Analysis completed successfully!")
    except FileNotFoundError as e:
        print(f"\n⚠️ Data files not found: {e}")
        print("Make sure your loan data files are in the correct location.")
    except Exception as e:
        print(f"\n❌ Error running analysis: {e}")


def run_individual_analyses():
    """Example: Run individual analysis functions"""
    
    import pandas as pd
    
    print("This example shows how to use individual analysis functions.")
    print("You'll need to load your data first:")
    
    # Load your data
    # loan_df = pd.read_csv('path/to/loan_data.csv')
    # payment_df = pd.read_csv('path/to/payment_data.csv')
    
    # Standardize columns
    # loan_df = ala.standardize_columns(loan_df)
    # payment_df = ala.standardize_columns(payment_df)
    
    # Run individual analyses
    # monthly_transfers = ala.analyze_transfers_operations(loan_df)
    # monthly_amounts = ala.analyze_average_amounts(loan_df)
    # outstanding = ala.analyze_outstanding_balance(loan_df, payment_df)
    
    # Create visualizations
    # ala.create_visualizations(monthly_transfers, monthly_amounts, outstanding)
    
    print("\nUncomment the code above after loading your data.")


def main():
    """Main function"""
    print("ABACO Loan Analysis - Programmatic Usage Examples")
    print("=" * 70)
    print()
    
    print("Example 1: Check configuration")
    print("-" * 70)
    print(f"Repository root: {ala.REPO_ROOT}")
    print(f"Data folder: {ala.SHARED_FOLDER}")
    print(f"Output directory: {ala.OUTPUT_DIR}")
    print(f"Charts directory: {ala.CHARTS_DIR}")
    print()
    
    print("Example 2: To run full analysis")
    print("-" * 70)
    print("Uncomment run_analysis_with_custom_path() to execute")
    # run_analysis_with_custom_path()
    print()
    
    print("Example 3: To run individual analyses")
    print("-" * 70)
    run_individual_analyses()


if __name__ == "__main__":
    main()
