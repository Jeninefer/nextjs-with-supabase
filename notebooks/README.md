# Abaco Financial Intelligence Notebook

This directory contains the Abaco Financial Intelligence Jupyter notebook that provides comprehensive financial analysis and insights.

## Overview

The `abaco_financial_intelligence.ipynb` notebook implements a complete financial intelligence platform with the following features:

### Cells Overview

1. **Cell 1: Feature Engineering** - Merges datasets and computes various financial metrics including customer types, delinquency buckets, and risk indicators.

2. **Cell 2: KPI Calculation Engine** - Computes key performance indicators (KPIs) and financial views including AUM, active clients, default rates, and more.

3. **Cell 3: Growth Analysis & Projections** - Projects future Assets Under Management (AUM) and client growth with trend analysis.

4. **Cell 4: Marketing & Sales Analysis** - Analyzes sales data by industry and channel to identify growth opportunities.

5. **Cell 5: Risk Analysis & Roll Rate** - Analyzes default rates, delinquency percentages, and portfolio roll rates.

6. **Cell 6: Data Quality Audit** - Audits data quality across sources to ensure data integrity.

7. **Cell 7: AI Summary & Insights** - Generates AI-powered insights based on the analyzed data.

8. **Cell 8: Visualizations & Exports** - Creates interactive visualizations using Plotly and enables data exports.

9. **Cell 9: Market Analysis from MYPE 2025 PDF** - Extracts and analyzes market insights from the MYPE 2025 report.

## Market Analysis Feature (Cell 9)

The Market Analysis feature integrates external market research from the MYPE (Micro and Small Enterprises) 2025 report to provide context for financial decisions.

### Key Features

- **PDF Data Extraction**: Automatically extracts market insights from the MYPE 2025 PDF report using `pdfplumber`
- **Fallback Data**: Provides default market statistics when the PDF is unavailable
- **AI Integration**: Incorporates market context into AI-generated summaries
- **Market Metrics**: Tracks GDP share, TAM updates, market challenges, and opportunities

### Default Market Insights

When the PDF is not available, the cell uses these fallback metrics:

- **GDP Share**: 48.8%
- **TAM Update**: 31,666
- **Challenges**:
  - Limited formal credit access
  - Fragmented guarantee schemes
- **Opportunities**:
  - Digital onboarding expansion
  - Supply chain financing partnerships
- **Behavioral Links**: Micro-segment displays high cash-cycle volatility

### Data Requirements

To use the full PDF extraction feature, place the MYPE 2025 report PDF file at:

```
../data/mype_report_2025.pdf
```

The system will automatically extract insights from pages 1, 2, and 35 of the report.

## Setup

### Prerequisites

```bash
pip install pandas numpy plotly pdfplumber jupyter
```

### Data Structure

The notebook expects data files in the `../data/` directory. See the data directory README for the expected file formats.

## Usage

1. Ensure all required Python packages are installed
2. Place your data files in the `../data/` directory
3. Open the notebook: `jupyter notebook abaco_financial_intelligence.ipynb`
4. Run cells sequentially from top to bottom

## Output

The notebook generates:
- Financial metrics and KPIs
- Risk analysis reports
- Growth projections
- Interactive visualizations
- AI-powered insights incorporating market context
- Exportable data for further analysis
