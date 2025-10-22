# ABACO Loan Analysis

This directory contains the ABACO Loan Analysis script and its outputs.

## Overview

The `abaco_loan_analysis.py` script analyzes loan disbursements, payments, and portfolio outstanding using real loan tape data.

## Features

1. **Monthly Transfers & Operations Analysis**: Analyzes unique transfers and operations per month
2. **Average Amounts Calculation**: Calculates average amounts per transfer and operation
3. **Outstanding Balance Tracking**: Computes month-end outstanding balance with cumulative flows
4. **Interactive Visualizations**: Generates interactive HTML charts using Plotly

## Setup

### Prerequisites

Install required Python packages:

```bash
pip install pandas numpy plotly
```

Or install all dependencies from the notebooks requirements file:

```bash
pip install -r notebooks/requirements.txt
```

### Data Requirements

The script expects loan data files in the `data/shared` directory (relative to repository root):

- Loan Data CSV file (e.g., `Abaco - Loan Tape_Loan Data_Table (9).csv`)
- Payment History CSV file (e.g., `Abaco - Loan Tape_Historic Real Payment_Table (9).csv`)

You can override the data location using the `SHARED_FOLDER_PATH` environment variable:

```bash
export SHARED_FOLDER_PATH=/path/to/your/data
```

## Usage

### Running the Analysis

```bash
cd notebooks
python abaco_loan_analysis.py
```

### Output Files

The script generates the following files in `notebooks/loan_analysis/`:

#### CSV Files:
- `monthly_transfers_operations.csv` - Monthly transfers and operations summary
- `average_amounts_monthly.csv` - Average amounts per transfer and operation
- `portfolio_outstanding_monthly.csv` - Outstanding balance over time

#### Visualizations (in `charts/` subdirectory):
- `transfers_operations.html` - Monthly transfers and operations charts
- `average_amounts.html` - Average disbursement amounts over time
- `outstanding_balance.html` - Portfolio outstanding balance timeline
- `cumulative_flows.html` - Cumulative disbursements vs principal paid

## Script Structure

### Key Functions

- `find_loan_data_file()` - Locates the loan data CSV file
- `find_payment_history_file()` - Locates the payment history CSV file
- `standardize_columns()` - Standardizes column names in DataFrames
- `analyze_transfers_operations()` - Analyzes monthly transfers and operations
- `analyze_average_amounts()` - Calculates average amounts
- `analyze_outstanding_balance()` - Computes outstanding balances
- `create_visualizations()` - Generates interactive charts
- `main()` - Orchestrates the entire analysis process

### Configuration

The script uses relative paths by default:
- **REPO_ROOT**: Parent directory of the notebooks folder
- **SHARED_FOLDER**: `{REPO_ROOT}/data/shared` (configurable via env var)
- **OUTPUT_DIR**: `notebooks/loan_analysis`
- **CHARTS_DIR**: `notebooks/loan_analysis/charts`

## Loan ID Format

The script expects loan IDs in the format: `DSB[CODE]-[OPS]`
- **Transfer**: Base code before the hyphen (e.g., `DSB1234`)
- **Operation**: 3-digit identifier after the hyphen (e.g., `001`)
- Example: `DSB1234-001`

## Example Output

### Console Output
```
======================================================================
ABACO LOAN ANALYSIS - Using Real Loan Tape Data
======================================================================

📂 Locating data files...
✅ Loan data: Abaco - Loan Tape_Loan Data_Table (9).csv
✅ Payment data: Abaco - Loan Tape_Historic Real Payment_Table (9).csv

📥 Loading data...
✅ Loaded 1,234 loan records
✅ Loaded 5,678 payment records

======================================================================
ANALYSIS 1: MONTHLY TRANSFERS & OPERATIONS
======================================================================
...
```

## Troubleshooting

### File Not Found Errors

If you get "Loan data file not found" errors:
1. Check that your data files are in the correct location
2. Set the `SHARED_FOLDER_PATH` environment variable to your data directory
3. Verify the file names match the expected patterns in the script

### Missing Dependencies

If you get import errors:
```bash
pip install pandas numpy plotly --user
```

### Path Issues

The script now uses relative paths from the repository structure. If you encounter path issues:
1. Ensure you're running the script from the `notebooks/` directory
2. Check that the repository structure is intact
3. Verify file paths in the error messages

## Notes

- Generated CSV and HTML files are excluded from git (see `.gitignore`)
- Directory structure is preserved with `.gitkeep` files
- The script uses Plotly for interactive visualizations (dark theme)
- All amounts are assumed to be in the same currency
