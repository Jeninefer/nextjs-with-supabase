# ABACO Financial Intelligence Platform

The ABACO platform is a Next.js and Supabase application that provides secure authentication, configurable dashboards, and AI-assisted financial workflows. This repository contains the application source, supporting infrastructure scripts, and runtime export directories used to share analytics artifacts with downstream consumers.

## Repository Layout

```
├── app/                    # Next.js App Router and pages
├── components/             # UI components, including deployment utilities
├── lib/                    # Supabase client setup and shared helpers
├── models/                 # Domain models and schema utilities
├── scripts/                # Maintenance and development scripts
├── abaco_runtime/exports/  # Analytics exports produced at runtime (kept empty in git)
└── supabase/               # Supabase configuration, migrations, and Edge Functions
```

## Runtime Export Management

Analytics jobs generate CSV, JSON, and other export artifacts under `abaco_runtime/exports/`. These files are environment-specific and can be safely regenerated. To keep the directory structure versioned while ignoring generated data, each export subdirectory contains a `.gitkeep` placeholder and the `.gitignore` configuration allows only these placeholders to be committed.

Current export buckets:

- `analytics/` – Aggregated analytics bundles
- `dpd/` – Days-past-due extracts for credit monitoring
- `kpi/` and `kpi/json/` – KPI rollups in table and JSON form
- `pricing/` – Pricing model exports for revenue teams

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project with the required tables and policies
- (Optional) Vercel CLI for deployments

### Installation

```bash
# Clone the repository
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start the development server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start local development server
npm run build      # Create an optimized production build
npm run start      # Run the production build locally
npm run lint       # Run ESLint
npm run type-check # Run TypeScript diagnostics
```

## Deployment

### Vercel

1. Push changes to a branch on GitHub.
2. Configure environment variables in the Vercel dashboard.
3. Trigger a deployment via the dashboard or `vercel deploy`.

### Self-Hosted / Cloud Run

The project can also run on container platforms such as Google Cloud Run. Use the provided `Dockerfile` and ensure the environment variables from `.env.local` are supplied at runtime.

## Roadmap

The following initiatives are in progress and tracked in [`ABACO_IMPLEMENTATION_SUMMARY.md`](./ABACO_IMPLEMENTATION_SUMMARY.md):

- ✅ Directory scaffolding to preserve ABACO runtime export structure in version control.
- 🛠️ Secure ingestion pipeline that synchronizes live Supabase tables with the analytics lakehouse (design complete, implementation scheduled).
- 🛠️ Expanded observability for data export jobs, including retention policies and audit logging.

Contributions and feedback are welcome. Please open an issue or submit a pull request to discuss improvements.
