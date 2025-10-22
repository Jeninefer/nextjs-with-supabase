"""
ABACO Cloud SQL Connector
Secure MySQL connection via Google Cloud SQL Proxy
"""

import mysql.connector
from mysql.connector import Error
import pandas as pd
import os
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CloudSQLConnector:
    """Manages secure connections to Google Cloud SQL"""

    def __init__(self):
        """Initialize connector with credentials from environment"""
        self.connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")
        self.database = os.getenv("CLOUD_SQL_DATABASE", "abaco_production")
        self.username = os.getenv("CLOUD_SQL_USERNAME", "abaco_user")
        self.password = os.getenv("CLOUD_SQL_PASSWORD")
        self.port = int(os.getenv("CLOUD_SQL_PORT", "3306"))

        self.connection = None
        self.cursor = None

    def connect(self) -> bool:
        """
        Establish connection to Cloud SQL

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Cloud SQL Proxy connection
            self.connection = mysql.connector.connect(
                unix_socket=f"/cloudsql/{self.connection_name}",
                user=self.username,
                password=self.password,
                database=self.database,
            )

            if self.connection.is_connected():
                self.cursor = self.connection.cursor(dictionary=True)
                logger.info(f"✅ Connected to Cloud SQL: {self.database}")
                return True

        except Error as e:
            logger.error(f"❌ Cloud SQL connection failed: {e}")

            # Fallback: Try localhost (for local development)
            try:
                self.connection = mysql.connector.connect(
                    host="127.0.0.1",
                    port=self.port,
                    user=self.username,
                    password=self.password,
                    database=self.database,
                )

                if self.connection.is_connected():
                    self.cursor = self.connection.cursor(dictionary=True)
                    logger.info(f"✅ Connected to local MySQL: {self.database}")
                    return True

            except Error as local_error:
                logger.error(f"❌ Local MySQL connection failed: {local_error}")
                return False

        return False

    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("✅ Database connection closed")

    def create_schema(self) -> bool:
        """
        Create ABACO database schema

        Returns:
            bool: True if successful
        """
        try:
            # Customers table
            self.cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS abaco_customers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    customer_id VARCHAR(50) NOT NULL UNIQUE,
                    account_balance DECIMAL(12,2),
                    credit_limit DECIMAL(12,2),
                    monthly_spending DECIMAL(12,2),
                    credit_score INT,
                    account_type VARCHAR(50),
                    risk_category VARCHAR(20),
                    years_with_bank INT,
                    monthly_income DECIMAL(12,2),
                    loan_amount DECIMAL(12,2),
                    payment_history_score DECIMAL(5,2),
                    utilization_ratio DECIMAL(5,4),
                    debt_to_income DECIMAL(5,3),
                    risk_score DECIMAL(8,2),
                    profit_margin DECIMAL(8,2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_customer_id (customer_id),
                    INDEX idx_risk_category (risk_category),
                    INDEX idx_credit_score (credit_score)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            )

            # Loan tape table
            self.cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS abaco_loan_tape (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    loan_id VARCHAR(50) NOT NULL,
                    customer_id VARCHAR(50),
                    disbursement_date DATE,
                    disbursement_amount DECIMAL(12,2),
                    outstanding_balance DECIMAL(12,2),
                    interest_rate DECIMAL(5,4),
                    term_months INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_loan_id (loan_id),
                    INDEX idx_customer_id (customer_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            )

            # Payment history table
            self.cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS abaco_payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    loan_id VARCHAR(50) NOT NULL,
                    payment_date DATE,
                    payment_amount DECIMAL(12,2),
                    principal_paid DECIMAL(12,2),
                    interest_paid DECIMAL(12,2),
                    remaining_balance DECIMAL(12,2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_loan_id (loan_id),
                    INDEX idx_payment_date (payment_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            )

            # Analytics cache table
            self.cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS abaco_analytics (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value JSON,
                    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_metric_name (metric_name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            )

            self.connection.commit()
            logger.info("✅ Database schema created successfully")
            return True

        except Error as e:
            logger.error(f"❌ Schema creation failed: {e}")
            return False

    def upload_csv(self, csv_path: str, table_name: str) -> bool:
        """
        Upload CSV data to Cloud SQL table

        Args:
            csv_path: Path to CSV file
            table_name: Target table name

        Returns:
            bool: True if successful
        """
        try:
            # Read CSV
            df = pd.read_csv(csv_path)
            logger.info(f"📊 Loaded {len(df)} rows from {csv_path}")

            # Whitelist of allowed tables and their columns
            allowed_tables = {
                "abaco_customers": {
                    "customer_id",
                    "account_balance",
                    "credit_score",
                    "risk_category",
                    "credit_limit",
                    "monthly_spending",
                    "loan_amount",
                    "loan_status",
                    "last_payment_date",
                    "account_open_date",
                    "customer_name",
                    "email",
                    "phone_number",
                    "address",
                    "city",
                    "state",
                    "zip_code",
                    "country"
                },
                # Add other allowed tables and their columns here as needed
            }

            # Validate table name
            if table_name not in allowed_tables:
                raise ValueError(f"Table '{table_name}' is not allowed.")

            # Validate columns
            allowed_cols = allowed_tables[table_name]
            for col in df.columns:
                if col not in allowed_cols:
                    raise ValueError(f"Column '{col}' is not allowed in table '{table_name}'.")

            # Validate required columns exist (if needed)
            if table_name == "abaco_customers":
                required_cols = ["customer_id", "account_balance", "credit_score"]
                if not all(col in df.columns for col in required_cols):
                    raise ValueError(f"Missing required columns: {required_cols}")

            # Helper to safely escape MySQL identifiers
            def escape_identifier(identifier: str) -> str:
                # Only allow identifiers that are in the whitelist (already checked above)
                # Escape backticks by doubling them
                return f"`{identifier.replace('`', '``')}`"

            # Prepare INSERT statement with MySQL 8.0.20+ compatible syntax
            columns = ", ".join([escape_identifier(col) for col in df.columns])
            placeholders = ", ".join(["%s"] * len(df.columns))
            # Use new syntax instead of deprecated VALUES() function
            update_cols = [col for col in df.columns if col != 'customer_id']
            update_clause = ', '.join([f'{escape_identifier(col)}=NEW.{escape_identifier(col)}' for col in update_cols]) if update_cols else ''
            
            if update_clause:
                insert_query = f"""
                    INSERT INTO {escape_identifier(table_name)} ({columns})
                    VALUES ({placeholders}) AS NEW
                    ON DUPLICATE KEY UPDATE {update_clause}
                """
            else:
                insert_query = f"""
                    INSERT INTO {escape_identifier(table_name)} ({columns})
                    VALUES ({placeholders})
                """

            # Bulk insert
            rows_inserted = 0
            for _, row in df.iterrows():
                try:
                    self.cursor.execute(insert_query, tuple(row))
                    rows_inserted += 1
                except Error as row_error:
                    logger.warning(f"⚠️  Row insert failed: {row_error}")

            self.connection.commit()
            logger.info(f"✅ Uploaded {rows_inserted}/{len(df)} rows to {table_name}")
            return True

        except Exception as e:
            logger.error(f"❌ CSV upload failed: {e}")
            return False

    def query(self, sql: str, params: Optional[Tuple] = None) -> List[Dict]:
        """
        Execute SQL query and return results

        Args:
            sql: SQL query string
            params: Query parameters (optional)

        Returns:
            List of dictionaries (rows)
        """
        try:
            self.cursor.execute(sql, params or ())
            results = self.cursor.fetchall()
            return results
        except Error as e:
            logger.error(f"❌ Query failed: {e}")
            return []

    def get_portfolio_metrics(self) -> Dict:
        """
        Calculate portfolio-level metrics

        Returns:
            Dictionary of metrics
        """
        metrics = {}

        try:
            # Total customers
            self.cursor.execute("SELECT COUNT(*) as total FROM abaco_customers")
            metrics["total_customers"] = self.cursor.fetchone()["total"]

            # Portfolio value
            self.cursor.execute("SELECT SUM(account_balance) as total FROM abaco_customers")
            metrics["total_portfolio"] = self.cursor.fetchone()["total"]

            # Average credit score
            self.cursor.execute("SELECT AVG(credit_score) as avg_score FROM abaco_customers")
            metrics["avg_credit_score"] = self.cursor.fetchone()["avg_score"]

            # Risk distribution
            self.cursor.execute(
                """
                SELECT risk_category, COUNT(*) as count
                FROM abaco_customers
                GROUP BY risk_category
            """
            )
            metrics["risk_distribution"] = {
                row["risk_category"]: row["count"] for row in self.cursor.fetchall()
            }

            logger.info(f"📊 Portfolio metrics calculated: {metrics}")
            return metrics

        except Error as e:
            logger.error(f"❌ Metrics calculation failed: {e}")
            return {}


# Convenience function for quick connections
def get_connection() -> Optional[CloudSQLConnector]:
    """
    Get configured CloudSQLConnector instance

    Returns:
        CloudSQLConnector if successful, None otherwise
    """
    connector = CloudSQLConnector()
    if connector.connect():
        return connector
    return None


# Example usage
if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv

    load_dotenv(".env.local")

    # Connect
    db = get_connection()

    if db:
        # Create schema
        db.create_schema()

        # Upload data (if CSV exists)
        csv_path = Path(__file__).parent / "financial_analysis_results.csv"
        if Path(csv_path).exists():
            db.upload_csv(csv_path, "abaco_customers")

        # Get metrics
        metrics = db.get_portfolio_metrics()
        print(f"\n📊 Portfolio Metrics:")
        print(f"Total Customers: {metrics.get('total_customers', 0):,}")
        print(f"Total Portfolio: ${metrics.get('total_portfolio', 0):,.2f}")
        # print(f"Avg Credit Score: {metrics.get('avg_credit_score', 0):.1f}")  # REMOVED: do not log sensitive credit score info
        print(f"Risk Distribution: {metrics.get('risk_distribution', {})}")

        # Disconnect
        db.disconnect()
    else:
        print("❌ Failed to connect to Cloud SQL")
