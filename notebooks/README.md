# ABACO Financial Intelligence Notebooks

This directory contains Jupyter notebooks for financial analysis, risk modeling, and market intelligence on the ABACO platform.

## Overview

The notebooks implement advanced analytics workflows for lending portfolios, combining feature engineering, KPI calculation, and market analysis in a cohesive analytical framework.

## Notebooks

### abaco_financial_intelligence.ipynb

The main analytical notebook for the ABACO Financial Intelligence Platform, featuring comprehensive financial analytics and risk modeling capabilities.

**Purpose**: Transform raw lending data into actionable insights through feature engineering, KPI tracking, and market analysis.

**Prerequisites**:
- Python 3.8+
- Required packages: `numpy`, `pandas`, `typing`
- Sample data available in `../data/sample_financial_data.csv`

**Workflow Order**:
1. Feature Engineering (Cell 1)
2. KPI Calculation Engine (Cell 2)
3. Marketing & Sales Analysis (Cell 3)
4. Data Quality Audit (Cell 4)

## Cell Documentation

### Cell 1: Feature Engineering

**Description**: Transforms raw financial data into enriched features for analysis and modeling.

**Key Components**:
- `FeatureEngineer`: Main class for feature transformation
- `FeatureArtifacts`: Named tuple for output (features + alerts)
- Delinquency bucketing (current, 1-30, 31-60, 61-90, 91-120, 120+ days)
- Customer type derivation (micro, SME, corporate, enterprise, intensive)
- Segment classification (A-F based on balance quantiles)

**Input Variables**:
- `master_frame`: Primary dataset (pd.DataFrame) with customer financial records
- Expected columns: `customer_id`, `date`, `balance`, `credit_limit`, `dpd`, `product_code`, `origination_date`, `industry`, `kam_owner`

**Output Variables**:
- `feature_frame`: Enriched dataset with derived features
- `alerts_frame`: Risk alerts and exceptions (columns: `customer_id`, `rule`, `severity`, `details`)

**Features Generated**:
- `customer_type`: Derived customer classification
- `segment_code`: Portfolio segment (A-F)
- `delinquency_bucket`: Payment status category
- `utilization_rate`: Credit limit usage ratio
- `account_age_days`: Days since origination
- `vintage_category`: Account age grouping

**Usage Example**:
```python
engineer = FeatureEngineer(reference_date=pd.Timestamp('2024-01-15'))
artifacts = engineer.transform(master_frame)
feature_frame = artifacts.features
alerts_frame = artifacts.alerts
```

### Cell 2: KPI Calculation Engine

**Description**: Calculates key performance indicators for portfolio monitoring and management reporting.

**Key Components**:
- `KPIEngine`: Main calculation engine
- Portfolio-level aggregations
- Segment-level breakdowns
- Time-series trending

**Input Variables**:
- `feature_frame`: Output from Feature Engineering cell

**Output Variables**:
- `kpi_results`: Dictionary of calculated KPIs
- KPI categories: portfolio, delinquency, customer_mix, financial_health

**KPIs Calculated**:

**Portfolio Metrics**:
- `total_customers`: Total unique customers
- `total_exposure`: Sum of all balances
- `avg_balance_per_customer`: Mean balance
- `total_credit_limit`: Sum of credit limits

**Delinquency Metrics**:
- `dpd_0_count`: Current accounts
- `dpd_30_count`: 1-30 days past due
- `dpd_60_count`: 31-60 days past due
- `dpd_90_count`: 61-90 days past due
- `dpd_90_plus_count`: 90+ days past due
- `delinquency_rate`: % of non-current accounts

**Customer Mix**:
- Counts by customer_type (micro, SME, corporate, enterprise, intensive)
- Counts by segment_code (A-F)

**Financial Health**:
- `avg_utilization`: Mean credit utilization rate
- `high_utilization_count`: Accounts with >80% utilization
- `avg_account_age_days`: Mean account age

**Usage Example**:
```python
engine = KPIEngine()
kpi_results = engine.calculate(feature_frame)
print(f"Total Exposure: ${kpi_results['portfolio']['total_exposure']:,.2f}")
```

### Cell 3: Marketing & Sales Analysis

**Description**: Analyzes customer distribution, product mix, and portfolio composition for strategic insights.

**Key Components**:
- `MarketAnalyzer`: Main analysis class
- Industry sector analysis
- Product performance metrics
- KAM (Key Account Manager) portfolio distribution

**Input Variables**:
- `feature_frame`: Output from Feature Engineering cell

**Output Variables**:
- `market_insights`: Dictionary with analysis results
- Categories: industry_distribution, product_mix, kam_portfolio, segment_analysis

**Insights Generated**:

**Industry Distribution**:
- Customer count by industry sector
- Total exposure by industry
- Average balance by industry
- Delinquency rates by sector

**Product Mix**:
- Distribution across product codes (CC, PL, BL)
- Performance metrics by product type
- Product-level risk indicators

**KAM Portfolio**:
- Portfolio size per Key Account Manager
- Performance metrics by KAM
- Risk concentration analysis

**Segment Analysis**:
- Customer distribution across segments (A-F)
- Segment characteristics and performance
- Migration patterns between segments

**Usage Example**:
```python
analyzer = MarketAnalyzer()
market_insights = analyzer.analyze(feature_frame)
print("Top 5 Industries by Exposure:")
print(market_insights['industry_distribution'].head())
```

### Cell 4: Data Quality Audit

**Description**: Validates data integrity, identifies missing values, and flags data quality issues for remediation.

