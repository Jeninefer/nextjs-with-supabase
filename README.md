# ABACO Financial Intelligence Platform

Enterprise-ready financial analytics powered by Supabase, Next.js, and AI-assisted market intelligence. The platform delivers live metrics, stress testing, and machine-generated insights for institutional lending teams.

## 🚀 Quick start

### Prerequisites

- Node.js **20.9+** (Next.js 15 runtime requirement)
- npm 10+
- Supabase project with production credentials
- Google Cloud project (for Cloud Run deployment)

### Install & configure

```bash
# Clone
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Update `.env.local` with the production Supabase URL, anon key, and service role key. Start the development server once credentials are configured:

```bash
npm run dev
```

Open <http://localhost:3000> to continue onboarding. The homepage automatically guides you through connecting Supabase credentials and provisioning your first operator account.

## 📡 Canonical dataset & API

The dashboard consumes a shared dataset located at `lib/data/financial-intelligence.ts`. The dataset exposes:

- **Financial metrics** with trends, targets, and directional changes
- **Growth series** covering 12 months of net asset value and retention data
- **Risk overview** with sector exposures, stress scenarios, and early warnings
- **Provider health** describing the status of Supabase and market data connectors
- **AI insights** including confidence, impact, and recommended actions

A public API endpoint at `GET /api/financial-intelligence` returns the dataset, attaches generation timestamps, and includes query/total duration metadata via JSON payload and response headers (`X-Query-Time-ms`, `X-Total-Time-ms`, `Server-Timing`).

## 📊 Dashboard highlights

- **Financial Metrics** – live KPI cards with change indicators and target tracking
- **Growth & Retention** – SVG area chart with monthly NAV, inflows, and retention trend
- **Risk Analysis** – VaR, expected shortfall, sector exposures, stress scenarios, and early warnings
- **AI Insights** – provider health badges plus action-oriented recommendations with confidence scoring
- Automatic refresh every 5 minutes with a manual refresh option for on-demand updates

## 🧩 Project structure

```
app/                        # Next.js App Router
├── api/financial-intelligence/route.ts
├── dashboard/financial/    # Dashboard pages, hooks, and components
└── page.tsx                 # Onboarding hero + tutorials
components/                 # Reusable UI (deploy button, tutorials, hero)
lib/data/                    # Canonical financial dataset
```

## 🛠️ Development scripts

```bash
npm run dev          # Start Next.js in development mode
npm run build        # Production build (requires Node 20.9+)
npm run start        # Start the compiled production server
npm run lint         # Run linting (Biome / ESLint configuration)
npm run type-check   # TypeScript project validation
```

## ☁️ Deployment (Google Cloud Run)

1. Authenticate and set your project:
   ```bash
   gcloud auth login
   gcloud config set project <PROJECT_ID>
   ```
2. Build locally to ensure the project compiles with production settings:
   ```bash
   npm run build
   ```
3. Deploy to Cloud Run with environment variables:
   ```bash
   gcloud run deploy abaco-platform \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=..." \
     --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=..." \
     --set-env-vars "SUPABASE_SERVICE_ROLE_KEY=..."
   ```
4. Use the in-app “Deploy to Cloud Run” button (`components/deploy-button.tsx`) to jump directly to the Cloud Run console for subsequent deploys.

## 📚 Further reading

- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) – full environment configuration checklist
- [`ABACO_IMPLEMENTATION_SUMMARY.md`](./ABACO_IMPLEMENTATION_SUMMARY.md) – rollout milestones and ingestion pipeline plan
- [`CODE_REVIEW_AUTOMATION.md`](./CODE_REVIEW_AUTOMATION.md) – automated PR review playbook

For support, open a GitHub issue or contact the ABACO engineering office at [engineering@abaco.finance](mailto:engineering@abaco.finance).
