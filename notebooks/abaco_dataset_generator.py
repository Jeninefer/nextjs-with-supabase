#!/usr/bin/env python3
"""
ABACO Financial Intelligence Platform - Comprehensive Dataset Generator
Enterprise-grade financial analytics with 30+ dimensional customer analysis
"""

import pandas as pd
import numpy as np
def build_comprehensive_abaco_dataset():
    """
    Generates a comprehensive synthetic financial dataset for the ABACO platform.

    Algorithm:
        - Creates data for 30 customers, each with 53 analytical dimensions.
        - Uses numpy's random module to generate realistic financial and demographic data.
        - Sets random seed to 42 for reproducibility.
        - Employs various statistical distributions:
            * Customer segments and age groups: categorical sampling via np.random.choice.
            * Relationship years, monthly transactions: uniform integer sampling via np.random.randint.
            * Account balances: log-normal distribution (mean=10, sigma=1.5).
            * Monthly balances, min/max balances: scaled from account balance using uniform multipliers.
            * Credit limits: uniform distribution (range 5,000 to 100,000).
            * Outstanding debt: scaled from credit limit using uniform multipliers.
            * Credit scores: categorical sampling.
            * Transaction activity and spending: uniform distributions.
            * Additional dimensions use combinations of the above or further random sampling.

    Implementation details:
        - All random number generation uses np.random with seed 42 for reproducibility.
        - Data is returned as a pandas DataFrame.

    Returns:
        pd.DataFrame: DataFrame with 30 customers and 53 analytical dimensions.
    """
    print("🚀 Building ABACO Financial Intelligence Dataset...")
    
    # Enhanced customer base - 30 customers for comprehensive analysis
    num_customers = 30
    customers = [f"CUST{i:03d}" for i in range(1, num_customers + 1)]
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Generate realistic financial data across 35+ dimensions
    
    # 1. Basic Customer Information
    customer_ids = customers
    account_numbers = [f"ACC{1000000 + i}" for i in range(num_customers)]
    customer_segments = np.random.choice(['Retail', 'Premium', 'Corporate', 'SME'], num_customers, p=[0.4, 0.3, 0.2, 0.1])
    relationship_years = np.random.randint(1, 25, num_customers)
    age_groups = np.random.choice(['18-25', '26-35', '36-45', '46-55', '56-65', '65+'], num_customers)
    
    # 2. Account Metrics
    account_balance = np.round(np.random.lognormal(mean=10, sigma=1.5, size=num_customers), 2)
    avg_monthly_balance = account_balance * np.random.uniform(0.8, 1.2, num_customers)
    min_balance_last_year = account_balance * np.random.uniform(0.3, 0.7, num_customers)
    max_balance_last_year = account_balance * np.random.uniform(1.1, 1.5, num_customers)
    
    # 3. Credit Metrics
    credit_limit = np.round(np.random.uniform(5000, 100000, num_customers), 2)
    outstanding_debt = credit_limit * np.random.uniform(0.1, 0.9, num_customers)
    credit_score = np.random.choice([580, 620, 660, 700, 740, 780, 820, 850], num_customers)
    credit_utilization_ratio = np.round((outstanding_debt / credit_limit) * 100, 2)
    available_credit = credit_limit - outstanding_debt
    
    # 4. Transaction Activity
    monthly_transactions = np.random.randint(5, 150, num_customers)
    monthly_spending = np.round(np.random.uniform(500, 15000, num_customers), 2)
    avg_transaction_value = np.round(monthly_spending / monthly_transactions, 2)
    largest_transaction = monthly_spending * np.random.uniform(0.2, 0.5, num_customers)
    
    # 5. Income and Employment
    monthly_income = np.round(np.random.lognormal(mean=8.5, sigma=0.8, size=num_customers), 2)
    annual_income = monthly_income * 12
    employment_status = np.random.choice(['Employed', 'Self-Employed', 'Retired', 'Business Owner'], num_customers)
    income_stability_score = np.random.uniform(0.6, 1.0, num_customers)
    
    # 6. Debt Metrics
    total_loans = np.round(np.random.uniform(0, 250000, num_customers), 2)
    
    # Generate loan components that sum to total_loans
    # Use normalized random values to ensure components sum to 1.0
    mortgage_pct = np.random.uniform(0.5, 0.8, num_customers)
    personal_pct = np.random.uniform(0.1, 0.3, num_customers) 
    auto_pct = np.random.uniform(0.05, 0.15, num_customers)
    
    # Normalize percentages to sum to 1.0
    total_pct = mortgage_pct + personal_pct + auto_pct
    mortgage_pct = mortgage_pct / total_pct
    personal_pct = personal_pct / total_pct
    auto_pct = auto_pct / total_pct
    
    # Calculate balances using normalized percentages
    mortgage_balance = total_loans * mortgage_pct
    personal_loan_balance = total_loans * personal_pct
    auto_loan_balance = total_loans * auto_pct
    debt_to_income_ratio = np.round((total_loans / annual_income) * 100, 2)
    
    # 7. Payment Behavior
    payment_history_score = np.random.uniform(0.7, 1.0, num_customers)
    on_time_payments_pct = np.round(payment_history_score * 100, 1)
    late_payments_count = np.random.randint(0, 5, num_customers)
    missed_payments_count = np.random.randint(0, 3, num_customers)
    
    # 8. Risk Assessment
    risk_category = np.random.choice(['Low', 'Medium', 'High', 'Critical'], num_customers, p=[0.35, 0.40, 0.20, 0.05])
    risk_score = np.round(np.random.uniform(10, 100, num_customers), 2)
    default_probability = np.round(risk_score / 100 * np.random.uniform(0.01, 0.15, num_customers), 4)
    
    # 9. Product Holdings
    num_products = np.random.randint(1, 8, num_customers)
    has_checking = np.random.choice([True, False], num_customers, p=[0.9, 0.1])
    has_savings = np.random.choice([True, False], num_customers, p=[0.7, 0.3])
    has_credit_card = np.random.choice([True, False], num_customers, p=[0.8, 0.2])
    has_investment = np.random.choice([True, False], num_customers, p=[0.4, 0.6])
    has_loan = np.random.choice([True, False], num_customers, p=[0.5, 0.5])
    
    # 10. Profitability Metrics
    monthly_fee_income = np.round(np.random.uniform(5, 50, num_customers), 2)
    interest_income = np.round(outstanding_debt * 0.15 / 12, 2)  # 15% APR
    transaction_fee_income = np.round(monthly_transactions * np.random.uniform(0.1, 0.5, num_customers), 2)
    total_monthly_revenue = monthly_fee_income + interest_income + transaction_fee_income
    customer_lifetime_value = np.round(total_monthly_revenue * relationship_years * 12, 2)
    profit_margin = np.round(total_monthly_revenue * np.random.uniform(0.3, 0.6, num_customers), 2)
    
    # 11. Engagement Metrics
    digital_banking_usage_pct = np.round(np.random.uniform(20, 100, num_customers), 1)
    mobile_app_logins_monthly = np.random.randint(0, 80, num_customers)
    customer_service_calls = np.random.randint(0, 10, num_customers)
    satisfaction_score = np.round(np.random.uniform(3.0, 5.0, num_customers), 1)
    
    # 12. Growth and Trends
    account_growth_rate = np.round(np.random.uniform(-5, 25, num_customers), 2)
    spending_trend = np.random.choice(['Increasing', 'Stable', 'Decreasing'], num_customers)
    investment_potential_score = np.round(np.random.uniform(1, 10, num_customers), 1)
    
    # Create comprehensive DataFrame
    df = pd.DataFrame({
        # Basic Information (5 dimensions)
        'customer_id': customer_ids,
        'account_number': account_numbers,
        'customer_segment': customer_segments,
        'relationship_years': relationship_years,
        'age_group': age_groups,
        
        # Account Metrics (4 dimensions)
        'account_balance': np.round(account_balance, 2),
        'avg_monthly_balance': np.round(avg_monthly_balance, 2),
        'min_balance_last_year': np.round(min_balance_last_year, 2),
        'max_balance_last_year': np.round(max_balance_last_year, 2),
        
        # Credit Metrics (5 dimensions)
        'credit_limit': np.round(credit_limit, 2),
        'outstanding_debt': np.round(outstanding_debt, 2),
        'credit_score': credit_score,
        'credit_utilization_ratio': credit_utilization_ratio,
        'available_credit': np.round(available_credit, 2),
        
        # Transaction Activity (4 dimensions)
        'monthly_transactions': monthly_transactions,
        'monthly_spending': monthly_spending,
        'avg_transaction_value': avg_transaction_value,
        'largest_transaction': np.round(largest_transaction, 2),
        
        # Income and Employment (4 dimensions)
        'monthly_income': monthly_income,
        'annual_income': np.round(annual_income, 2),
        'employment_status': employment_status,
        'income_stability_score': np.round(income_stability_score, 2),
        
        # Debt Metrics (5 dimensions)
        'total_loans': total_loans,
        'mortgage_balance': np.round(mortgage_balance, 2),
        'personal_loan_balance': np.round(personal_loan_balance, 2),
        'auto_loan_balance': np.round(auto_loan_balance, 2),
        'debt_to_income_ratio': debt_to_income_ratio,
        
        # Payment Behavior (4 dimensions)
        'payment_history_score': np.round(payment_history_score, 2),
        'on_time_payments_pct': on_time_payments_pct,
        'late_payments_count': late_payments_count,
        'missed_payments_count': missed_payments_count,
        
        # Risk Assessment (3 dimensions)
        'risk_category': risk_category,
        'risk_score': risk_score,
        'default_probability': default_probability,
        
        # Product Holdings (6 dimensions)
        'num_products': num_products,
        'has_checking': has_checking,
        'has_savings': has_savings,
        'has_credit_card': has_credit_card,
        'has_investment': has_investment,
        'has_loan': has_loan,
        
        # Profitability Metrics (6 dimensions)
        'monthly_fee_income': monthly_fee_income,
        'interest_income': interest_income,
        'transaction_fee_income': transaction_fee_income,
        'total_monthly_revenue': np.round(total_monthly_revenue, 2),
        'customer_lifetime_value': customer_lifetime_value,
        'profit_margin': profit_margin,
        
        # Engagement Metrics (4 dimensions)
        'digital_banking_usage_pct': digital_banking_usage_pct,
        'mobile_app_logins_monthly': mobile_app_logins_monthly,
        'customer_service_calls': customer_service_calls,
        'satisfaction_score': satisfaction_score,
        
        # Growth and Trends (3 dimensions)
        'account_growth_rate': account_growth_rate,
        'spending_trend': spending_trend,
        'investment_potential_score': investment_potential_score
    })
    
    print(f"✅ Generated dataset with {len(df)} customers and {len(df.columns)} dimensions")
    print(f"\n📊 Dataset Summary:")
    print(f"   - Customers: {len(df)}")
    print(f"   - Dimensions: {len(df.columns)}")
    print(f"   - Total Data Points: {len(df) * len(df.columns)}")
    
    return df


