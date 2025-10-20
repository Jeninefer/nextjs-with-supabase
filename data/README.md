# Data Directory

This directory contains data files used by the Abaco Financial Intelligence notebook.

## Required Files

### MYPE 2025 Report PDF

**File**: `mype_report_2025.pdf`

**Purpose**: Market analysis and insights from the MYPE (Micro and Small Enterprises) 2025 report.

**Usage**: Cell 10 of the notebook extracts market insights from this PDF, specifically from pages 1, 2, and 35.

**Note**: If this file is not present, the notebook will use fallback market statistics automatically.

### Expected Data Format

The notebook expects financial data files with the following structure:

#### Sample Customer Data CSV

The notebook processes customer financial data with these typical columns:

- `customer_id`: Unique customer identifier
- `date`: Transaction or record date (ISO 8601 format)
- `balance`: Account balance
- `credit_limit`: Credit limit for the customer
- `dpd` or `days_past_due`: Days past due for payments
- `product_code`: Product identifier
- `origination_date`: Date when the account was opened
- `apr` or `nominal_rate`: Annual percentage rate
- `industry`: Customer's industry sector
- `kam_owner`: Key Account Manager assigned to the customer
- `customer_type`: Customer type (micro, sme, corporate, enterprise)
- `account_status`: Account status (active, delinquent)

#### Sample CSV Structure

```csv
customer_id,date,balance,credit_limit,dpd,product_code,origination_date,apr,industry,kam_owner,customer_type,account_status
CUST001,2025-01-15,50000,100000,0,PROD_A,2024-01-01,0.12,technology,KAM_001,sme,active
CUST002,2025-01-15,250000,300000,15,PROD_B,2023-06-15,0.15,manufacturing,KAM_002,corporate,delinquent
CUST003,2025-01-15,5000,10000,45,PROD_A,2024-08-20,0.25,retail,KAM_003,micro,delinquent
```

## Data Privacy

**Important**: This directory should not contain real customer data in version control. Add actual data files to `.gitignore` to prevent sensitive information from being committed.

## Adding Your Data

1. Place your CSV files with financial data in this directory
2. Ensure the file format matches the expected structure
3. Place the `mype_report_2025.pdf` file if available
4. Update the notebook cells to reference your specific filenames if different from defaults

## Fallback Mode

The notebook is designed to work without the PDF file by using fallback market statistics. This allows you to:
- Test the notebook without the full MYPE report
- Use your own market research data
- Focus on financial metrics without market context
