---
description: Repository Information Overview
alwaysApply: true
---

# Next.js with Supabase Information

## Summary

A Next.js starter template with Supabase integration, featuring ABACO Financial Intelligence Platform. The project transforms raw lending data into superior, predictive intelligence by integrating deep learning, behavioral modeling, and KPI automation into one cohesive system that powers strategic decisions at every level. The platform delivers market-leading clarity, predictive power, and decision-making precision through advanced financial modeling, risk assessment, and 4K-optimized data visualization.

The ABACO platform sets the standard for financial analytics by engineering a next-generation financial intelligence platform where the standard is not compliance but excellence — producing outcomes that are not merely correct but superior, robust, and strategically insightful. Every line of code and every analytic view is built to enterprise-grade quality, thinking beyond immediate tasks to deliver market-leading clarity, predictive power, and decision-making precision.

## Structure

- `/app`: Next.js App Router pages and layouts (auth, dashboard, protected routes)
- `/components`: React components (UI, auth, tutorial components)
- `/lib`: Utility functions and Supabase client configuration
- `/notebooks`: Python notebooks for financial analysis
- `/supabase`: Supabase functions and configuration
- `/docs`: Documentation files
- `/abaco_venv`: Python virtual environment for financial analysis

## Language & Runtime

**Language**: TypeScript
**Version**: TypeScript 5.9.3
**Framework**: Next.js 15.5.6
**Build System**: Next.js with Turbopack
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- React 19.0.0
- Next.js 15.5.6
- @supabase/ssr 0.7.0
- @supabase/supabase-js 2.75.1
- Tailwind CSS 3.4.1
- next-themes 0.4.6
- lucide-react 0.511.0
- @radix-ui components for UI elements
- @modelcontextprotocol/sdk 0.5.0
- tailwind-merge 2.2.1
- class-variance-authority 0.7.1

**Development Dependencies**:

- TypeScript 5.9.3
- ESLint 9
- Prettier 3.6.2
- Autoprefixer 10.0.1
- PostCSS 8
- tailwindcss-animate 1.0.7

## Build & Installation

```bash
# Install dependencies
npm install

# Development server
npm run dev --turbopack

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm run start

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## Supabase Integration

**Client Configuration**: Uses @supabase/ssr for server-side rendering
**Authentication**: Cookie-based authentication with secure cookie handling and context propagation
**Environment Variables**:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

## Python Analysis Environment

**Environment**: Python virtual environment (abaco_venv)
**Python Version**: 3.14
**Main Libraries**:

- pandas 2.1.0+
- numpy 1.24.0+
- plotly 5.17.0+
- matplotlib 3.8.0+
- seaborn 0.12.0+
- scikit-learn 1.3.0+
- jupyter 1.0.0+
- yfinance 0.2.0+
- statsmodels 0.14.0+
- pulp (Linear programming solver)
- google.cloud.aiplatform
- vertexai (AI model integration)
- PyPDF2 (Document processing)
- streamlit (Interactive dashboard)

**Financial Utilities**:

- FinancialDataGenerator: Generates realistic financial datasets
- FinancialAnalyzer: Performs risk and profitability analysis
- RandomForestRegressor for predictive modeling
- Linear programming optimization with PuLP
- Data export functionality with timestamp tracking
- Roll rate computation using historical DPD transitions
- Growth analysis with user-defined targets and gap calculation
- Marketing & sales analysis with treemap visualizations

**Data Processing**:

- Robust file upload handling with re-run support
- Column name normalization (lowercase, spaces to underscores, special chars to underscores)
- Numeric conversion tolerant of currency symbols (₡, $, €, commas, percent signs)
- Data quality audit with missing data detection and scoring
- Outlier detection with alerts dataframe capturing variables and values
- Save ingestion state (shapes, loaded flags)
- Error handling with informative messages for missing core data
- Support for multiple data sources (local files and Google Sheets)

**Run Commands**:

```bash
# Activate virtual environment
source abaco_venv/bin/activate

# Run financial utilities
python3 notebooks/financial_utils.py

# Run interactive dashboard
streamlit run notebooks/abaco_dashboard.py
```

## ABACO Design System

**Color Palette**:

- Primary Purple: #C1A6FF
- Purple Dark: #5F4896
- Dark Blue: #0C2742
- Background: #030E19
- Light Gray: #CED4D9
- Medium Gray: #9EA9B3
- Dark Gray: #6D7D8E
- White: #FFFFFF
- Success: #10B981
- Success Dark: #059669
- Warning: #FB923C
- Warning Dark: #EA580C
- Error: #DC2626
- Error Dark: #991B1B
- Info: #3B82F6
- Info Dark: #1D4ED8

**Gradients**:

- Title: linear-gradient(81.74deg, #C1A6FF 5.91%, #5F4896 79.73%)
- Card Primary: linear-gradient(135deg, rgba(193, 166, 255, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)
- Card Secondary: linear-gradient(135deg, rgba(34, 18, 72, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)
- Card Highlight: linear-gradient(135deg, rgba(193, 166, 255, 0.25) 0%, rgba(0, 0, 0, 0.8) 100%)

**Typography**:

- Primary Font: Lato
- Secondary Font: Poppins
- Title Size: 48px
- Metric Size: 48px
- Label Size: 16px
- Body Size: 14px
- Description Size: 12px

**UI Components**:

- Glass Morphism Cards with backdrop-filter: blur(10px)
- Custom Metric Cards with gradient backgrounds
- Interactive Buttons with hover animations and transform effects
- Custom Tabs with selected state styling
- Styled DataFrames with custom borders and backgrounds
- Section Labels with uppercase formatting and letter spacing
- Metric Containers with custom styling for labels and values
- Sidebar with gradient background and border accent

## Architecture & Design

**Modular Design**: Components broken into focused, single-responsibility modules
**Clear Interfaces**: TypeScript interfaces define explicit contracts between components
**Separation of Concerns**: Business logic, data access, and presentation layers are distinct
**Error Boundaries**: Robust error handling with meaningful error messages
**State Management**: Immutable data structures with proper validation
**Observability**: Structured logging with appropriate log levels and tracing

**AI Integration**:

- Conditional AI usage based on available libraries and credentials
- Summary generation and insight prompts
- Rule-based textual synthesis fallback when AI unavailable
- Integration with Google Cloud AI Platform and Vertex AI
- Export preparation for external visualization in Figma
- Flattened fact table generation with dimensions/metrics lists

**Data Visualization**:

- Unified theme application for all Plotly figures
- 4K-optimized visualizations (3840px resolution support)
- Custom color schemes avoiding default Plotly colors
- Interactive treemap visualizations for marketing analysis
- Aggregated head displays for data overview
- Projected growth path with monthly interpolation
- Styled dataframe displays with HTML formatting

## Deployment

**Vercel**:

```bash
npm run build
vercel deploy
```

**Google Cloud Run**:

```bash
gcloud run deploy abaco-platform --source . --platform managed --region us-central1
```

**Supabase Edge Functions**:

```bash
supabase functions deploy summarize-thread
```
