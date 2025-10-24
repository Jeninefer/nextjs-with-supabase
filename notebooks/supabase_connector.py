"""
ABACO Supabase Connector
Secure connection handler for Supabase (PostgreSQL) - Free Tier Available
"""

import os
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Any
import logging

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SupabaseConnector:
    """Manages secure connections to Supabase (Free PostgreSQL database)"""

    def __init__(self):
        """
        Initializes the connector using environment variables.

        Requires:
            NEXT_PUBLIC_SUPABASE_URL: The Supabase project URL.
            NEXT_PUBLIC_SUPABASE_ANON_KEY: The Supabase anonymous API key.
        """
        self.url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.client: Optional[Client] = None
        
        if not SUPABASE_AVAILABLE:
            logger.warning(
                "⚠️  Supabase library not installed. "
                "Install with: pip install supabase"
            )

    def connect(self) -> bool:
        """Establish Supabase connection"""
        if not SUPABASE_AVAILABLE:
            logger.error("❌ Supabase library not available")
            return False
            
        if not self.url or not self.key:
            logger.error(
                "❌ Supabase credentials missing. "
                "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
            )
            return False

        try:
            self.client = create_client(self.url, self.key)
            logger.info("✅ Connected to Supabase")
            return True
            
        except Exception as e:
            logger.error(f"❌ Connection failed: {e}")
            return False

    def disconnect(self):
        """Close connection (Supabase handles connections automatically)"""
        self.client = None
        logger.info("✅ Connection closed")

    def query(self, table: str, select: str = "*", 
              filters: Optional[Dict[str, Any]] = None, 
              limit: Optional[int] = None) -> List[Dict]:
        """
        Execute query and return results
        
        Args:
            table: Table name to query
            select: Columns to select (default: "*")
            filters: Dictionary of filters {column: value}
            limit: Maximum number of rows to return
            
        Returns:
            List of dictionaries containing the results
        """
        if not self.client:
            logger.error("❌ Not connected. Call connect() first")
            return []

        try:
            query = self.client.table(table).select(select)
            
            # Apply filters
            if filters:
                for column, value in filters.items():
                    query = query.eq(column, value)
            
            # Apply limit
            if limit:
                query = query.limit(limit)
                
            response = query.execute()
            return response.data
            
        except Exception as e:
            logger.error(f"❌ Query failed: {e}")
            return []

    def insert(self, table: str, data: Dict[str, Any]) -> bool:
        """
        Insert a single row
        
        Args:
            table: Table name
            data: Dictionary of column: value pairs
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.error("❌ Not connected. Call connect() first")
            return False

        try:
            response = self.client.table(table).insert(data).execute()
            logger.info(f"✅ Inserted 1 row into {table}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Insert failed: {e}")
            return False

    def insert_many(self, table: str, data: List[Dict[str, Any]]) -> bool:
        """
        Insert multiple rows
        
        Args:
            table: Table name
            data: List of dictionaries (each dict is one row)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.error("❌ Not connected. Call connect() first")
            return False

        try:
            response = self.client.table(table).insert(data).execute()
            logger.info(f"✅ Inserted {len(data)} rows into {table}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Bulk insert failed: {e}")
            return False

    def upload_csv(self, csv_path: str, table_name: str, 
                   chunk_size: int = 1000) -> bool:
        """
        Upload CSV to Supabase table in chunks
        
        Args:
            csv_path: Path to CSV file
            table_name: Target table name
            chunk_size: Number of rows per batch insert
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.error("❌ Not connected. Call connect() first")
            return False

        try:
            df = pd.read_csv(csv_path)
            logger.info(f"📊 Loaded {len(df)} rows from {csv_path}")

            # Convert DataFrame to list of dictionaries
            records = df.to_dict('records')
            
            # Upload in chunks
            total_rows = len(records)
            for i in range(0, total_rows, chunk_size):
                chunk = records[i:i + chunk_size]
                self.client.table(table_name).insert(chunk).execute()
                logger.info(
                    f"✅ Uploaded {min(i + chunk_size, total_rows)}/{total_rows} rows"
                )
            
            logger.info(f"✅ Successfully uploaded all {total_rows} rows to {table_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Upload failed: {e}")
            return False

    def update(self, table: str, data: Dict[str, Any], 
               filters: Dict[str, Any]) -> bool:
        """
        Update rows matching filters
        
        Args:
            table: Table name
            data: Dictionary of columns to update
            filters: Dictionary of filters {column: value}
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.error("❌ Not connected. Call connect() first")
            return False

        try:
            query = self.client.table(table).update(data)
            
            # Apply filters
            for column, value in filters.items():
                query = query.eq(column, value)
                
            response = query.execute()
            logger.info(f"✅ Updated rows in {table}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Update failed: {e}")
            return False

    def delete(self, table: str, filters: Dict[str, Any]) -> bool:
        """
        Delete rows matching filters
        
        Args:
            table: Table name
            filters: Dictionary of filters {column: value}
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.error("❌ Not connected. Call connect() first")
            return False

        try:
            query = self.client.table(table).delete()
            
            # Apply filters
            for column, value in filters.items():
                query = query.eq(column, value)
                
            response = query.execute()
            logger.info(f"✅ Deleted rows from {table}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Delete failed: {e}")
            return False


def get_connection() -> Optional[SupabaseConnector]:
    """Get configured Supabase connection"""
    from dotenv import load_dotenv

    # Try loading from .env.local first, then .env
    load_dotenv(".env.local")
    load_dotenv(".env")

    connector = SupabaseConnector()
    if connector.connect():
        return connector
    return None


if __name__ == "__main__":
    # Test connection
    db = get_connection()
    if db:
        print("✅ Supabase connector working!")
        
        # Example query
        # results = db.query("customers", limit=5)
        # print(f"Sample data: {results}")
        
        db.disconnect()
    else:
        print("❌ Connection failed - check your environment variables:")
        print("  - NEXT_PUBLIC_SUPABASE_URL")
        print("  - NEXT_PUBLIC_SUPABASE_ANON_KEY")
        print("\nThese should be set in .env.local or .env file")
