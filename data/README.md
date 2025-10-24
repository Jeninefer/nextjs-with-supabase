# Financial Intelligence Data Directory

## Structure
- `logs/` - Application and tracing logs
- `production_kpis_*.json` - KPI calculation results
- `executive_report_*.md` - Executive summaries
- `cosmos_payload_*.json` - Azure Cosmos DB payloads

## Security Guidelines
- Never commit sensitive financial data
- Use environment variables for credentials
- Follow data retention policies
- Enable audit logging for compliance

## Azure Cosmos DB Integration
This platform uses hierarchical partition keys for optimal performance:
- Structure: `{tenantId}/{customerSegment}/{analysisDate}`
- Benefits: Overcomes 20GB partition limits, enables targeted queries
- Example: `abaco_financial/ENTERPRISE/2024-10-24`
