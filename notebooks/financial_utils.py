"""
ABACO Financial Intelligence Utilities
Reusable financial analysis functions and data generators
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FinancialDataGenerator:
    """Generate realistic financial datasets for analysis"""

    def __init__(self, seed: int = 42):
        # Use modern numpy.random.Generator instead of deprecated RandomState
        self.rng = np.random.default_rng(seed)
        self.seed = seed

    def generate_customer_data(self, n_customers: int = 1000) -> pd.DataFrame:
        """Generate comprehensive customer financial data"""
        try:
            logger.info(f"Generating financial data for {n_customers:,} customers")

            # Basic customer information
            data = {
                "customer_id": [f"CUST_{i:06d}" for i in range(1, n_customers + 1)],
                "account_balance": self._generate_account_balances(n_customers),
                "credit_limit": self._generate_credit_limits(n_customers),
                "monthly_spending": self._generate_monthly_spending(n_customers),
                "credit_score": self._generate_credit_scores(n_customers),
                "account_type": self.rng.choice(
                    ["Checking", "Savings", "Credit", "Investment", "Business"],
                    n_customers,
                    p=[0.3, 0.25, 0.2, 0.15, 0.1],
                ),
                "risk_category": self._generate_risk_categories(n_customers),
                "years_with_bank": self.rng.integers(1, 25, n_customers),
                "monthly_income": self._generate_monthly_income(n_customers),
                "loan_amount": self._generate_loan_amounts(n_customers),
                "payment_history_score": self.rng.beta(8, 2, n_customers),
                "age": self.rng.integers(18, 80, n_customers),
                "employment_status": self.rng.choice(
                    ["Employed", "Self-Employed", "Unemployed", "Retired"],
                    n_customers,
                    p=[0.6, 0.2, 0.1, 0.1],
                ),
            }

            df = pd.DataFrame(data)

            # Calculate derived financial metrics
            df = self._calculate_financial_metrics(df)

            # Add timestamp
            df["created_at"] = datetime.now()
            df["last_updated"] = datetime.now()

            logger.info("✅ Customer data generated successfully")
            return df

        except Exception as e:
            logger.error(f"❌ Error generating customer data: {e}")
            raise

    def _generate_account_balances(self, n: int) -> np.ndarray:
        """Generate realistic account balances using log-normal distribution"""
        return np.round(self.rng.lognormal(mean=8, sigma=1.5, size=n), 2)

    def _generate_credit_limits(self, n: int) -> np.ndarray:
        """Generate credit limits based on income tiers"""
        limits = self.rng.uniform(1000, 50000, n)
        return np.round(limits, 2)

    def _generate_monthly_spending(self, n: int) -> np.ndarray:
        """Generate monthly spending patterns"""
        return np.round(self.rng.gamma(2, 800, n), 2)

    def _generate_credit_scores(self, n: int) -> np.ndarray:
        """Generate realistic credit score distribution"""
        scores = self.rng.choice(
            [350, 450, 550, 650, 720, 780, 820],
            n,
            p=[0.05, 0.1, 0.2, 0.3, 0.2, 0.1, 0.05],
        )
        return scores

    def _generate_risk_categories(self, n: int) -> np.ndarray:
        """Generate risk categories with realistic distribution"""
        return self.rng.choice(["Low", "Medium", "High"], n, p=[0.6, 0.3, 0.1])

    def _generate_monthly_income(self, n: int) -> np.ndarray:
        """Generate monthly income with realistic distribution"""
        return np.round(self.rng.lognormal(mean=9.5, sigma=0.8, size=n), 2)

    def _generate_loan_amounts(self, n: int) -> np.ndarray:
        """Generate loan amounts correlated with income"""
        amounts = self.rng.exponential(scale=25000, size=n)
        return np.round(np.clip(amounts, 0, 500000), 2)

    def _calculate_financial_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate derived financial metrics"""
        try:
            # Utilization ratio (spending vs credit limit)
            df["utilization_ratio"] = np.round(
                (df["monthly_spending"] / df["credit_limit"].replace(0, 1)).clip(0, 1.5), 3
            )

            # Debt-to-income ratio
            df["debt_to_income"] = np.round(
                (df["loan_amount"] / (df["monthly_income"] * 12).replace(0, 1)).clip(0, 3), 3
            )

            # Risk score calculation
            df["risk_score"] = np.round(
                (1 - df["payment_history_score"]) * 30
                + df["utilization_ratio"] * 40
                + df["debt_to_income"] * 30,
                2,
            )

            # Profit potential score
            df["profit_potential"] = np.round(
                df["monthly_spending"] * 0.02
                + df["account_balance"] * 0.001
                + df["years_with_bank"] * 10,
                2,
            )

            # Customer lifetime value estimate
            df["lifetime_value"] = np.round(
                df["profit_potential"] * df["years_with_bank"] * 12, 2
            )

            return df

        except Exception as e:
            logger.error(f"❌ Error calculating financial metrics: {e}")
            raise


