# KPI JSON Payloads

Each file in this folder contains the serialized response body served by the
`/api/kpi/<widget>` endpoints.  Keys are snake_case and follow the schema stored
in `supabase/migrations/20240930094513_create_kpi_payloads.sql`.

Files must use the naming convention `<widget>_v<version>.json`.
