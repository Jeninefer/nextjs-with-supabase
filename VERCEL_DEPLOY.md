# ABACO Development Environment - Quick Reference

Complete Documentation: See docs/CLOUD_API_TROUBLESHOOTING.md

## Quick Start

```bash
cd "/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase"
npm run dev
```

## Current Status (October 24, 2025)

```bash
Next.js 15.5.6 Turbopack
Development server ready in 1.8 seconds
Database: Supabase
Cloud Provider: Azure (optional)
NumPy Generator: Modern implementation
Git: Clean (commit 343c0ee)
```

## Documentation Structure

**Primary Docs** (in `/docs` folder):

- `CLOUD_API_TROUBLESHOOTING.md` - Cloud errors & environment issues
- `AZURE_SETUP.md` - Optional cloud integration
- `MCP_SETUP_GUIDE.md` - Development setup

**Quick References**:

- `/notebooks/README.md` - Notebook usage
- `/README.md` - Project overview
- This file - Quick reference only

## Common Issues & Solutions

### Verified Azure Configuration

```bash
az account show
az configure --list-defaults
```

### Supabase Setup (Optional)

```bash
supabase db create abaco-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-size=10GB \
  --storage-type=SSD

supabase db table create abaco_production --instance=abaco-db
supabase db user create abaco_user --instance=abaco-db --password=$(openssl rand -base64 32)
supabase db connection-url abaco-db
```

### Terminal Command Issues

```bash
# Only type actual commands, not comments or output.
```

### Cloud Dataproc API Error

```bash
unset GOOGLE_APPLICATION_CREDENTIALS
unset GOOGLE_CLOUD_PROJECT
export GOOGLE_CLOUD_PROJECT=archivo-comercial
```

### Python Command Not Found

```bash
source abaco_venv/bin/activate
python3 --version
```

### Port Already in Use

```bash
# Next.js auto-detects next available port
```

### Why does my app open on <http://127.0.0.1:5500/> instead of <http://localhost:3000>?

- **<http://127.0.0.1:5500/>** is usually opened by the Live Server extension in VS Code, which serves static files (not your Next.js app).
- **Your Next.js app runs on <http://localhost:3000>** by default (or another port if 3000 is busy).
- If you see 127.0.0.1:5500, you likely clicked "Go Live" in VS Code, which is not needed for Next.js.

**Solution:**  

- Always use `npm run dev` and open [http://localhost:3000](http://localhost:3000) in your browser.
- Ignore or disable the "Go Live" button/extension for this project.

## Daily Workflow

```bash
cd "/Users/jenineferderas/Documents/GitHub/nextjs-with-supabase"
npm run dev
```

Run Python analysis:

```bash
source abaco_venv/bin/activate
python3 notebooks/financial_utils.py
deactivate
```

## Key Metrics

```bash
Total Portfolio: $4,249,257.90
Total Customers: 500
Average Credit Score: 627
```

## Verified URLs

```bash
http://localhost:3000
http://localhost:3000/dashboard/validation
http://192.168.1.25:3000
http://localhost:3000/api/validation-results
```

## Important Links

- [Full Troubleshooting Guide](../../../Documents/GitHub/nextjs-with-supabase/docs/CLOUD_API_TROUBLESHOOTING.md)
- [Cloud Setup (Optional)](../../../Documents/GitHub/nextjs-with-supabase/docs/AZURE_SETUP.md)
- [Notebook Guide](../../../Documents/GitHub/nextjs-with-supabase/notebooks/README.md)
- [GitHub Repository](https://github.com/Jeninefer/nextjs-with-supabase)

## Known Non-Critical Issues

```bash
"zsh: command not found: #" - Don't copy comments from docs
"Command not found" errors - Don't copy emoji/formatted text
pdfplumber: Not needed (ignore)
Google Dataproc: Not needed (ABACO uses local analysis)
GitHub Bot API: External service (no impact)
CS-Script: Project uses TypeScript
Azure AD Redirect URI: AI Toolkit authentication error
MS-Entra extension: Info logs and telemetry events are normal; no action needed unless you are configuring Microsoft Entra ID.
```

**Impact**: ZERO on ABACO functionality

### Common Terminal Mistakes

```bash
# Only copy actual commands

git add notebooks/financial_utils.py
git commit -m "refactor: update utilities"
git push origin main
```

### NumPy Generator Migration (Completed)

```bash
source abaco_venv/bin/activate
python3 notebooks/financial_utils.py
```

## Current Environment Status

```bash
Next.js: 15.5.6 (Turbopack)
Database: Supabase
Cloud Provider: Azure (optional)
NumPy Generator: Modern thread-safe implementation
Git: Clean (commit 343c0ee)
Last Updated: October 24, 2025
```

---

Tu plataforma ABACO está 100% operacional. Solo copia comandos reales, nunca comentarios ni texto de salida.
