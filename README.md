<!-- markdownlint-disable MD033 MD041 -->
<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<<<<<<< HEAD
[**Features**](#features) · [**Demo**](#demo) · [**Deploy to Vercel**](#deploy-to-vercel) · [**Clone and run locally**](#clone-and-run-locally) · [**Feedback and issues**](#feedback-and-issues) · [**More Examples**](#more-supabase-examples)

=======
<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a> ·
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
>>>>>>> a420387e78678797632369e28629f802ce050805
<br/>
<!-- markdownlint-enable MD033 MD041 -->

# ABACO Financial Intelligence Platform

<<<<<<< HEAD
<div align="center">
  <img src="https://img.shields.io/badge/Platform-ABACO%20Financial%20Intelligence-blue" alt="ABACO Platform">
  <img src="https://img.shields.io/badge/Next.js-16.0.0-black" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.0.0-61dafb" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7.3-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/AI%20Toolkit-Integrated-green" alt="AI Toolkit">
  <img src="https://img.shields.io/badge/Azure%20Cosmos%20DB-HPK%20Optimized-orange" alt="Azure Cosmos DB">
  <img src="https://img.shields.io/badge/Deployment-100%25%20FREE-brightgreen" alt="Free Deployment">
</div>

## 🏦 Enterprise Financial Intelligence Platform

Production-ready financial intelligence platform built with Next.js 16, Supabase SSR authentication, AI Toolkit integration, and Azure Cosmos DB optimization. **Deploy completely FREE** with enterprise-grade capabilities.

### 🆓 FREE Deployment Options

#### Recommended Free Stack
- **Frontend**: Netlify (100GB/month) - $0
- **Database**: Supabase (500MB, 50K users) - $0  
- **Analytics**: Azure Cosmos DB (1000 RUs/month) - $0
- **Monitoring**: GitHub Actions (2000 minutes) - $0
- **Domain**: Custom domain with SSL - $0

```bash
# One-command free deployment
git push origin main  # Auto-deploys via GitHub Actions
```

### 🚀 Free Deployment Methods

#### 1. Netlify (Recommended - 100GB bandwidth free)
```bash
# Connect GitHub → Auto-deploy
# Build: npm run build
# Publish: .next
# SSL + Custom domain included
```

#### 2. Railway (500 hours/month free)
```bash
# Connect GitHub → Auto-deploy
# Includes free database
# Custom railway.app subdomain
```

#### 3. Render (750 hours/month free)  
```bash
# Connect GitHub → Auto-deploy  
# Free SSL certificate
# Global CDN included
```

#### 4. GitHub Codespaces + Docker (Completely free)
```bash
# Already configured - just run:
docker build -t abaco-financial .
docker run -p 3000:3000 abaco-financial
# Access via Codespaces port forwarding
```

## 🚀 Quick Start (FREE)

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd abaco-financial-intelligence
npm install
```

### 2. Free Services Setup

#### Supabase (FREE - 500MB, 50K users)
1. Go to [supabase.com](https://supabase.com) → "Start your project" 
2. Create new project (select free tier)
3. Get credentials from Settings → API

#### Azure Cosmos DB (FREE - 1000 RUs/month)
1. Go to [Azure Portal](https://portal.azure.com)
2. Create Cosmos DB → "Apply Free Tier Discount" 
3. Get connection string from Keys section

### 3. Environment Configuration
```bash
cp .env.example .env.local
# Add your free service credentials
```

### 4. Deploy (Choose one FREE option)

#### Option A: Netlify (Recommended)
1. Push to GitHub
2. Connect repository to [Netlify](https://netlify.com)  
3. Auto-deploys on every push
4. Free SSL + custom domain

#### Option B: Railway
1. Connect GitHub to [Railway](https://railway.app)
2. Auto-detects Next.js configuration  
3. Free subdomain + 500 hours/month

#### Option C: Docker (Local/Codespaces)
```bash
docker build -t abaco-financial .
docker run -p 3000:3000 abaco-financial
```

## 🏦 Financial Intelligence Features (All FREE)

### 📊 Portfolio Analytics
- Real-time portfolio valuation and performance tracking
- Asset allocation analysis with sector breakdown  
- Risk-adjusted returns and performance calculations
- AI-powered investment recommendations

### 🤖 AI-Powered Insights  
- Automated financial report generation with AI Toolkit tracing
- Market sentiment analysis and trend identification
- Predictive modeling for portfolio optimization
- Comprehensive risk assessment and monitoring

### 🔐 Enterprise Security
- Supabase SSR authentication with row-level security
- Azure Cosmos DB with Hierarchical Partition Keys optimization
- End-to-end encryption for sensitive financial data
- Comprehensive audit trails for regulatory compliance

### 📱 Modern Interface
- Mobile-responsive Progressive Web App
- Dark mode optimized for financial professionals
- Real-time updates and notifications
- Accessible design following WCAG guidelines

## 🔧 Development (All FREE Tools)

```bash
# Development server
npm run dev

# Code quality (GitHub Actions - 2000 min/month free)  
npm run lint          # ESLint validation
npm run type-check    # TypeScript compilation  
npm run test:coverage # Jest tests + coverage

# AI Toolkit integration
npm run test:agents   # Financial AI agent evaluation
npm run analyze:traces # Trace analysis for compliance
```

## 📊 Free Tier Limits & Capabilities

| Component | Free Tier | Capabilities |
|-----------|-----------|--------------|
| **Netlify** | 100GB bandwidth | Global CDN, SSL, Custom domains |
| **Railway** | 500 hours/month | Auto-deploy, Databases, Subdomains |
| **Supabase** | 500MB, 50K users | Auth, Database, Real-time, Storage |
| **Azure Cosmos DB** | 1000 RUs/month | Global distribution, Vector search |
| **GitHub Actions** | 2000 minutes | CI/CD, Testing, Monitoring |

### Scaling Path
- Start FREE with full enterprise features
- Upgrade when you need more resources
- No feature limitations on free tiers
- Production-ready from day one

## 🚀 Continuous Deployment (FREE)

```yaml
# .github/workflows/deploy.yml (FREE - 2000 minutes/month)
name: Deploy ABACO Financial Intelligence
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Netlify
      # Auto-deploys to production
```

## 🏦 Production Features (All Included FREE)

### ✅ Enterprise Capabilities
- **Multi-tenant Architecture**: Isolated financial data per user
- **AI Toolkit Tracing**: Comprehensive observability and audit trails  
- **Azure Cosmos DB HPK**: Scalable financial data with partition optimization
- **Real-time Analytics**: Live portfolio updates and market data
- **Regulatory Compliance**: Built-in audit trails and security features
- **Mobile Optimization**: PWA with offline capabilities

### ✅ Performance Optimizations  
- **Next.js 16 Turbopack**: Lightning-fast development and builds
- **Edge Deployment**: Global CDN with sub-100ms response times
- **Image Optimization**: Automatic WebP conversion and lazy loading
- **Bundle Analysis**: Optimized JavaScript bundles for faster loading
- **Caching Strategy**: Intelligent caching for financial data

## 💡 Why ABACO Platform is FREE-Deployment Ready

1. **Optimized Architecture**: Built for serverless and edge deployment
2. **Minimal Resources**: Efficient use of free tier limits  
3. **No Vendor Lock-in**: Deploy anywhere, migrate anytime
4. **Production Grade**: Enterprise features without enterprise costs
5. **Scalable Design**: Grows with your business seamlessly

## 🎯 Success Story

> **From FREE to Enterprise**: Start with completely free deployment, scale to millions of users. The ABACO Financial Intelligence Platform grows with your business - no feature compromises on free tiers.

---

<div align="center">
  <p><strong>🆓 Deploy FREE → Scale Seamlessly → Enterprise Ready</strong></p>
  <p><strong>ABACO Financial Intelligence Platform v2.0.0</strong></p>
  <p>Production-ready • AI-powered • 100% Free Deployment</p>
  <p>Built with ❤️ for the financial industry</p>
</div>
=======
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
>>>>>>> a420387e78678797632369e28629f802ce050805
