# ABACO Financial Intelligence Platform

Enterprise analytics for non-bank lenders, factoring desks, and structured credit teams. This codebase delivers production-ready
dashboards, risk instrumentation, and data services built on Next.js 15 and Supabase.

## Table of contents
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Development workflow](#development-workflow)
- [Feature overview](#feature-overview)
- [Dataset generation](#dataset-generation)
- [Deployment](#deployment)
- [Support](#support)

## Architecture

| Layer       | Technology                                              | Purpose                                                     |
|-------------|----------------------------------------------------------|-------------------------------------------------------------|
| Frontend    | Next.js App Router, React 19, TypeScript                | Financial dashboard and operator experience                 |
| Styling     | Tailwind CSS + ABACO design tokens                      | Consistent visual language across analytics surfaces        |
| Data        | Supabase (PostgreSQL + Edge Functions)                  | Real-time portfolio metrics and operational telemetry       |
| Automation  | Model Context Protocol (MCP) integrations               | AI-assisted analysis, scheduled refresh, and anomaly checks |
| Tooling     | Jest, ESLint, Prettier, pnpm/npm scripts                | Deterministic developer workflow                            |

## Quick start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- Supabase account

### Installation
```bash
# Clone and install
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase
npm install

# Configure environment variables
cp .env.example .env.local
# Populate NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Launch the development server
npm run dev
```
Navigate to http://localhost:3000 to open the operator console.

### Verify Supabase connectivity
```bash
curl http://localhost:3000/api/test-supabase
```
A healthy setup returns `{ "ok": true }`.

## Development workflow
```bash
npm run dev          # start local server
npm run lint         # lint TypeScript and React files
npm run test         # execute unit tests
npm run build        # production build
npm run start        # run compiled build locally
```

## Feature overview
- **Financial dashboard** – live AUM, utilization, and charge-off telemetry sourced from Supabase analytics tables.
- **Risk analytics** – VaR, delinquency posture, and concentration heat maps calculated from the risk engine feed.
- **AI insights** – narrative summaries produced from Model Context Protocol providers and surfaced in the UI.
- **Operational checklist** – onboarding workflow that adapts once Supabase credentials are detected.
- **API surface** – `/api/financial-intelligence` exposes the current dashboard payload for integrations.

## Dataset generation
The repository includes a reproducible dataset generator for analytics testing:
```bash
bash demo_abaco_dataset.sh          # produces CSVs and notebooks in ./notebooks
```
Outputs include 30 borrower profiles, 53 performance dimensions, stress scenarios, and chart-ready aggregates.

## Deployment
### Prerequisites
- Supabase project configured with analytics tables
- Environment variables stored in your deployment platform
- Successful local build (`npm run build`)

### Deploy to Vercel
Use the Vercel deploy button in the app or run:
```bash
vercel --prod
```

### Deploy to Google Cloud Run
Follow [docs/GOOGLE_CLOUD_SETUP.md](./docs/GOOGLE_CLOUD_SETUP.md) for container registry and service configuration.

## Support
- Create an issue in GitHub for bugs or enhancement requests.
- For confidential matters, email the ABACO engineering office at engineering@abaco.finance.
