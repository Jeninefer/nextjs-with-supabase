import re
from pathlib import Path

import numpy as np
import pandas as pd

# ========================================
# SCRIPT 1: Monthly Transfers & Operations (CORRECTED)
# ========================================


def calculate_monthly_transfers_operations(df, loan_id_col, date_col):
    """
    Calculate unique transfers and operations per month

    Args:
        df: DataFrame with loan data
        loan_id_col: Column name containing loan IDs (e.g., 'DSBXXXX-001')
        date_col: Column name containing dates

    Returns:
        DataFrame with monthly counts
    """
    # Extract transfer base and operation code
    df_clean = df.copy()
    df_clean["_loan_id"] = df_clean[loan_id_col].astype(str).str.strip().str.upper()

    # Parse transfer and operation
    pattern = r"^(DSB[0-9A-Z]+)-(\d{3})$"
    parsed = df_clean["_loan_id"].str.extract(pattern, expand=True)
    df_clean["transfer"] = parsed[0]
    df_clean["operation"] = parsed[1]

    # Filter valid rows
    df_valid = df_clean.dropna(subset=["transfer", "operation"]).copy()

    # Parse date to month
    df_valid["month"] = (
        pd.to_datetime(df_valid[date_col], errors="coerce").dt.to_period("M").astype(str)
    )

    # Remove duplicates (same transfer+operation+month)
    df_unique = df_valid.drop_duplicates(subset=["transfer", "operation", "month"])

    # Aggregate by month
    monthly = (
        df_unique.groupby("month")
        .agg(
            transfers=("transfer", "nunique"),
            operations=("operation", "nunique"),
            total_disbursements=("transfer", "size"),
        )
        .reset_index()
    )

    # Calculate average operations per transfer
    monthly["avg_ops_per_transfer"] = (monthly["operations"] / monthly["transfers"]).round(2)

    # Sort by month
    monthly = monthly.sort_values("month")

    return monthly


# ========================================
# SCRIPT 2: Average Amounts (CORRECTED)
# ========================================


def calculate_average_amounts(df, loan_id_col, amount_col, date_col):
    """
    Calculate average amounts per transfer and per operation

    Args:
        df: DataFrame with loan data
        loan_id_col: Column containing loan IDs
        amount_col: Column containing disbursement amounts
        date_col: Column containing dates

    Returns:
        DataFrame with average amounts by month
    """
    df_clean = df.copy()

    # Parse loan ID
    df_clean["_loan_id"] = df_clean[loan_id_col].astype(str).str.strip().str.upper()
    pattern = r"^(DSB[0-9A-Z]+)-(\d{3})$"
    parsed = df_clean["_loan_id"].str.extract(pattern, expand=True)
    df_clean["transfer"] = parsed[0]
    df_clean["operation"] = parsed[1]

    # Parse amount (remove currency symbols, commas, etc.)
    df_clean["amount"] = (
        df_clean[amount_col]
        .astype(str)
        .str.replace(r"[%$,₡€£¥\s]", "", regex=True)
        .pipe(pd.to_numeric, errors="coerce")
    )

    # Parse month
    df_clean["month"] = (
        pd.to_datetime(df_clean[date_col], errors="coerce").dt.to_period("M").astype(str)
    )

    # Filter valid rows
    df_valid = df_clean.dropna(subset=["transfer", "operation", "amount", "month"]).copy()

    # ===== Average per Operation =====
    # Each row is an operation, so directly average the amounts
    avg_per_operation = (
        df_valid.groupby("month")["amount"].mean().rename("avg_amount_per_operation")
    )

    # ===== Average per Transfer =====
    # Step 1: Sum all operation amounts within each transfer+month
    transfer_totals = (
        df_valid.groupby(["month", "transfer"])["amount"]
        .sum()
        .rename("transfer_total")
        .reset_index()
    )

    # Step 2: Average these transfer totals across the month
    avg_per_transfer = (
        transfer_totals.groupby("month")["transfer_total"].mean().rename("avg_amount_per_transfer")
    )

    # Combine results
    result = pd.concat([avg_per_operation, avg_per_transfer], axis=1).reset_index()
    result = result.sort_values("month")

    return result


# ========================================
# SCRIPT 3: Outstanding Balance (CORRECTED)
# ========================================


