# Figma Office Add-in with AI Integration

> PowerPoint add-in that integrates Figma designs with AI-powered content generation using OpenAI, xAI (Grok), and Figma APIs.

## 🚀 Quick Start

```bash
# Complete audit and setup
bash scripts/complete-audit.sh

# Or run individual scripts
bash scripts/fix-github-secrets.sh    # Check security
node scripts/test-urls.js              # Test API endpoints
bash scripts/setup-github.sh           # Setup GitHub
bash scripts/sync-repo.sh              # Sync to GitHub
```

## ⚠️ Security Notice

**IMPORTANT**: Before pushing to GitHub, ensure:
- No API keys in `.env` file are committed
- All secrets are in `.env` (not tracked by git)
- API keys are rotated if previously exposed

Run `bash scripts/fix-github-secrets.sh` to check for issues.

# Figma Office Add-in

PowerPoint add-in that imports Figma designs and generates AI-powered content using OpenAI, xAI (Grok), and Supabase.

## Features

- 🎨 **Figma Integration**: Import designs from Figma file nuVKwuPuLS7VmLFvqzOX1G
- 🤖 **AI Content Generation**: OpenAI GPT-4 and xAI Grok
- ☁️ **Cloud Storage**: Supabase backend
- 🚀 **Automated Deployment**: GitHub Actions + Vercel

## Quick Start

### Prerequisites

- Node.js v22.17.0+
- PowerPoint Desktop or Online
- API keys (Figma, OpenAI, xAI, Supabase)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev-server
```

### Sideload in PowerPoint

1. Open PowerPoint
2. Insert > My Add-ins > Upload My Add-in
3. Select manifest.xml
4. Click "Figma Import" in ribbon

## Configuration

Edit `.env`:

```env
FIGMA_ACCESS_TOKEN=your-token
FIGMA_FILE_KEY=nuVKwuPuLS7VmLFvqzOX1G
OPENAI_API_KEY=your-key
XAI_API_KEY=your-key
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
```

## Deployment

### GitHub Actions

Add secrets to repository, push to main branch for automatic deployment.

See: https://github.com/Jeninefer/OfficeAddinApps-Figma/settings/secrets/actions

### Manual

```bash
npm run build
vercel --prod
```

## Scripts

- `npm run dev-server` - Development
- `npm run build` - Production build
- `npm run lint` - Check code
- `npm start` - Debug in Office

## Documentation

- Figma API: https://www.figma.com/developers/api
- OpenAI: https://platform.openai.com/docs
- xAI: https://docs.x.ai/
- Supabase: https://supabase.com/docs
- Office Add-ins: https://learn.microsoft.com/office/dev/add-ins/

## Repository

https://github.com/Jeninefer/OfficeAddinApps-Figma
