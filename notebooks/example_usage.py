"""Example: Using CloudSQLConnector in ABACO analysis"""

from cloudsql_connector import get_connection
import pandas as pd

# Connect to database
db = get_connection()

if db:
    # Query customers by risk
    high_risk = db.query(
        """
        SELECT customer_id, account_balance, credit_score
        FROM abaco_customers
        WHERE risk_category = 'High'
        ORDER BY risk_score DESC
        LIMIT 10
    """
    )

    # Convert to DataFrame
    df = pd.DataFrame(high_risk)
    print(df)

    # Get portfolio metrics
    metrics = db.get_portfolio_metrics()
    print(metrics)

    # Close connection
    db.disconnect()