**Key Components**:
- `DataQualityAuditor`: Main auditing class
- Completeness checks
- Validity checks
- Consistency checks
- Outlier detection

**Input Variables**:
- `master_frame`: Original input dataset
- `feature_frame`: Processed feature dataset

**Output Variables**:
- `quality_report`: Dictionary with audit findings
- `quality_issues`: DataFrame of identified issues
- Categories: completeness, validity, consistency, outliers

**Quality Checks**:

**Completeness**:
- Missing value detection by column
- Null percentage calculations
- Required field validation

**Validity**:
- Data type verification
- Value range validation (e.g., dpd >= 0)
- Format checks (date formats, ID patterns)

**Consistency**:
- Cross-field validation (balance <= credit_limit)
- Temporal consistency
- Reference data matching

**Outliers**:
- Statistical outlier detection (Z-score method)
- Business rule violations
- Extreme value flagging

**Usage Example**:
```python
auditor = DataQualityAuditor()
quality_report = auditor.audit(master_frame, feature_frame)
print(f"Data Quality Score: {quality_report['overall_score']:.1%}")
print(f"Issues Found: {len(quality_report['issues'])}")
```

## Execution Order

**Important**: Cells must be executed in sequence due to data dependencies.

1. **Cell 1 (Feature Engineering)**: Creates `feature_frame` and `alerts_frame`
2. **Cell 2 (KPI Calculation)**: Uses `feature_frame` to generate `kpi_results`
3. **Cell 3 (Market Analysis)**: Uses `feature_frame` to create `market_insights`
4. **Cell 4 (Data Quality Audit)**: Uses both `master_frame` and `feature_frame`

## Data Flow

```
master_frame (input)
    ↓
[Cell 1: Feature Engineering]
    ↓
feature_frame + alerts_frame
    ↓
[Cell 2: KPI Calculation] → kpi_results
    ↓
[Cell 3: Market Analysis] → market_insights
    ↓
[Cell 4: Data Quality Audit] → quality_report
```

## Market Analysis Feature

The Market Analysis feature (Cell 3) provides strategic insights for business development and portfolio management:

### Key Capabilities

1. **Industry Intelligence**
   - Sector exposure analysis
   - Industry risk profiling
   - Market share by sector
   - Growth opportunity identification

2. **Product Performance**
   - Product-level metrics (CC, PL, BL)
   - Cross-sell opportunities
   - Product mix optimization
   - Revenue analysis by product

3. **KAM Effectiveness**
   - Portfolio distribution by manager
   - Performance benchmarking
   - Workload balancing
   - Relationship quality metrics

4. **Segmentation Insights**
   - Customer value analysis (A-F segments)
   - Segment characteristics
   - Migration tracking
   - Targeted campaign planning

### Business Applications

- **Strategic Planning**: Identify high-value industries and products
- **Risk Management**: Monitor concentration risk by sector/KAM
- **Sales Optimization**: Prioritize accounts and opportunities
- **Resource Allocation**: Balance KAM portfolios effectively

### Integration Points

The Market Analysis feature integrates with:
- **Feature Engineering**: Uses enriched customer profiles
- **KPI Engine**: Aligns with performance metrics
- **Risk Models**: Supports risk-adjusted decision making
- **Dashboard**: Feeds real-time visualizations

## Best Practices

1. **Data Preparation**
   - Ensure `master_frame` has all required columns
   - Validate date formats before processing
   - Handle missing values appropriately

2. **Execution**
   - Run cells in order (1 → 2 → 3 → 4)
   - Check for errors after each cell
   - Review alerts from Feature Engineering

3. **Interpretation**
   - Cross-reference KPIs with market insights
   - Investigate quality issues before analysis
   - Validate results against business expectations

4. **Performance**
   - Use appropriate date ranges for large datasets
   - Consider sampling for exploratory analysis
   - Monitor memory usage with large portfolios

## Troubleshooting

### Common Issues

**Issue**: `NameError: name 'master_frame' is not defined`
- **Solution**: Initialize `master_frame` before running Feature Engineering cell

**Issue**: Empty `feature_frame` after Cell 1
- **Solution**: Check `master_frame` has data and required columns

**Issue**: KPIs showing zeros
- **Solution**: Verify `feature_frame` was populated by Cell 1

**Issue**: Date parsing errors
- **Solution**: Ensure dates are in YYYY-MM-DD format

### Variable Initialization

If starting mid-notebook, initialize required variables:

```python
import pandas as pd

# Initialize master_frame from data file
master_frame = pd.read_csv('../data/sample_financial_data.csv')
master_frame['date'] = pd.to_datetime(master_frame['date'])
master_frame['origination_date'] = pd.to_datetime(master_frame['origination_date'])

# Initialize empty frames
feature_frame = pd.DataFrame()
alerts_frame = pd.DataFrame(columns=['customer_id', 'rule', 'severity', 'details'])
```

## Environment Setup

### Required Packages

```bash
pip install numpy pandas jupyter
```

### Optional Packages (for enhanced functionality)

```bash
pip install matplotlib seaborn plotly  # For visualizations
pip install scikit-learn  # For ML features
```

## Updates and Maintenance

- **Version**: 1.0.0
- **Last Updated**: October 2025
- **Maintained by**: ABACO Data Analytics Team
- **Update Frequency**: Quarterly feature releases

## Support

For questions or issues:
- Technical support: tech@abaco-platform.com
- Feature requests: product@abaco-platform.com
- Data questions: data@abaco-platform.com

---

**ABACO Financial Intelligence Platform** - Transforming lending data into strategic insights.
