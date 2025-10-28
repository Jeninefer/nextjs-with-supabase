# KPI Export Channel

Executive scorecards are emitted to this directory.  The pipeline materializes a
single `kpi_snapshot.parquet` file per refresh along with derived JSON payloads
used by the internal API.

The `json/` sub-directory is reserved for schema-validated JSON structures that
mirror the production API responses.  Each payload corresponds to a dashboard
widget identifier.
