# ABACO Financial Intelligence - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Environment Setup

```python
# Run the notebook cells in order
# Cell 1: Environment & Logging initialized automatically
session_id = str(uuid.uuid4())[:8]
logger = StructuredLogger(session_id)
print(f"Session: {session_id}")
```

### 2. Load Your Data

Place CSV/XLSX files in `/workspaces/nextjs-with-supabase/data/`

```python
# Automatically loaded and normalized
for source_name in data_sources.keys():
    print(f"Loaded: {source_name}")
```

**Expected columns:**
- `balance` - Account balance
- `creditlimit` - Credit limit  
- `dayspastdue` - Days past due
- `customersegment` - Customer segment
- `region` - Geographic region
- `industry` - Industry classification

### 3. Run Analytics

**Option A: Basic KPI Analysis**
```python
kpi_engine = ComprehensiveKPIEngine(df, logger)
result = kpi_engine.calculate_all_kpis()
print(result["kpis"]["portfolio_overview"])
```

**Option B: Advanced Analysis with Alerts**
```python
alert_system = HybridAlertSystem(logger, AI_AVAILABLE)
alerts_df = alert_system.detect_alerts(df, result["kpis"])
print(alerts_df[["variable", "severity", "remediation_suggested"]])
```

**Option C: Growth Projections**
```python
model = AdvancedGrowthModel(df, logger)
projections = model.project_with_scenarios(target_growth_rate=15.0)
print(projections["scenarios"]["baseline"]["final_aum"])
```

**Option D: Multi-Agent Analysis**
```python
if AGENTS_AVAILABLE:
    orchestrator = AgentOrchestrator()
    orchestrator.setup_core_agents()
    # Agents handle data extraction and analysis coordination
```

---

## 📊 Key Metrics Explained

### Portfolio Overview
```
total_aum              - Total Assets Under Management
active_customers       - Number of active customers
total_credit_lines     - Sum of all credit limits
portfolio_utilization  - Avg balance / avg credit limit
```

### Risk Metrics
```
default_rate_90plus    - % of customers with 90+ DPD (target: <5%)
avg_days_past_due      - Average DPD across portfolio
delinquent_aum         - Total balance for DPD > 0
```

### Growth Projections
```
Conservative Scenario  - 50% of target growth (safe case)
Baseline Scenario      - 100% of target growth (expected)
Aggressive Scenario    - 150% of target growth (optimistic)
Monte Carlo P50        - Median outcome from 1000 simulations
```

---

## ⚠️ Alert Severity Levels

| Level | Color | Threshold | Action |
|-------|-------|-----------|--------|
| **INFO** | Blue | Normal range | Monitor |
| **WARNING** | Yellow | 50-80% of critical | Review & plan |
| **CRITICAL** | Red | ≥80% of threshold | Immediate action |

**Example Alert:**
```
[CRITICAL] default_rate_90plus: 10.5%
  Threshold: 10%
  Probability: 1.0
  Remediation: Review high-risk customer segments; increase collection efforts
```

---

## 📈 Growth Model Outputs

### Scenarios (24-month projection)
```
Conservative (7.5% growth)  → 50% success probability
Baseline (15% growth)       → 80% success probability  
Aggressive (22.5% growth)   → 20% success probability
```

### Monte Carlo Percentiles
```
P5   (5th percentile)   - Worst 5% of outcomes
P25  (25th percentile)  - Cautious projection
P50  (Median)           - Most likely outcome
P75  (75th percentile)  - Optimistic projection
P95  (95th percentile)  - Best 5% of outcomes
```

---

## 🔧 Customization

### Change Alert Thresholds

```python
alert_system.thresholds["default_rate_90plus"] = {
    "warning": 0.03,      # 3% instead of 5%
    "critical": 0.07      # 7% instead of 10%
}
```

### Adjust Growth Targets

```python
target_growth_rate = 25.0  # 25% instead of 15%
projections = model.project_with_scenarios(target_growth_rate)
```

### Modify Stress Test Multipliers

```python
stress_scenarios = {
    "dpd_increase_25pct": 1.25,    # Light stress
    "dpd_increase_50pct": 1.50,    # Moderate stress
    "dpd_increase_100pct": 2.00    # Severe stress
}
```

---

## 📤 Exporting Results

### Export KPIs to JSON
```python
export_engine = ExportEngine(logger)
figma_export = export_engine.create_figma_export(kpis, audit_report)
export_engine.export_to_json(figma_export, "figma_export.json")
```

### Export to CSV
```python
alerts_df.to_csv("/path/to/alerts.csv", index=False)
```

### View Session Logs
```python
summary = logger.get_summary()
print(f"Total operations: {summary['total_logs']}")
print(f"Errors: {len(summary['errors'])}")
```

---

## 🐛 Debugging Tips

### Enable Verbose Logging
```python
logger.log("DEBUG", "operation", "start", 
          message="Detailed operation info",
          metadata={"data_shape": df.shape})
```

### Check Data Quality
```python
audit = DataQualityAudit(data_sources, logger)
report = audit.run_audit()
print(f"Quality Score: {report['overall_score']:.1f}/100")
```

### Trace Agent Execution
```python
if AGENTS_AVAILABLE:
    summary = orchestrator.get_execution_summary()
    print(json.dumps(summary, indent=2))
```

---

## ✅ Typical Workflow

```
1. Load Data
   └─ Auto-normalize columns
   └─ Convert currency/formats
   └─ Validate quality

2. Calculate KPIs
   └─ Portfolio metrics
   └─ Risk analysis
   └─ Segment breakdown

3. Detect Alerts
   └─ Rule-based thresholds
   └─ Anomaly detection
   └─ AI classification

4. Project Growth
   └─ Scenario analysis
   └─ ARIMA forecasting
   └─ Monte Carlo simulation

5. Export Results
   └─ JSON for Figma
   └─ CSV for analysis
   └─ Logs for audit trail
```

---

## 📚 Common Questions

**Q: How often should I run this analysis?**  
A: Weekly for operational dashboards, monthly for strategic planning

**Q: Can I use this with real-time data?**  
A: Yes, notebooks can be scheduled with data refresh triggers

**Q: What if I don't have all columns?**  
A: System gracefully skips analyses requiring missing columns

**Q: How accurate are the forecasts?**  
A: ARIMA adds statistical rigor; Monte Carlo quantifies uncertainty

**Q: Can I customize the AI insights?**  
A: Yes, modify prompts in `_build_insights_prompt()` method

---

## 🎯 Next Steps

1. **Load Sample Data**: Place test file in `/data/`
2. **Run Cell 1-3**: Foundation setup
3. **Run Cell 10-13**: Advanced features
4. **Review Outputs**: Check alerts and projections
5. **Customize**: Adjust thresholds for your needs

---

## 📞 Support

- **Logs**: Check JSON output in cell console
- **Errors**: Review `logger.get_summary()["errors"]`
- **Documentation**: See `IMPLEMENTATION_GUIDE.md`
- **Code**: Review docstrings in agent classes

---

**Ready to analyze? Start with Cell 1!** 🚀