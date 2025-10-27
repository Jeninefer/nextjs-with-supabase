# Analytics Export Channel

The analytics channel stores parquet feature sets that feed the forecasting and
recommendation models.  Every dataset is derived from `analytics.feature_views`
in Supabase and is partitioned by processing date.  Downstream services consume
only the most recent partition.

Expected files:
- `*_features.parquet`
- `*_feature_importance.json`

### Data quality
Each refresh is validated for schema drift, null explosion, and row count deltas
before the artifact replaces the existing files.
