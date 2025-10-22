"""
ABACO - Google Cloud SQL for MySQL Connector
Integrates ABACO loan analysis with Cloud SQL database
"""

import os  # ← ADD THIS LINE
import mysql.connector
from mysql.connector import Error
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CloudSQLConnector:
    """Google Cloud SQL for MySQL connector for ABACO platform"""

    def __init__(
        self,
        instance_connection_name: str,
        database: str,
        username: str,
        password: str,
        host: str = "127.0.0.1",
        port: int = 3306,
    ):
        """
        Initialize Cloud SQL connector

        Args:
            instance_connection_name: Format: project:region:instance
            database: Database name
            username: Database username
            password: Database password
            host: Database host (use 127.0.0.1 when using Cloud SQL Proxy)
            port: Database port
        """
        self.instance_connection_name = instance_connection_name
        self.database = database
        self.username = username
        self.password = password
        self.host = host
        self.port = port
        self.connection = None

    def connect(self) -> bool:
        """
        Establish connection to Cloud SQL

        Returns:
            True if successful, False otherwise
        """
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.username,
                password=self.password,
                autocommit=False,
            )

            if self.connection.is_connected():
                db_info = self.connection.get_server_info()
                logger.info(f"✅ Connected to MySQL Server version {db_info}")
                logger.info(f"✅ Database: {self.database}")
                return True

        except Error as e:
            logger.error(f"❌ Error connecting to MySQL: {e}")
            return False

    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("✅ MySQL connection closed")

    def execute_query(self, query: str, params: tuple = None) -> Optional[pd.DataFrame]:
        """
        Execute SELECT query and return results as DataFrame

        Args:
            query: SQL query string
            params: Query parameters (optional)

        Returns:
            DataFrame with results or None if error
        """
        try:
            df = pd.read_sql(query, self.connection, params=params)
            logger.info(f"✅ Query executed: {len(df)} rows returned")
            return df

        except Error as e:
            logger.error(f"❌ Query error: {e}")
            return None

    def execute_update(self, query: str, params: tuple = None) -> bool:
        """
        Execute INSERT/UPDATE/DELETE query

        Args:
            query: SQL query string
            params: Query parameters (optional)

        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            self.connection.commit()
            logger.info(f"✅ Update executed: {cursor.rowcount} rows affected")
            cursor.close()
            return True

        except Error as e:
            logger.error(f"❌ Update error: {e}")
            self.connection.rollback()
            return False

    def create_abaco_tables(self) -> bool:
        """
        Create ABACO database schema in Cloud SQL

        Returns:
            True if successful, False otherwise
        """
        schema_sql = """
        -- ABACO Loan Data Table
        CREATE TABLE IF NOT EXISTS loan_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            loan_id VARCHAR(50) NOT NULL UNIQUE,
            customer_id VARCHAR(50) NOT NULL,
            disbursement_amount DECIMAL(15,2),
            disbursement_date DATE,
            maturity_date DATE,
            interest_rate DECIMAL(5,4),
            product_code VARCHAR(10),
            status VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_loan_id (loan_id),
            INDEX idx_customer_id (customer_id),
            INDEX idx_disbursement_date (disbursement_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        -- ABACO Payment History Table
        CREATE TABLE IF NOT EXISTS payment_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            loan_id VARCHAR(50) NOT NULL,
            payment_date DATE NOT NULL,
            principal_payment DECIMAL(15,2),
            interest_payment DECIMAL(15,2),
            total_payment DECIMAL(15,2),
            outstanding_balance DECIMAL(15,2),
            days_past_due INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_loan_id (loan_id),
            INDEX idx_payment_date (payment_date),
            FOREIGN KEY (loan_id) REFERENCES loan_data(loan_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        -- ABACO Customer Analytics Table
        CREATE TABLE IF NOT EXISTS customer_analytics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id VARCHAR(50) NOT NULL UNIQUE,
            total_loans INT DEFAULT 0,
            total_disbursed DECIMAL(15,2),
            total_paid DECIMAL(15,2),
            current_outstanding DECIMAL(15,2),
            avg_dpd DECIMAL(5,2),
            risk_category VARCHAR(20),
            credit_score INT,
            last_payment_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_customer_id (customer_id),
            INDEX idx_risk_category (risk_category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        -- ABACO Monthly Metrics Table
        CREATE TABLE IF NOT EXISTS monthly_metrics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            month_end DATE NOT NULL UNIQUE,
            total_disbursements DECIMAL(15,2),
            total_collections DECIMAL(15,2),
            portfolio_outstanding DECIMAL(15,2),
            active_loans INT,
            new_loans INT,
            closed_loans INT,
            avg_ticket_size DECIMAL(15,2),
            portfolio_at_risk DECIMAL(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_month_end (month_end)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """

        try:
            cursor = self.connection.cursor()

            # Execute each CREATE TABLE statement
            for statement in schema_sql.split(";"):
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)

            self.connection.commit()
            cursor.close()
            logger.info("✅ ABACO tables created successfully")
            return True

        except Error as e:
            logger.error(f"❌ Schema creation error: {e}")
            self.connection.rollback()
            return False

    def upload_loan_data(self, df: pd.DataFrame) -> bool:
        """
        Upload loan data from DataFrame to Cloud SQL

        Args:
            df: DataFrame with loan data

        Returns:
            True if successful, False otherwise
        """
        try:
            # Map DataFrame columns to database columns
            column_mapping = {
                "Loan ID": "loan_id",
                "customer_id": "customer_id",
                "Disbursement Amount": "disbursement_amount",
                "Disbursement Date": "disbursement_date",
                "product_code": "product_code",
                "status": "status",
            }

            # Prepare data
            df_upload = df.copy()
            df_upload = df_upload.rename(columns=column_mapping)

            # Required columns
            required_cols = ["loan_id", "customer_id", "disbursement_amount", "disbursement_date"]

            # Upload to database
            cursor = self.connection.cursor()

            for _, row in df_upload.iterrows():
                query = """
                INSERT INTO loan_data 
                (loan_id, customer_id, disbursement_amount, disbursement_date, product_code, status)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                disbursement_amount = VALUES(disbursement_amount),
                disbursement_date = VALUES(disbursement_date),
                product_code = VALUES(product_code),
                status = VALUES(status)
                """

                params = (
                    row.get("loan_id"),
                    row.get("customer_id"),
                    row.get("disbursement_amount"),
                    row.get("disbursement_date"),
                    row.get("product_code", "UNKNOWN"),
                    row.get("status", "ACTIVE"),
                )

                cursor.execute(query, params)

            self.connection.commit()
            cursor.close()
            logger.info(f"✅ Uploaded {len(df_upload)} loan records")
            return True

        except Error as e:
            logger.error(f"❌ Upload error: {e}")
            self.connection.rollback()
            return False

    def get_portfolio_summary(self) -> Optional[Dict[str, Any]]:
        """
        Get portfolio summary metrics

        Returns:
            Dictionary with summary metrics or None if error
        """
        query = """
        SELECT 
            COUNT(DISTINCT loan_id) as total_loans,
            COUNT(DISTINCT customer_id) as total_customers,
            SUM(disbursement_amount) as total_disbursed,
            AVG(disbursement_amount) as avg_loan_size,
            MIN(disbursement_date) as first_loan_date,
            MAX(disbursement_date) as last_loan_date
        FROM loan_data
        WHERE status = 'ACTIVE'
        """

        df = self.execute_query(query)

        if df is not None and len(df) > 0:
            return df.iloc[0].to_dict()
        return None


def main():
    """Test Cloud SQL connection"""

    # Load configuration from environment variables
    instance_connection_name = os.getenv(
        "CLOUD_SQL_CONNECTION_NAME", "your-project:your-region:your-instance"
    )
    database = os.getenv("CLOUD_SQL_DATABASE", "abaco_production")
    username = os.getenv("CLOUD_SQL_USERNAME", "abaco_user")
    password = os.getenv("CLOUD_SQL_PASSWORD", "")

    if not password:
        logger.error("❌ CLOUD_SQL_PASSWORD not set in environment variables")
        return

    # Create connector
    connector = CloudSQLConnector(
        instance_connection_name=instance_connection_name,
        database=database,
        username=username,
        password=password,
    )

    # Test connection
    if connector.connect():
        logger.info("✅ Connection successful!")

        # Create tables
        if connector.create_abaco_tables():
            logger.info("✅ Schema created!")

        # Get summary
        summary = connector.get_portfolio_summary()
        if summary:
            logger.info("📊 Portfolio Summary:")
            for key, value in summary.items():
                logger.info(f"   {key}: {value}")

        # Disconnect
        connector.disconnect()
    else:
        logger.error("❌ Connection failed!")


if __name__ == "__main__":
    main()