def generate_analytics_report(df):
    """
    Generate comprehensive analytics report from the dataset
    """
    print("\n" + "="*80)
    print("📈 ABACO FINANCIAL INTELLIGENCE - ANALYTICS REPORT")
    print("="*80)
    
    # Customer Segment Analysis
    print("\n🎯 CUSTOMER SEGMENT DISTRIBUTION")
    print("-" * 40)
    segment_dist = df['customer_segment'].value_counts()
    for segment, count in segment_dist.items():
        pct = (count / len(df)) * 100
        print(f"  {segment:12s}: {count:3d} customers ({pct:5.1f}%)")
    
    # Financial Health Overview
    print("\n💰 FINANCIAL HEALTH OVERVIEW")
    print("-" * 40)
    print(f"  Total Portfolio Value:     ${df['account_balance'].sum():,.2f}")
    print(f"  Average Account Balance:   ${df['account_balance'].mean():,.2f}")
    print(f"  Median Account Balance:    ${df['account_balance'].median():,.2f}")
    print(f"  Average Monthly Income:    ${df['monthly_income'].mean():,.2f}")
    print(f"  Average Credit Score:      {df['credit_score'].mean():.0f}")
    
    # Risk Distribution
    print("\n⚠️  RISK DISTRIBUTION")
    print("-" * 40)
    risk_dist = df['risk_category'].value_counts()
    for risk, count in risk_dist.items():
        pct = (count / len(df)) * 100
        print(f"  {risk:12s} Risk: {count:3d} customers ({pct:5.1f}%)")
    
    # Credit Utilization
    print("\n💳 CREDIT METRICS")
    print("-" * 40)
    print(f"  Average Credit Utilization: {df['credit_utilization_ratio'].mean():.1f}%")
    print(f"  Total Credit Extended:      ${df['credit_limit'].sum():,.2f}")
    print(f"  Total Outstanding Debt:     ${df['outstanding_debt'].sum():,.2f}")
    print(f"  Average Debt-to-Income:     {df['debt_to_income_ratio'].mean():.1f}%")
    
    # Profitability Analysis
    print("\n📊 PROFITABILITY ANALYSIS")
    print("-" * 40)
    print(f"  Total Monthly Revenue:      ${df['total_monthly_revenue'].sum():,.2f}")
    print(f"  Average Revenue per Customer: ${df['total_monthly_revenue'].mean():,.2f}")
    print(f"  Total Customer Lifetime Value: ${df['customer_lifetime_value'].sum():,.2f}")
    print(f"  Average Profit Margin:      ${df['profit_margin'].mean():,.2f}")
    
    # Engagement Metrics
    print("\n📱 DIGITAL ENGAGEMENT")
    print("-" * 40)
    print(f"  Average Digital Usage:      {df['digital_banking_usage_pct'].mean():.1f}%")
    print(f"  Average Monthly App Logins: {df['mobile_app_logins_monthly'].mean():.1f}")
    print(f"  Average Satisfaction Score: {df['satisfaction_score'].mean():.1f}/5.0")
    
    # Product Penetration
    print("\n🏦 PRODUCT PENETRATION")
    print("-" * 40)
    print(f"  Checking Accounts:          {df['has_checking'].sum()} ({(df['has_checking'].sum()/len(df)*100):.1f}%)")
    print(f"  Savings Accounts:           {df['has_savings'].sum()} ({(df['has_savings'].sum()/len(df)*100):.1f}%)")
    print(f"  Credit Cards:               {df['has_credit_card'].sum()} ({(df['has_credit_card'].sum()/len(df)*100):.1f}%)")
    print(f"  Investment Products:        {df['has_investment'].sum()} ({(df['has_investment'].sum()/len(df)*100):.1f}%)")
    print(f"  Loans:                      {df['has_loan'].sum()} ({(df['has_loan'].sum()/len(df)*100):.1f}%)")
    print(f"  Average Products per Customer: {df['num_products'].mean():.1f}")
    
    print("\n" + "="*80)


