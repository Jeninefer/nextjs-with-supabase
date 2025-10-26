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

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Google Cloud Run

#### Quick Deploy

```bash
# Using automated deployment script (recommended)
./scripts/deploy-gcp.sh

# Or manual deployment
gcloud run deploy abaco-platform --source . --region us-central1
```

#### Setup Requirements

Before deploying to Google Cloud, ensure you have:

1. **Google Cloud Project** with billing enabled
2. **Required IAM Permissions:**
   - `roles/editor` (recommended) or
   - `roles/run.developer` + `roles/iam.serviceAccountUser` + `roles/storage.admin`
3. **Required APIs enabled:**
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

#### Troubleshooting

If you encounter permission errors like:
```
Missing or blocked permissions: resourcemanager.projects.get
```

**Quick Solutions:**
- See: [Google Cloud Quick Start Guide](GOOGLE_CLOUD_QUICK_START.md)
- Full documentation: [docs/GOOGLE_CLOUD_SETUP.md](docs/GOOGLE_CLOUD_SETUP.md)
- Or contact your Google Cloud administrator to request access

**Common fixes:**
```bash
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Or create a new project where you have Owner permissions
gcloud projects create abaco-platform-$(date +%s) --name="ABACO Platform"
```

## 🔒 Security & Compliance

- GDPR compliant data handling
- SOX financial reporting standards
- Basel III banking regulations
- Enterprise-grade authentication

## 🛠️ Troubleshooting

For detailed setup instructions, error resolution, and platform status, see:

- [Complete Setup Guide](../Library/Application%20Support/Code/User/cs-script.user/integration-error.md)
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
git status
git pull origin main
git push origin main
```

**Python analysis not running:**

```bash
python3 notebooks/abaco_financial_intelligence.py
```

For comprehensive troubleshooting, environment status, and performance metrics, refer to the [Complete Setup Guide](../Library/Application%20Support/Code/User/cs-script.user/integration-error.md).

## 📄 License

Proprietary software. See [LICENSE](./LICENSE) for details.

## 🤝 Contributing

This is a proprietary platform. For authorized contributions, please contact the development team.

## 📞 Support

For technical support: <tech@abaco-platform.com>
For licensing: <legal@abaco-platform.com>

---

**ABACO Financial Intelligence Platform** - Setting the standard for financial analytics excellence.