def calculate_outstanding_balance(
    loan_df,
    payment_df,
    loan_amount_col,
    loan_date_col,
    payment_principal_col,
    payment_date_col,
    payment_interest_col=None,  # NEW: Optional interest column
    writeoff_col=None,  # NEW: Optional write-off column
):
    """
    Calculate month-end outstanding balance with corrections

    Args:
        loan_df: DataFrame with loan disbursements
        payment_df: DataFrame with payment history
        loan_amount_col: Column with disbursement amounts
        loan_date_col: Column with disbursement dates
        payment_principal_col: Column with principal payments
        payment_date_col: Column with payment dates
        payment_interest_col: Optional column with interest payments
        writeoff_col: Optional column with write-offs

    Returns:
        DataFrame with month-end outstanding balances
    """

    # Helper function to convert to numeric
    def to_numeric(series):
        return (
            series.astype(str)
            .str.replace(r"[%$,₡€£¥\s]", "", regex=True)
            .pipe(pd.to_numeric, errors="coerce")
            .fillna(0.0)
        )

    # Helper function to convert to month-end
    def to_month_end(series):
        return series.dt.to_period("M").dt.to_timestamp("M")

    # ===== Process Disbursements =====
    loans = pd.DataFrame(
        {
            "date": pd.to_datetime(loan_df[loan_date_col], errors="coerce"),
            "disbursement": to_numeric(loan_df[loan_amount_col]),
        }
    ).dropna(subset=["date"])

    loans_monthly = (
        loans.groupby(to_month_end(loans["date"]))["disbursement"]
        .sum()
        .rename("disbursement_monthly")
    )

    # ===== Process Payments =====
    payments = pd.DataFrame(
        {
            "date": pd.to_datetime(payment_df[payment_date_col], errors="coerce"),
            "principal": to_numeric(payment_df[payment_principal_col]),
        }
    ).dropna(subset=["date"])

    # Add interest if available
    if payment_interest_col and payment_interest_col in payment_df.columns:
        payments["interest"] = to_numeric(payment_df[payment_interest_col])
    else:
        payments["interest"] = 0.0

    # Add write-offs if available
    if writeoff_col and writeoff_col in payment_df.columns:
        payments["writeoff"] = to_numeric(payment_df[writeoff_col])
    else:
        payments["writeoff"] = 0.0

    payments_monthly = payments.groupby(to_month_end(payments["date"])).agg(
        {"principal": "sum", "interest": "sum", "writeoff": "sum"}
    )

    # ===== Create Full Monthly Index =====
    start = min(loans_monthly.index.min(), payments_monthly.index.min())
    end = max(loans_monthly.index.max(), payments_monthly.index.max())

    monthly_index = pd.period_range(
        start=start.to_period("M"), end=end.to_period("M"), freq="M"
    ).to_timestamp("M")

    # Reindex to include all months
    loans_monthly = loans_monthly.reindex(monthly_index, fill_value=0.0)
    payments_monthly = payments_monthly.reindex(monthly_index, fill_value=0.0)

    # ===== Calculate Outstanding =====
    # CORRECTED FORMULA:
    # Outstanding = Cumulative Disbursements - Cumulative Principal Paid - Cumulative Write-offs

    cum_disbursements = loans_monthly.cumsum()
    cum_principal_paid = payments_monthly["principal"].cumsum()
    cum_writeoffs = payments_monthly["writeoff"].cumsum()

    outstanding = (cum_disbursements - cum_principal_paid - cum_writeoffs).clip(lower=0)

    # ===== Assemble Result =====
    result = pd.DataFrame(
        {
            "month_end": monthly_index,
            "disbursement_monthly": loans_monthly.values,
            "principal_paid_monthly": payments_monthly["principal"].values,
            "interest_paid_monthly": payments_monthly["interest"].values,
            "writeoffs_monthly": payments_monthly["writeoff"].values,
            "cum_disbursements": cum_disbursements.values,
            "cum_principal_paid": cum_principal_paid.values,
            "cum_writeoffs": cum_writeoffs.values,
            "outstanding_eom": outstanding.values,
        }
    )

    result["month_end"] = result["month_end"].dt.strftime("%Y-%m-%d")

    return result


# ========================================
# VALIDATION CHECKS
# ========================================


def validate_outstanding_calculation(result_df):
    """
    Validate the outstanding balance calculation

    Returns:
        dict with validation results
    """
    checks = {}

    # Check 1: Outstanding should never be negative
    checks["no_negative_outstanding"] = (result_df["outstanding_eom"] >= 0).all()

    # Check 2: Cumulative disbursements should be monotonically increasing
    checks["disbursements_monotonic"] = (result_df["cum_disbursements"].diff().fillna(0) >= 0).all()

    # Check 3: Outstanding should match formula
    calculated_outstanding = (
        result_df["cum_disbursements"]
        - result_df["cum_principal_paid"]
        - result_df["cum_writeoffs"]
    ).clip(lower=0)

    checks["formula_consistent"] = np.allclose(
        result_df["outstanding_eom"], calculated_outstanding, rtol=1e-5
    )

    # Check 4: Final outstanding should be reasonable
    final_outstanding = result_df["outstanding_eom"].iloc[-1]
    total_disbursed = result_df["cum_disbursements"].iloc[-1]
    checks["final_outstanding_reasonable"] = 0 <= final_outstanding <= total_disbursed

    return checks


# ========================================
# USAGE EXAMPLE
# ========================================

if __name__ == "__main__":
    # Example usage with your data

    # Load data (adjust paths as needed)
    loan_path = "/mnt/data/Abaco - Loan Tape_Loan Data.csv"
    payment_path = "/mnt/data/Abaco - Loan Tape_Historic Real Payment.csv"

    loan_df = pd.read_csv(loan_path, dtype=str, low_memory=False)
    payment_df = pd.read_csv(payment_path, dtype=str, low_memory=False)

    # Script 1: Transfers and Operations
    monthly_counts = calculate_monthly_transfers_operations(
        df=loan_df, loan_id_col="Loan ID", date_col="Disbursement Date"
    )
    print("\n=== Monthly Transfers and Operations ===")
    print(monthly_counts)

    # Script 2: Average Amounts
    monthly_averages = calculate_average_amounts(
        df=loan_df,
        loan_id_col="Loan ID",
        amount_col="Disbursement Amount",
        date_col="Disbursement Date",
    )
    print("\n=== Average Amounts ===")
    print(monthly_averages)

    # Script 3: Outstanding Balance (CORRECTED)
    outstanding = calculate_outstanding_balance(
        loan_df=loan_df,
        payment_df=payment_df,
        loan_amount_col="Disbursement Amount",
        loan_date_col="Disbursement Date",
        payment_principal_col="Principal Payment",
        payment_date_col="Payment Date",
        payment_interest_col="Interest Payment",  # If available
        writeoff_col="Write-off Amount",  # If available
    )
    print("\n=== Outstanding Balance ===")
    print(outstanding)

    # Validate
    validation_results = validate_outstanding_calculation(outstanding)
    print("\n=== Validation Results ===")
    for check, passed in validation_results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {check}")
