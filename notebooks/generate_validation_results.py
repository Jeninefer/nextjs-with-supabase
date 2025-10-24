#!/usr/bin/env python3
"""
ABACO Validation Results Generator
Generates validation metrics and results for financial data analysis
"""

import logging
import sys
from pathlib import Path
from typing import Dict, Optional

import pandas as pd
import numpy as np

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_financial_data(filepath: str) -> Optional[pd.DataFrame]:
    """
    Load financial data from CSV file with robust exception handling.
    
    Args:
        filepath: Path to the CSV file containing financial data
        
    Returns:
        DataFrame with financial data or None if loading fails
        
    Note:
        This function catches all exceptions that might occur during CSV reading,
        not just ImportError. This prevents crashes from malformed CSV files,
        encoding issues, permission errors, etc.
    """
    try:
        logger.info(f"Loading financial data from: {filepath}")
        
        # Attempt to read CSV file
        df = pd.read_csv(filepath)
        
        logger.info(f"✅ Successfully loaded {len(df):,} records from {filepath}")
        logger.info(f"Columns: {', '.join(df.columns.tolist())}")
        
        return df
        
    except FileNotFoundError as e:
        logger.error(f"❌ File not found: {filepath}")
        logger.error(f"Error details: {e}")
        return None
        
    except pd.errors.EmptyDataError as e:
        logger.error(f"❌ CSV file is empty: {filepath}")
        logger.error(f"Error details: {e}")
        return None
        
    except pd.errors.ParserError as e:
        logger.error(f"❌ CSV file is malformed or has parsing errors: {filepath}")
        logger.error(f"Error details: {e}")
        return None
        
    except PermissionError as e:
        logger.error(f"❌ Permission denied when reading file: {filepath}")
        logger.error(f"Error details: {e}")
        return None
        
    except UnicodeDecodeError as e:
        logger.error(f"❌ Encoding error when reading file: {filepath}")
        logger.error(f"Error details: {e}")
        logger.info("Trying to read with different encoding...")
        try:
            df = pd.read_csv(filepath, encoding='latin-1')
            logger.info(f"✅ Successfully loaded with latin-1 encoding")
            return df
        except Exception as fallback_error:
            logger.error(f"❌ Failed with alternative encoding: {fallback_error}")
            return None
            
    except Exception as e:
        # Catch all other exceptions to prevent crashes
        logger.error(f"❌ Unexpected error loading CSV file: {filepath}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {e}")
        return None


def validate_financial_data(df: pd.DataFrame) -> Dict:
    """
    Perform validation checks on financial data.
    
    Args:
        df: DataFrame containing financial data
        
    Returns:
        Dictionary with validation results
    """
    validation_results = {
        'total_records': len(df),
        'checks_passed': [],
        'checks_failed': [],
        'warnings': []
    }
    
    try:
        # Check 1: No negative balances
        if 'account_balance' in df.columns:
            negative_balances = df[df['account_balance'] < 0]
            if len(negative_balances) == 0:
                validation_results['checks_passed'].append('No negative account balances')
                logger.info("✅ Check passed: No negative balances")
            else:
                validation_results['checks_failed'].append(
                    f'Found {len(negative_balances)} negative account balances'
                )
                logger.warning(f"⚠️ Found {len(negative_balances)} negative balances")
        
        # Check 2: Credit score ranges
        if 'credit_score' in df.columns:
            invalid_scores = df[
                (df['credit_score'] < 300) | (df['credit_score'] > 850)
            ]
            if len(invalid_scores) == 0:
                validation_results['checks_passed'].append('All credit scores in valid range (300-850)')
                logger.info("✅ Check passed: Credit scores in valid range")
            else:
                validation_results['checks_failed'].append(
                    f'Found {len(invalid_scores)} invalid credit scores'
                )
                logger.warning(f"⚠️ Found {len(invalid_scores)} invalid credit scores")
        
        # Check 3: Utilization ratio reasonableness
        if 'utilization_ratio' in df.columns:
            high_utilization = df[df['utilization_ratio'] > 1.5]
            if len(high_utilization) == 0:
                validation_results['checks_passed'].append('All utilization ratios reasonable')
                logger.info("✅ Check passed: Utilization ratios reasonable")
            else:
                validation_results['warnings'].append(
                    f'Found {len(high_utilization)} records with very high utilization (>150%)'
                )
                logger.warning(f"⚠️ {len(high_utilization)} records with high utilization")
        
        # Check 4: Required columns present
        required_columns = [
            'customer_id', 'account_balance', 'credit_score', 
            'risk_category', 'monthly_income'
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if len(missing_columns) == 0:
            validation_results['checks_passed'].append('All required columns present')
            logger.info("✅ Check passed: All required columns present")
        else:
            validation_results['checks_failed'].append(
                f'Missing required columns: {", ".join(missing_columns)}'
            )
            logger.error(f"❌ Missing columns: {missing_columns}")
        
        
    except Exception as e:
        logger.error(f"❌ Error during validation: {e}")
        validation_results['checks_failed'].append(f'Validation error: {str(e)}')
    
    # Calculate summary statistics - always executed regardless of exceptions
    validation_results['summary'] = {
        'total_checks': len(validation_results['checks_passed']) + len(validation_results['checks_failed']),
        'passed': len(validation_results['checks_passed']),
        'failed': len(validation_results['checks_failed']),
        'warnings': len(validation_results['warnings'])
    }
    
    return validation_results


def generate_validation_report(validation_results: Dict, output_path: Optional[str] = None) -> None:
    """
    Generate and display validation report.
    
    Args:
        validation_results: Dictionary with validation results
        output_path: Optional path to save report as JSON
    """
    print("\n" + "="*60)
    print("📊 ABACO FINANCIAL DATA VALIDATION REPORT")
    print("="*60)
    
    print(f"\n📈 Total Records Validated: {validation_results['total_records']:,}")
    print(f"\n✅ Checks Passed: {validation_results['summary']['passed']}")
    for check in validation_results['checks_passed']:
        print(f"  ✓ {check}")
    
    if validation_results['checks_failed']:
        print(f"\n❌ Checks Failed: {validation_results['summary']['failed']}")
        for check in validation_results['checks_failed']:
            print(f"  ✗ {check}")
    
    if validation_results['warnings']:
        print(f"\n⚠️ Warnings: {validation_results['summary']['warnings']}")
        for warning in validation_results['warnings']:
            print(f"  ⚠ {warning}")
    
    print("\n" + "="*60)
    
    # Save to file if requested
    if output_path:
        try:
            import json
            with open(output_path, 'w') as f:
                json.dump(validation_results, f, indent=2)
            logger.info(f"✅ Validation report saved to: {output_path}")
        except Exception as e:
            logger.error(f"❌ Failed to save validation report: {e}")


def main():
    """Main execution function"""
    print("🚀 ABACO Validation Results Generator")
    print("="*60)
    
    # Define data file path
    script_dir = Path(__file__).parent
    data_file = script_dir / "financial_analysis_results.csv"
    
    # Load financial data with robust exception handling
    df = load_financial_data(str(data_file))
    
    if df is None:
        logger.error("❌ Failed to load financial data. Exiting.")
        sys.exit(1)
    
    # Perform validation
    logger.info("\n🔍 Performing validation checks...")
    validation_results = validate_financial_data(df)
    
    # Generate report
    output_file = script_dir / "validation_results.json"
    generate_validation_report(validation_results, str(output_file))
    
    # Exit with appropriate code
    if validation_results['summary']['failed'] > 0:
        logger.warning("⚠️ Some validation checks failed")
        sys.exit(1)
    else:
        logger.info("✅ All validation checks passed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
