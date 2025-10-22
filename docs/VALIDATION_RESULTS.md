# Validation Results - Loan Data Analysis

## Overview

This system provides validation results for loan data calculations including:
- Monthly transfers and operations counts
- Average amounts per transfer and operation
- Outstanding balance calculations with proper validation checks

## Accessing the Validation Results

### Via Web Interface

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the validation page:
   ```
   http://localhost:3000/dashboard/validation
   ```

### Via API

The validation data can also be accessed via API endpoint:
```
GET http://localhost:3000/api/validation-results
```

Returns JSON with:
- `validation_report`: Validation checks and summary statistics
- `monthly_transfers_operations`: Monthly counts of transfers and operations
- `monthly_averages`: Average amounts per transfer and operation
- `outstanding_balance`: Monthly outstanding balance calculations

## Generating New Validation Results

To regenerate validation results with fresh data:

```bash
cd notebooks
python3 generate_validation_results.py
```

This will:
1. Generate sample loan data validation results
2. Create CSV files with detailed monthly breakdowns
3. Create a JSON validation report
4. Save all files to `notebooks/validation_results/`

## Files Generated

- `monthly_transfers_operations.csv` - Monthly counts of unique transfers and operations
- `monthly_averages.csv` - Average amounts per transfer and per operation by month
- `outstanding_balance.csv` - Monthly outstanding balance with disbursements and payments
- `validation_report.json` - Validation checks and summary statistics

## Validation Checks

The system validates:
1. **No Negative Outstanding**: Ensures outstanding balance never goes negative
2. **Disbursements Monotonic**: Cumulative disbursements always increase or stay same
3. **Formula Consistent**: Outstanding = Disbursements - Principal Paid - Write-offs
4. **Final Outstanding Reasonable**: Final balance is between 0 and total disbursed

## Understanding the Results

### Monthly Transfers and Operations
- **Transfers**: Unique loan transfer identifiers (e.g., DSB0001)
- **Operations**: Unique operation codes within transfers (e.g., -001, -002)
- **Total Disbursements**: Number of disbursement records
- **Avg Ops per Transfer**: Average operations per transfer

### Monthly Averages
- **Avg Amount per Operation**: Mean disbursement amount per individual operation
- **Avg Amount per Transfer**: Mean total amount per transfer (sum of all operations)

### Outstanding Balance
- **Disbursement Monthly**: New loans disbursed in the month
- **Principal Paid Monthly**: Principal payments received
- **Interest Paid Monthly**: Interest payments received
- **Write-offs Monthly**: Loans written off
- **Outstanding EOM**: End-of-month outstanding balance

## Spanish Translation

The web interface is displayed in Spanish for user convenience:
- "Resultados de Validación" = Validation Results
- "Estado de Validación" = Validation Status
- "Estadísticas Resumidas" = Summary Statistics
- "Transferencias y Operaciones Mensuales" = Monthly Transfers and Operations
- "Montos Promedio Mensuales" = Monthly Average Amounts
- "Saldo Pendiente Mensual" = Monthly Outstanding Balance

## Technical Details

### Python Script
Located at: `notebooks/generate_validation_results.py`

Key functions:
- `generate_sample_validation_results()` - Creates sample validation data
- `save_validation_results()` - Saves results to CSV and JSON

### API Route
Located at: `app/api/validation-results/route.ts`

Reads validation files and returns JSON response.

### Page Component
Located at: `app/dashboard/validation/page.tsx`

React component that:
- Fetches validation data from API
- Displays validation status and checks
- Shows summary statistics
- Renders detailed monthly data tables

## Integration with Existing Analysis

This validation system is based on the loan analysis calculations in:
- `notebooks/loan_analysis_corrected.py`

The Python script contains the core calculation functions:
1. `calculate_monthly_transfers_operations()` - Counts unique transfers/operations
2. `calculate_average_amounts()` - Computes average amounts
3. `calculate_outstanding_balance()` - Calculates outstanding balances
4. `validate_outstanding_calculation()` - Runs validation checks

## Next Steps

To use with real loan data:

1. Update the data paths in `loan_analysis_corrected.py`:
   ```python
   loan_path = "path/to/your/Loan_Data.csv"
   payment_path = "path/to/your/Historic_Payment.csv"
   ```

2. Update column names to match your data:
   ```python
   loan_id_col='Loan ID',
   date_col='Disbursement Date',
   amount_col='Disbursement Amount'
   ```

3. Run the analysis:
   ```bash
   python3 notebooks/loan_analysis_corrected.py
   ```

4. The validation page will automatically display the new results.
