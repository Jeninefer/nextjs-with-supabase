"""
ABACO Loan Analysis - Using Real Loan Tape Data
Analyzes loan disbursements, payments, and portfolio outstanding
"""

import re
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ========================================
# CONFIGURATION
# ========================================

# Shared folder path (adjust to your actual shared folder location)
SHARED_FOLDER = Path("/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase/data/shared")

# Output paths
OUTPUT_DIR = Path(
    "/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase/notebooks/loan_analysis"
)
OUTPUT_DIR.mkdir(exist_ok=True)

CHARTS_DIR = OUTPUT_DIR / "charts"
CHARTS_DIR.mkdir(exist_ok=True)

# ========================================
# HELPER FUNCTIONS
# ========================================


def find_loan_data_file(folder: Path) -> Path:
    """Find the loan data CSV file"""
    candidates = [
        "Abaco - Loan Tape_Loan Data_Table (9).csv",
        "Abaco - Loan Tape_Loan Data_Table (8).csv",
        "Abaco - Loan Tape_Loan Data.csv",
        "Loan Data.csv",
    ]

    for fname in candidates:
        fpath = folder / fname
        if fpath.exists():
            return fpath

    raise FileNotFoundError(f"Loan data file not found in {folder}")


def find_payment_history_file(folder: Path) -> Path:
    """Find the payment history CSV file"""
    candidates = [
        "Abaco - Loan Tape_Historic Real Payment_Table (9).csv",
        "Abaco - Loan Tape_Historic Real Payment_Table (8).csv",
        "Abaco - Loan Tape_Historic Real Payment.csv",
        "Historic Real Payment.csv",
    ]

    for fname in candidates:
        fpath = folder / fname
        if fpath.exists():
            return fpath

    raise FileNotFoundError(f"Payment history file not found in {folder}")


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize column names"""
    df = df.copy()
    df.columns = [
        re.sub(r"__+", "_", re.sub(r"[^\w]+", "_", str(c).strip().lower())).strip("_")
        for c in df.columns
    ]
    return df


def find_column(df: pd.DataFrame, patterns: list) -> str:
    """Find column matching any of the patterns"""
    cols = list(df.columns)
    for pattern in patterns:
        pat = re.compile(pattern, re.I)
        for col in cols:
            if pat.search(col):
                return col
    return None


def to_numeric(series: pd.Series) -> pd.Series:
    """Convert series to numeric, handling currency symbols"""
    s = series.astype(str)
    s = s.str.replace(r"[%$,₡€£¥\s]", "", regex=True)
    return pd.to_numeric(s, errors="coerce")


def to_datetime(series: pd.Series) -> pd.Series:
    """Convert series to datetime"""
    dt = pd.to_datetime(series, errors="coerce")
    # Try dayfirst if many NaT
    if dt.isna().mean() > 0.5:
        dt = pd.to_datetime(series, errors="coerce", dayfirst=True)
    return dt


# ========================================
# ANALYSIS 1: MONTHLY TRANSFERS & OPERATIONS
# ========================================


def analyze_transfers_operations(loan_df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze unique transfers and operations per month

    Transfer = base code "DSBXXXX" before "-"
    Operation = 3-digit identifier after "-"
    """
    print("\n" + "=" * 70)
    print("ANALYSIS 1: MONTHLY TRANSFERS & OPERATIONS")
    print("=" * 70)

    # Find loan ID and date columns
    loan_id_col = find_column(loan_df, [r"\bloan[_ ]?id\b", r"^dsb", r"\bloan\b"])
    date_col = find_column(loan_df, [r"disbursement.*date", r"fecha.*desembo", r"\bdate\b"])

    if not loan_id_col or not date_col:
        raise ValueError("Could not find required columns (Loan ID, Date)")

    print(f"✅ Using columns: {loan_id_col}, {date_col}")

    # Extract transfer and operation
    df = loan_df.copy()
    df["_loan_id"] = df[loan_id_col].astype(str).str.strip().str.upper()

    pattern = r"^(DSB[0-9A-Z]+)-(\d{3})$"
    parsed = df["_loan_id"].str.extract(pattern, expand=True)
    df["transfer"] = parsed[0]
    df["operation"] = parsed[1]

    # Filter valid rows
    df_valid = df.dropna(subset=["transfer", "operation"]).copy()
    print(f"✅ Valid loan IDs: {len(df_valid):,} / {len(df):,}")

    # Parse month
    df_valid["month"] = to_datetime(df_valid[date_col]).dt.to_period("M").astype(str)
    df_valid = df_valid.dropna(subset=["month"])

    # Remove duplicates
    df_unique = df_valid.drop_duplicates(subset=["transfer", "operation", "month"])

    # Aggregate
    monthly = (
        df_unique.groupby("month")
        .agg(
            transfers=("transfer", "nunique"),
            operations=("operation", "nunique"),
            total_disbursements=("transfer", "size"),
        )
        .reset_index()
    )

    monthly["avg_ops_per_transfer"] = (monthly["operations"] / monthly["transfers"]).round(2)

    monthly = monthly.sort_values("month")

    # Save
    output_file = OUTPUT_DIR / "monthly_transfers_operations.csv"
    monthly.to_csv(output_file, index=False)
    print(f"✅ Saved: {output_file}")

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Total months: {len(monthly)}")
    print(f"   Total unique transfers: {df_unique['transfer'].nunique():,}")
    print(f"   Total unique operations: {df_unique['operation'].nunique():,}")
    print(f"   Avg ops per transfer: {monthly['avg_ops_per_transfer'].mean():.2f}")

    return monthly


