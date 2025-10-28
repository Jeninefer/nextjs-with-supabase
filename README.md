<!-- markdownlint-disable MD033 MD041 -->
<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a> ·
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>
<!-- markdownlint-enable MD033 MD041 -->

# ABACO Financial Intelligence Platform

## Next-Generation Financial Analytics System

Transform raw lending data into superior, predictive intelligence with deep learning, behavioral modeling, and KPI automation in one cohesive system.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- **Git** for version control
- **Supabase account** ([Sign up](https://supabase.com))
- **(Optional) Google Cloud account** for Cloud Run deployment ([Setup guide](./docs/GOOGLE_CLOUD_SETUP.md))

### Installation

```bash
# Clone the repository
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase
git checkout office-addin-figma

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the ABACO platform.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with ABACO design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel, Google Cloud Run
- **AI Integration**: MCP (Model Context Protocol)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Financial dashboard
│   ├── auth/             # Authentication pages
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── auth/            # Authentication components
├── lib/                 # Utilities and configurations
│   └── supabase/       # Supabase client setup
└── scripts/            # Utility scripts
```

## 🎨 ABACO Design System

- **Colors**: Purple gradient (#C1A6FF to #5F4896)
- **Typography**: Lato (primary), Poppins (secondary)
- **Theme**: Dark mode with 4K rendering support

## 🔧 Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 📊 Features

- **Financial Dashboard**: Real-time KPI tracking
- **Risk Analysis**: Advanced portfolio risk modeling
- **AI Insights**: Machine learning-powered analytics
- **Growth Projections**: Strategic planning tools
- **Market Intelligence**: 50+ data source monitoring
- **Dataset Generator**: Comprehensive financial data generation with 30 customers and 53+ dimensions

## 🔬 ABACO Dataset Generation

Generate comprehensive financial intelligence datasets for analytics and testing:

```bash
# Quick start demo (recommended)
bash demo_abaco_dataset.sh

# Or run individually:

# 1. Setup environment
bash fix_abaco_environment.sh

# 2. Generate dataset
cd notebooks
python3 abaco_dataset_generator.py
```

**Features:**

- 30 customer records with 53 analytical dimensions
- Realistic financial metrics and patterns
- Comprehensive analytics reporting
- CSV export with summary statistics

For detailed documentation, see [notebooks/README_ABACO_DATASET.md](./notebooks/README_ABACO_DATASET.md)

## 🚀 Deployment

### Prerequisites

Before deploying, ensure:

- [ ] Supabase project is configured
- [ ] Environment variables are set
- [ ] Application builds successfully (`npm run build`)
- [ ] Google Cloud account setup (for Cloud Run) - [Setup Guide](./docs/GOOGLE_CLOUD_SETUP.md)

### Vercel (Recommended)

```bash
# Build locally first
npm run build

# Deploy to Vercel
vercel deploy

# Or deploy for production
vercel --prod
```

**Environment Variables on Vercel**:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy after adding variables

### Google Cloud Run

**First-time Setup**:

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set your project
gcloud config set project YOUR-PROJECT-ID

# 3. Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Deploy
gcloud run deploy abaco-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-key"
```

**Subsequent Deployments**:

```bash
# Quick deploy with existing config
gcloud run deploy abaco-platform --source .
```

**Troubleshooting Deployment**:

If you encounter permission errors:

```bash
# Check your access
gcloud projects list

# Enable necessary APIs
gcloud services enable run.googleapis.com

# See full troubleshooting guide
# docs/TROUBLESHOOTING.md
```

For complete Google Cloud setup instructions, see:

- [Google Cloud Setup Guide](./docs/GOOGLE_CLOUD_SETUP.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

## 🔒 Security & Compliance

- GDPR compliant data handling
- SOX financial reporting standards
- Basel III banking regulations
- Enterprise-grade authentication

## 🛠️ Troubleshooting

For detailed setup instructions, error resolution, and platform status, see:

- [📚 Documentation Index](./docs/README.md) - Complete documentation overview
- [Google Cloud Setup Guide](./docs/GOOGLE_CLOUD_SETUP.md) - Complete GCP integration guide
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Quick Start Guide](./QUICK_START.md)
- [Build Success Log](./BUILD_SUCCESS.md)

### Common Issues

**Supabase URL is invalid or missing**

If you see an error like:

```bash
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

it means your Supabase URL environment variable is empty, malformed, or missing the `https://` prefix.

**How to fix:**

1. **Open your `.env.local` file** in the project root.

2. **Add or correct these lines** (replace with your actual values from Supabase → Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   - The URL **must** start with `https://`.
   - Do **not** use quotes around the values.

3. **Restart your dev server** after saving changes:

   ```bash
   npm run dev
   ```

4. **If you still see the error:**
   - Double-check for typos in variable names.
   - Make sure `.env.local` is in the project root.
   - Reload your IDE or terminal to ensure environment variables are loaded.

---

**Port 3000 is already in use**

If you see an error like:

```bash
Error: listen EADDRINUSE: address already in use :::3000
```

it means another process is already using port 3000.

**How to fix:**

1. **Check for any process using port 3000 (both IPv4 & IPv6):**

   ```bash
   lsof -nP -iTCP:3000 -sTCP:LISTEN
   netstat -anv | grep 3000
   ```

   Then kill the process by its PID:

   ```bash
   kill -9 <PID>
   ```

2. **Or, start Next.js on a different port:**

   ```bash
   PORT=3001 npm run dev
   # or
   npx next dev -p 3001
   ```

3. **If running in Codespaces or a dev container, you may need to restart the workspace.**

**ABACO Financial Intelligence Platform** - Setting the standard for financial analytics excellence.

> **Note:** This is the canonical repository for the Office Add-in with Figma and AI API integration.
