"""
ABACO Cloud SQL Connector
Secure MySQL connection handler for Google Cloud SQL
"""

import os
import mysql.connector
from mysql.connector import Error
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CloudSQLConnector:
    """Manages secure connections to Google Cloud SQL"""

    def __init__(self):
        """Initialize with environment variables"""
        self.connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")
        self.database = os.getenv("CLOUD_SQL_DATABASE", "abaco_production")
        self.username = os.getenv("CLOUD_SQL_USERNAME", "abaco_user")
        self.password = os.getenv("CLOUD_SQL_PASSWORD")
        self.port = int(os.getenv("CLOUD_SQL_PORT", "3306"))
        self.connection = None
        self.cursor = None

    def connect(self) -> bool:
        """Establish database connection"""
        try:
            # Try Cloud SQL Proxy connection first
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

        except Error:
            # Fallback: localhost (for development)
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

            except Error as e:
                logger.error(f"❌ Connection failed: {e}")
                return False

        return False

    def disconnect(self):
        """Close connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("✅ Connection closed")

    def query(self, sql: str, params: Optional[Tuple] = None) -> List[Dict]:
        """Execute query and return results"""
        try:
            self.cursor.execute(sql, params or ())
            return self.cursor.fetchall()
        except Error as e:
            logger.error(f"❌ Query failed: {e}")
            return []

    def upload_csv(self, csv_path: str, table_name: str) -> bool:
        """Upload CSV to database table"""
        try:
            df = pd.read_csv(csv_path)
            logger.info(f"📊 Loaded {len(df)} rows from {csv_path}")

            # Prepare insert
            columns = ", ".join(df.columns)
            placeholders = ", ".join(["%s"] * len(df.columns))
            sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

            # Bulk insert
            for _, row in df.iterrows():
                self.cursor.execute(sql, tuple(row))

            self.connection.commit()
            logger.info(f"✅ Uploaded {len(df)} rows to {table_name}")
            return True

        except Exception as e:
            logger.error(f"❌ Upload failed: {e}")
            return False


def get_connection() -> Optional[CloudSQLConnector]:
    """Get configured connection"""
    from dotenv import load_dotenv

    load_dotenv(".env.local")

    connector = CloudSQLConnector()
    if connector.connect():
        return connector
    return None


if __name__ == "__main__":
    db = get_connection()
    if db:
        print("✅ Cloud SQL connector working!")
        db.disconnect()
    else:
        print("❌ Connection failed - check .env.local")