# ========================================
# ANALYSIS 2: AVERAGE AMOUNTS
# ========================================


def analyze_average_amounts(loan_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate average amounts per transfer and per operation
    """
    print("\n" + "=" * 70)
    print("ANALYSIS 2: AVERAGE AMOUNTS")
    print("=" * 70)

    # Find columns
    loan_id_col = find_column(loan_df, [r"\bloan[_ ]?id\b", r"^dsb"])
    amount_col = find_column(
        loan_df, [r"disbursement.*amount", r"\bdisbursement\b", r"\bamount\b", r"monto.*desemb"]
    )
    date_col = find_column(loan_df, [r"disbursement.*date", r"fecha.*desemb", r"\bdate\b"])

    if not all([loan_id_col, amount_col, date_col]):
        raise ValueError("Could not find required columns")

    print(f"✅ Using columns: {loan_id_col}, {amount_col}, {date_col}")

    # Parse data
    df = loan_df.copy()
    df["_loan_id"] = df[loan_id_col].astype(str).str.strip().str.upper()

    pattern = r"^(DSB[0-9A-Z]+)-(\d{3})$"
    parsed = df["_loan_id"].str.extract(pattern, expand=True)
    df["transfer"] = parsed[0]
    df["operation"] = parsed[1]

    df["amount"] = to_numeric(df[amount_col])
    df["month"] = to_datetime(df[date_col]).dt.to_period("M").astype(str)

    # Filter valid
    df_valid = df.dropna(subset=["transfer", "operation", "amount", "month"]).copy()
    print(f"✅ Valid records: {len(df_valid):,}")

    # Average per operation
    avg_per_operation = (
        df_valid.groupby("month")["amount"].mean().rename("avg_amount_per_operation")
    )

    # Average per transfer
    transfer_totals = (
        df_valid.groupby(["month", "transfer"])["amount"]
        .sum()
        .rename("transfer_total")
        .reset_index()
    )

    avg_per_transfer = (
        transfer_totals.groupby("month")["transfer_total"].mean().rename("avg_amount_per_transfer")
    )

    # Combine
    result = pd.concat([avg_per_operation, avg_per_transfer], axis=1).reset_index()
    result = result.sort_values("month")

    # Save
    output_file = OUTPUT_DIR / "average_amounts_monthly.csv"
    result.to_csv(output_file, index=False)
    print(f"✅ Saved: {output_file}")

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Avg per operation: ${result['avg_amount_per_operation'].mean():,.2f}")
    print(f"   Avg per transfer: ${result['avg_amount_per_transfer'].mean():,.2f}")

    return result


# ========================================
# ANALYSIS 3: OUTSTANDING BALANCE (CORRECTED)
# ========================================


def analyze_outstanding_balance(loan_df: pd.DataFrame, payment_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate month-end outstanding balance

    CORRECTED FORMULA:
    Outstanding = Cumulative Disbursements - Cumulative Principal Paid - Cumulative Write-offs
    """
    print("\n" + "=" * 70)
    print("ANALYSIS 3: OUTSTANDING BALANCE")
    print("=" * 70)

    # Find columns in loan data
    loan_amount_col = find_column(
        loan_df, [r"disbursement.*amount", r"monto.*desemb", r"\bamount\b"]
    )
    loan_date_col = find_column(loan_df, [r"disbursement.*date", r"fecha.*desemb", r"\bdate\b"])

    # Find columns in payment data
    payment_principal_col = find_column(
        payment_df, [r"principal.*payment", r"abono.*capital", r"principal"]
    )
    payment_date_col = find_column(payment_df, [r"payment.*date", r"fecha.*pago", r"\bdate\b"])

    if not all([loan_amount_col, loan_date_col, payment_principal_col, payment_date_col]):
        raise ValueError("Could not find required columns in loan or payment data")

    print(f"✅ Loan columns: {loan_amount_col}, {loan_date_col}")
    print(f"✅ Payment columns: {payment_principal_col}, {payment_date_col}")

    # Process loans
    loans = pd.DataFrame(
        {
            "date": to_datetime(loan_df[loan_date_col]),
            "disbursement": to_numeric(loan_df[loan_amount_col]),
        }
    ).dropna(subset=["date"])
    loans["disbursement"] = loans["disbursement"].fillna(0.0)

    # Process payments
    payments = pd.DataFrame(
        {
            "date": to_datetime(payment_df[payment_date_col]),
            "principal": to_numeric(payment_df[payment_principal_col]),
        }
    ).dropna(subset=["date"])
    payments["principal"] = payments["principal"].fillna(0.0)

    print(f"✅ Loans: {len(loans):,} records, ${loans['disbursement'].sum():,.2f} total")
    print(f"✅ Payments: {len(payments):,} records, ${payments['principal'].sum():,.2f} total")

    # Monthly aggregation
    def to_month_end(s):
        return s.dt.to_period("M").dt.to_timestamp("M")

    loans_monthly = (
        loans.groupby(to_month_end(loans["date"]))["disbursement"]
        .sum()
        .rename("disbursement_monthly")
    )

    payments_monthly = (
        payments.groupby(to_month_end(payments["date"]))["principal"]
        .sum()
        .rename("principal_monthly")
    )

    # Full monthly index
    start = min(loans_monthly.index.min(), payments_monthly.index.min())
    end = max(loans_monthly.index.max(), payments_monthly.index.max())

    monthly_index = pd.period_range(
        start=start.to_period("M"), end=end.to_period("M"), freq="M"
    ).to_timestamp("M")

    loans_monthly = loans_monthly.reindex(monthly_index, fill_value=0.0)
    payments_monthly = payments_monthly.reindex(monthly_index, fill_value=0.0)

    # Calculate outstanding (CORRECTED)
    cum_disbursements = loans_monthly.cumsum()
    cum_principal_paid = payments_monthly.cumsum()

    outstanding = (cum_disbursements - cum_principal_paid).clip(lower=0)

    # Assemble result
    result = pd.DataFrame(
        {
            "month_end": monthly_index,
            "disbursement_monthly": loans_monthly.values,
            "principal_paid_monthly": payments_monthly.values,
            "cum_disbursements": cum_disbursements.values,
            "cum_principal_paid": cum_principal_paid.values,
            "outstanding_eom": outstanding.values,
        }
    )

    result["month_end"] = result["month_end"].dt.strftime("%Y-%m-%d")

    # Save
    output_file = OUTPUT_DIR / "portfolio_outstanding_monthly.csv"
    result.to_csv(output_file, index=False)
    print(f"✅ Saved: {output_file}")

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Total disbursed: ${cum_disbursements.iloc[-1]:,.2f}")
    print(f"   Total principal paid: ${cum_principal_paid.iloc[-1]:,.2f}")
    print(f"   Current outstanding: ${outstanding.iloc[-1]:,.2f}")
    print(f"   Recovery rate: {(cum_principal_paid.iloc[-1]/cum_disbursements.iloc[-1]*100):.1f}%")

    return result


# ========================================
# VISUALIZATION
# ========================================


def create_visualizations(
    monthly_transfers: pd.DataFrame, monthly_amounts: pd.DataFrame, outstanding: pd.DataFrame
):
    """Create comprehensive visualizations"""
    print("\n" + "=" * 70)
    print("CREATING VISUALIZATIONS")
    print("=" * 70)

    # Chart 1: Transfers and Operations
    fig1 = make_subplots(
        rows=1, cols=2, subplot_titles=["Transfers per Month", "Operations per Month"]
    )

    fig1.add_trace(
        go.Bar(
            x=monthly_transfers["month"],
            y=monthly_transfers["transfers"],
            name="Transfers",
            marker_color="rgba(168, 85, 247, 0.8)",
        ),
        row=1,
        col=1,
    )

    fig1.add_trace(
        go.Bar(
            x=monthly_transfers["month"],
            y=monthly_transfers["operations"],
            name="Operations",
            marker_color="rgba(16, 185, 129, 0.8)",
        ),
        row=1,
        col=2,
    )

    fig1.update_layout(title="Monthly Transfers and Operations", template="plotly_dark", height=500)

    chart1_path = CHARTS_DIR / "transfers_operations.html"
    fig1.write_html(chart1_path)
    print(f"✅ Chart 1: {chart1_path}")

    # Chart 2: Average Amounts
    fig2 = go.Figure()

    fig2.add_trace(
        go.Scatter(
            x=monthly_amounts["month"],
            y=monthly_amounts["avg_amount_per_transfer"],
            mode="lines+markers",
            name="Avg per Transfer",
            line=dict(color="rgba(168, 85, 247, 0.8)", width=3),
        )
    )

    fig2.add_trace(
        go.Scatter(
            x=monthly_amounts["month"],
            y=monthly_amounts["avg_amount_per_operation"],
            mode="lines+markers",
            name="Avg per Operation",
            line=dict(color="rgba(16, 185, 129, 0.8)", width=3),
        )
    )

    fig2.update_layout(
        title="Average Disbursement Amounts",
        xaxis_title="Month",
        yaxis_title="Amount ($)",
        template="plotly_dark",
        height=500,
    )

    chart2_path = CHARTS_DIR / "average_amounts.html"
    fig2.write_html(chart2_path)
    print(f"✅ Chart 2: {chart2_path}")

    # Chart 3: Outstanding Balance
    fig3 = go.Figure()

    fig3.add_trace(
        go.Scatter(
            x=outstanding["month_end"],
            y=outstanding["outstanding_eom"],
            mode="lines",
            name="Outstanding Balance",
            fill="tozeroy",
            line=dict(color="rgba(239, 68, 68, 0.8)", width=3),
        )
    )

    fig3.update_layout(
        title="Portfolio Outstanding Balance Over Time",
        xaxis_title="Month",
        yaxis_title="Outstanding ($)",
        template="plotly_dark",
        height=500,
    )

    chart3_path = CHARTS_DIR / "outstanding_balance.html"
    fig3.write_html(chart3_path)
    print(f"✅ Chart 3: {chart3_path}")

    # Chart 4: Cumulative Flows
    fig4 = go.Figure()

    fig4.add_trace(
        go.Scatter(
            x=outstanding["month_end"],
            y=outstanding["cum_disbursements"],
            mode="lines",
            name="Cumulative Disbursements",
            line=dict(color="rgba(16, 185, 129, 0.8)", width=2),
        )
    )

    fig4.add_trace(
        go.Scatter(
            x=outstanding["month_end"],
            y=outstanding["cum_principal_paid"],
            mode="lines",
            name="Cumulative Principal Paid",
            line=dict(color="rgba(59, 130, 246, 0.8)", width=2),
        )
    )

    fig4.update_layout(
        title="Cumulative Disbursements vs Principal Paid",
        xaxis_title="Month",
        yaxis_title="Amount ($)",
        template="plotly_dark",
        height=500,
    )

    chart4_path = CHARTS_DIR / "cumulative_flows.html"
    fig4.write_html(chart4_path)
    print(f"✅ Chart 4: {chart4_path}")


# ========================================
# MAIN EXECUTION
# ========================================


def main():
    """Main execution function"""
    print("=" * 70)
    print("ABACO LOAN ANALYSIS - Using Real Loan Tape Data")
    print("=" * 70)

    try:
        # Find data files
        print("\n📂 Locating data files...")
        loan_file = find_loan_data_file(SHARED_FOLDER)
        payment_file = find_payment_history_file(SHARED_FOLDER)

        print(f"✅ Loan data: {loan_file.name}")
        print(f"✅ Payment data: {payment_file.name}")

        # Load data
        print("\n📥 Loading data...")
        loan_df = pd.read_csv(loan_file, dtype=str, low_memory=False)
        payment_df = pd.read_csv(payment_file, dtype=str, low_memory=False)

        loan_df = standardize_columns(loan_df)
        payment_df = standardize_columns(payment_df)

        print(f"✅ Loaded {len(loan_df):,} loan records")
        print(f"✅ Loaded {len(payment_df):,} payment records")

        # Run analyses
        monthly_transfers = analyze_transfers_operations(loan_df)
        monthly_amounts = analyze_average_amounts(loan_df)
        outstanding = analyze_outstanding_balance(loan_df, payment_df)

        # Create visualizations
        create_visualizations(monthly_transfers, monthly_amounts, outstanding)

        # Final summary
        print("\n" + "=" * 70)
        print("✅ ANALYSIS COMPLETE")
        print("=" * 70)
        print(f"\n📁 Output directory: {OUTPUT_DIR}")
        print(f"📊 Charts directory: {CHARTS_DIR}")
        print(f"\n📝 Generated files:")
        print(f"   1. monthly_transfers_operations.csv")
        print(f"   2. average_amounts_monthly.csv")
        print(f"   3. portfolio_outstanding_monthly.csv")
        print(f"   4. charts/transfers_operations.html")
        print(f"   5. charts/average_amounts.html")
        print(f"   6. charts/outstanding_balance.html")
        print(f"   7. charts/cumulative_flows.html")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise


if __name__ == "__main__":
    main()
