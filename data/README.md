# Data Directory

This directory contains sample datasets and documentation for the ABACO Financial Intelligence Platform's Market Analysis feature.

## Overview

The data directory is designed to support financial analytics, risk modeling, and market intelligence workflows. All files follow standardized formats to ensure compatibility with the analysis notebooks.

## Data Files

### sample_financial_data.csv

Sample customer financial dataset containing anonymized lending records for demonstration and testing purposes.

**Columns:**
- `customer_id`: Unique customer identifier (string, format: CUST###)
- `date`: Transaction or snapshot date (YYYY-MM-DD format)
- `balance`: Current outstanding balance (numeric, in currency units)
- `credit_limit`: Approved credit limit (numeric, in currency units)
- `dpd`: Days Past Due - number of days payment is overdue (integer, 0 = current)
- `product_code`: Product type code (CC=Credit Card, PL=Personal Loan, BL=Business Loan)
- `origination_date`: Account opening date (YYYY-MM-DD format)
- `industry`: Customer's industry sector (string)
- `kam_owner`: Key Account Manager identifier (string, format: KAM###)
- `monthly_revenue`: Monthly revenue/income (numeric, optional)
- `payment_history_score`: Historical payment reliability score (numeric, 0-100)

**Expected Data Types:**
```python
{
    'customer_id': str,
    'date': str (datetime),
    'balance': float,
    'credit_limit': float,
    'dpd': int,
    'product_code': str,
    'origination_date': str (datetime),
    'industry': str,
    'kam_owner': str,
    'monthly_revenue': float,
    'payment_history_score': float
}
```

## Data Privacy and Security

⚠️ **IMPORTANT**: This directory is excluded from version control via `.gitignore`

### Guidelines:
1. **Never commit real customer data** - Only use anonymized or synthetic datasets
2. **Sample data only** - The included CSV files are for demonstration purposes
3. **Production data** - Real financial data must be:
   - Stored in secure databases (Supabase)
   - Accessed via authenticated APIs only
   - Encrypted at rest and in transit
   - Compliant with GDPR, SOX, and Basel III regulations

### For Development:
- Use `sample_financial_data.csv` for local testing
- Generate synthetic data for development environments
- Never download production data to local environments

## Usage in Notebooks

To load the sample data in Jupyter notebooks:

```python
import pandas as pd

# Load sample financial data
df = pd.read_csv('data/sample_financial_data.csv')

# Convert date columns
df['date'] = pd.to_datetime(df['date'])
df['origination_date'] = pd.to_datetime(df['origination_date'])

print(f"Loaded {len(df)} customer records")
```

## Data Refresh Policy

- Sample datasets: Updated quarterly with new synthetic records
- Schema changes: Documented in this README with version history
- Backwards compatibility: Maintained for at least 2 major versions

## Support

For questions about data formats or schema:
- Technical: tech@abaco-platform.com
- Data governance: data@abaco-platform.com

---

**Last Updated**: October 2025
**Schema Version**: 1.0.0
