# 🏢 Abaco Office Add-in - Figma Integration

> Office Add-in with Figma, OpenAI, and xAI API integrations for Abaco Technologies

[![Deploy to Vercel](https://github.com/Jeninefer/nextjs-with-supabase/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jeninefer/nextjs-with-supabase/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- ✅ **Office Add-in Integration** - PowerPoint, Word, Excel compatibility
- ✅ **Figma API** - Import designs and extract content
- ✅ **AI-Powered Content** - OpenAI GPT-4 and xAI Grok integration
- ✅ **Supabase Backend** - Real-time data and authentication
- ✅ **Abaco Presentation Slides** - Interactive React components
- ✅ **License Management** - Automated cleanup and detection tools
- ✅ **Security First** - Environment variable protection and pre-commit hooks

## 📦 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase
git checkout office-addin-figma
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys (see .env.example for details)
nano .env
```

### 3. Development

```bash
# Start development server
npm run dev

# Run in parallel terminal for type checking
npm run type-check

# Clean duplicate files
npm run clean:duplicates
```

## 🔧 Configuration

### Required API Keys

| Service | Get From | Environment Variable |
|---------|----------|---------------------|
| **Supabase** | [Dashboard](https://supabase.com/dashboard) | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| **OpenAI** | [Platform](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| **xAI (Grok)** | [Console](https://console.x.ai/) | `XAI_API_KEY` |
| **Figma** | [Settings](https://www.figma.com/settings) | `FIGMA_ACCESS_TOKEN` |

### GitHub Secrets (for CI/CD)

Add these to your repository secrets at:
`https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

### Project Guides

- [VS Code Extensions Guide](VSCODE_EXTENSIONS.md) - Recommended extensions and setup
- [AI APIs Integration](AI_APIS.md) - OpenAI, xAI, and Figma API usage
- [Supabase Integration](SUPABASE_GUIDE.md) - Backend setup and usage
- [Vercel Deployment](VERCEL_DEPLOY.md) - Deploy to production
- [GitHub Secrets](GITHUB_SECRETS.md) - CI/CD configuration

### External Documentation

- Figma API: <https://www.figma.com/developers/api>
- OpenAI: <https://platform.openai.com/docs>
- xAI: <https://docs.x.ai/>
- Supabase: <https://supabase.com/docs>
- Office Add-ins: <https://learn.microsoft.com/office/dev/add-ins/>

## 📁 Repository

<https://github.com/Jeninefer/OfficeAddinApps-Figma>
