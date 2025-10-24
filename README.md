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

> **💡 New!** Run this platform for **$0/month** with our [free services migration script](./QUICK_START_MIGRATION.md)!  
> Save **$120+/month** by switching to PocketBase, Google Gemini, and Cloudinary.  
> [Compare options →](./SERVICE_COMPARISON.md)

## 🚀 Quick Start

### 💰 Free Services Migration

**Want to run this platform for FREE?** We provide an automated migration script to switch from paid services to 100% free alternatives:

```bash
# Run the automated migration script
bash scripts/migrate-to-free-services.sh
```

This will:
- Replace Supabase with PocketBase (self-hosted, unlimited)
- Configure Google Gemini AI (free tier)
- Set up Cloudinary for storage (25GB free)
- Prepare Netlify deployment (100GB bandwidth free)
- **Save $120+/month → $0**

See [Migration Guide](./MIGRATION_GUIDE.md) (generated after running script) for details.

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- **Git** for version control
- **Supabase account** ([Sign up](https://supabase.com)) OR run migration script for free alternatives
- **(Optional) Google Cloud account** for Cloud Run deployment ([Setup guide](./docs/GOOGLE_CLOUD_SETUP.md))

### Installation

**Option 1: With Supabase (Paid)**
```bash
# Clone the repository
git clone https://github.com/your-org/nextjs-with-supabase
cd nextjs-with-supabase

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

**Option 2: With Free Services Stack (Recommended)**
```bash
# Clone the repository
git clone https://github.com/your-org/nextjs-with-supabase
cd nextjs-with-supabase

# Install dependencies
npm install

# Run migration script
bash scripts/migrate-to-free-services.sh

# Get free API keys (links provided by script)
# Update .env.local with your keys

# Start PocketBase (in one terminal)
npm run pocketbase:start

# Start development server (in another terminal)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the ABACO platform.

## 🏗️ Tech Stack

### Current Stack (Paid)
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with ABACO design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel, Google Cloud Run
- **AI Integration**: MCP (Model Context Protocol)

### Free Services Alternative (via Migration Script)
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with ABACO design system
- **Backend**: PocketBase (self-hosted)
- **Database**: PocketBase (SQLite)
- **Authentication**: PocketBase Auth
- **AI**: Google Gemini (free tier)
- **Storage**: Cloudinary (25GB free)
- **Deployment**: Netlify (100GB bandwidth free)

Run `bash scripts/migrate-to-free-services.sh` to switch to the free stack.

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
- [🚀 Free Services Migration](./QUICK_START_MIGRATION.md) - Quick guide to migrate to free stack
- [📊 Service Comparison](./SERVICE_COMPARISON.md) - Compare paid vs free services
- [Google Cloud Setup Guide](./docs/GOOGLE_CLOUD_SETUP.md) - Complete GCP integration guide
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Quick Start Guide](./QUICK_START.md)
- [Build Success Log](./BUILD_SUCCESS.md)

### Common Issues

**Port already in use:**

```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

**Git sync issues:**

```bash
# Set upstream branch
git push -u origin main

# Pull and push
git pull origin main
git push origin main
```

**Google Cloud access issues:**

```bash
# Check project access
gcloud projects list

# Enable required APIs
gcloud services enable run.googleapis.com

# See full guide: docs/TROUBLESHOOTING.md
```

**Python analysis not running:**

```bash
python3 notebooks/abaco_financial_intelligence.py
```

For comprehensive troubleshooting, see:
- [Google Cloud Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Google Cloud Setup](./docs/GOOGLE_CLOUD_SETUP.md)

## 📄 License

Proprietary software. See [LICENSE](./LICENSE) for details.

## 🤝 Contributing

This is a proprietary platform. For authorized contributions, please contact the development team.

## 📞 Support

For technical support: <tech@abaco-platform.com>
For licensing: <legal@abaco-platform.com>

---

**ABACO Financial Intelligence Platform** - Setting the standard for financial analytics excellence.