def save_dataset(df, filename='abaco_comprehensive_dataset.csv'):
    """
    Save the dataset to CSV file
    """
    import os
    
    # Save to notebooks directory
    output_path = os.path.join(os.path.dirname(__file__), filename)
    df.to_csv(output_path, index=False)
    print(f"\n💾 Dataset saved to: {output_path}")
    
    # Also save summary statistics
    summary_path = output_path.replace('.csv', '_summary.txt')
    with open(summary_path, 'w') as f:
        f.write("ABACO FINANCIAL INTELLIGENCE - DATASET SUMMARY\n")
        f.write("="*80 + "\n\n")
        f.write(f"Total Customers: {len(df)}\n")
        f.write(f"Total Dimensions: {len(df.columns)}\n")
        f.write(f"Total Data Points: {len(df) * len(df.columns)}\n\n")
        f.write("Columns:\n")
        for i, col in enumerate(df.columns, 1):
            f.write(f"  {i:2d}. {col}\n")
    
    print(f"💾 Summary saved to: {summary_path}")
    
    return output_path


def main():
    """
    Main execution function
    """
    print("="*80)
    print("🚀 ABACO FINANCIAL INTELLIGENCE PLATFORM")
    print("   Comprehensive Dataset Generator")
    print("="*80)
    print()
    
    # Generate dataset
    df = build_comprehensive_abaco_dataset()
    
    # Display first few records
    print("\n📋 SAMPLE DATA (First 5 Customers)")
    print("-" * 80)
    print(df.head().to_string())
    
    # Generate analytics report
    generate_analytics_report(df)
    
    # Save dataset
    output_file = save_dataset(df)
    
    print("\n✅ ABACO Dataset Generation Complete!")
    print("="*80)
    
    return df


if __name__ == "__main__":
    df = main()