class FinancialAnalyzer:
    """Advanced financial analysis functions"""

    @staticmethod
    def calculate_portfolio_metrics(df: pd.DataFrame) -> Dict:
        """Calculate comprehensive portfolio metrics"""
        try:
            metrics = {
                "total_customers": len(df),
                "total_assets": float(df["account_balance"].sum()),
                "average_balance": float(df["account_balance"].mean()),
                "median_balance": float(df["account_balance"].median()),
                "total_credit_exposure": float(df["credit_limit"].sum()),
                "total_outstanding_loans": float(df["loan_amount"].sum()),
                "average_credit_score": float(df["credit_score"].mean()),
                "high_risk_customers": int(len(df[df["risk_category"] == "High"])),
                "average_utilization": float(df["utilization_ratio"].mean()),
                "total_lifetime_value": float(df["lifetime_value"].sum()),
            }
            return metrics

        except Exception as e:
            logger.error(f"❌ Error calculating portfolio metrics: {e}")
            return {}

    @staticmethod
    def risk_analysis(df: pd.DataFrame) -> Dict:
        """Perform comprehensive risk analysis"""
        risk_metrics = {}

        # Risk distribution
        risk_dist = df["risk_category"].value_counts(normalize=True)
        risk_metrics["risk_distribution"] = risk_dist.to_dict()

        # High-risk indicators
        high_utilization = len(df[df["utilization_ratio"] > 0.8])
        high_debt_income = len(df[df["debt_to_income"] > 0.4])
        low_credit_score = len(df[df["credit_score"] < 600])

        risk_metrics["high_risk_indicators"] = {
            "high_utilization_count": high_utilization,
            "high_debt_income_count": high_debt_income,
            "low_credit_score_count": low_credit_score,
        }

        # Risk score statistics
        risk_metrics["risk_score_stats"] = {
            "mean": df["risk_score"].mean(),
            "median": df["risk_score"].median(),
            "std": df["risk_score"].std(),
            "min": df["risk_score"].min(),
            "max": df["risk_score"].max(),
        }

        return risk_metrics

    @staticmethod
    def profitability_analysis(df: pd.DataFrame) -> Dict:
        """Analyze customer profitability"""
        profit_metrics = {
            "total_profit_potential": df["profit_potential"].sum(),
            "average_profit_per_customer": df["profit_potential"].mean(),
            "top_10_percent_customers": df.nlargest(
                int(len(df) * 0.1), "lifetime_value"
            )["lifetime_value"].sum(),
            "profit_by_account_type": df.groupby("account_type")["profit_potential"]
            .sum()
            .to_dict(),
            "profit_by_risk_category": df.groupby("risk_category")["profit_potential"]
            .sum()
            .to_dict(),
        }
        return profit_metrics


def export_analysis_results(df: pd.DataFrame, metrics: Dict, filename: str) -> str:
    """Export analysis results to files"""
    try:
        from abaco_config import EXPORTS_DIR

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Export main dataset
        csv_path = EXPORTS_DIR / f"{filename}_{timestamp}.csv"
        df.to_csv(csv_path, index=False)

        # Export metrics summary
        metrics_path = EXPORTS_DIR / f"{filename}_metrics_{timestamp}.json"
        import json

        with open(metrics_path, "w") as f:
            json.dump(metrics, f, indent=2, default=str)

        logger.info(f"✅ Analysis results exported to {EXPORTS_DIR}")
        return str(csv_path)

    except Exception as e:
        logger.error(f"❌ Error exporting analysis results: {e}")
        raise


if __name__ == "__main__":
    # Example usage
    try:
        generator = FinancialDataGenerator()
        data = generator.generate_customer_data(500)

        analyzer = FinancialAnalyzer()
        portfolio_metrics = analyzer.calculate_portfolio_metrics(data)
        risk_metrics = analyzer.risk_analysis(data)

        print("📊 Sample Analysis Results:")
        print(f"Total Customers: {portfolio_metrics['total_customers']:,}")
        print(f"Total Assets: ${portfolio_metrics['total_assets']:,.2f}")
        print(f"Average Credit Score: {portfolio_metrics['average_credit_score']:.0f}")

    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        raise
