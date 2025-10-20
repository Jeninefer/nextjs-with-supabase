# ABACO Financial Intelligence Dataset Generator

## Overview

This directory contains the ABACO Financial Intelligence Platform's comprehensive dataset generation tools. These scripts create enterprise-grade financial datasets for analytics, machine learning, and business intelligence applications.

## Files

### 1. `abaco_dataset_generator.py`
The main dataset generation script that creates comprehensive financial customer data.

**Features:**
- Generates 30 customer records with 53+ analytical dimensions
- Includes realistic financial metrics and patterns
- Provides comprehensive analytics reporting
- Exports to CSV with summary statistics

**Usage:**
```bash
cd notebooks
python3 abaco_dataset_generator.py
```

**Output:**
- `abaco_comprehensive_dataset.csv` - Complete dataset
- `abaco_comprehensive_dataset_summary.txt` - Statistical summary

### 2. `fix_abaco_environment.sh` (in root directory)
Environment setup script that installs all required Python dependencies.

**Usage:**
```bash
bash ../fix_abaco_environment.sh
```

## Dataset Dimensions (53 total)

### Basic Information (5 dimensions)
- customer_id
- account_number
- customer_segment
- relationship_years
- age_group

### Account Metrics (4 dimensions)
- account_balance
- avg_monthly_balance
- min_balance_last_year
- max_balance_last_year

### Credit Metrics (5 dimensions)
- credit_limit
- outstanding_debt
- credit_score
- credit_utilization_ratio
- available_credit

### Transaction Activity (4 dimensions)
- monthly_transactions
- monthly_spending
- avg_transaction_value
- largest_transaction

### Income and Employment (4 dimensions)
- monthly_income
- annual_income
- employment_status
- income_stability_score

### Debt Metrics (5 dimensions)
- total_loans
- mortgage_balance
- personal_loan_balance
- auto_loan_balance
- debt_to_income_ratio

### Payment Behavior (4 dimensions)
- payment_history_score
- on_time_payments_pct
- late_payments_count
- missed_payments_count

### Risk Assessment (3 dimensions)
- risk_category
- risk_score
- default_probability

### Product Holdings (6 dimensions)
- num_products
- has_checking
- has_savings
- has_credit_card
- has_investment
- has_loan

### Profitability Metrics (6 dimensions)
- monthly_fee_income
- interest_income
- transaction_fee_income
- total_monthly_revenue
- customer_lifetime_value
- profit_margin

### Engagement Metrics (4 dimensions)
- digital_banking_usage_pct
- mobile_app_logins_monthly
- customer_service_calls
- satisfaction_score

### Growth and Trends (3 dimensions)
- account_growth_rate
- spending_trend
- investment_potential_score

## Requirements

The following Python packages are required:
- pandas >= 2.1.0
- numpy >= 1.24.0
- plotly >= 5.17.0
- matplotlib >= 3.8.0
- seaborn >= 0.12.0
- jinja2 >= 3.1.0
- scipy >= 1.11.0
- scikit-learn >= 1.3.0

Install using:
```bash
pip install pandas numpy plotly matplotlib seaborn jinja2 scipy scikit-learn
```

Or use the provided environment setup script.

## Analytics Report

The dataset generator automatically produces a comprehensive analytics report including:

- Customer segment distribution
- Financial health overview
- Risk distribution analysis
- Credit utilization metrics
- Profitability analysis
- Digital engagement statistics
- Product penetration rates

## Sample Output

```
================================================================================
🚀 ABACO FINANCIAL INTELLIGENCE PLATFORM
   Comprehensive Dataset Generator
================================================================================

✅ Generated dataset with 30 customers and 53 dimensions

📊 Dataset Summary:
   - Customers: 30
   - Dimensions: 53
   - Total Data Points: 1590
```

## Integration with ABACO Platform

This dataset generator is designed to work seamlessly with:
- ABACO Financial Intelligence Dashboard
- Risk assessment models
- Credit scoring systems
- Customer segmentation tools
- Predictive analytics pipelines

## License

Proprietary software. Part of the ABACO Financial Intelligence Platform.

## Support

For technical support or questions:
- Email: tech@abaco-platform.com
- Documentation: See main README.md

---

**ABACO Financial Intelligence Platform** - Enterprise-grade financial analytics
