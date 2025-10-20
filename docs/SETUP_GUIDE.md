# ABACO Platform Setup Guide

Complete guide for setting up the ABACO Financial Intelligence Platform from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Setup](#environment-setup)
5. [Development Workflow](#development-workflow)
6. [Production Deployment](#production-deployment)
7. [Verification & Testing](#verification--testing)

---

## Prerequisites

### Required Software

- **Node.js** 18+ (check: `node --version`)
- **npm** 9+ (check: `npm --version`)
- **Git** (check: `git --version`)
- **Supabase Account** ([Sign up here](https://supabase.com))

### Optional Tools

- **Supabase CLI** (for local development)
- **Docker Desktop** (for local Supabase)
- **Python 3.8+** (for analytics notebooks)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Installation

```bash
# Type checking
npm run type-check

# Build
npm run build

# Expected: No errors
```

---

## Database Configuration

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure:
   - **Project Name:** abaco-financial-intelligence
   - **Database Password:** (save securely)
   - **Region:** Choose closest to your users
   - **Plan:** Start with Free tier

### Step 2: Apply Database Schema

1. Go to your Supabase Dashboard
2. Navigate to: **Database → SQL Editor**
3. Click "New Query"
4. Copy contents of: `supabase/migrations/001_create_abaco_schema.sql`
5. Paste and click "Run"
6. Verify success message

**What this creates:**
- `abaco_customers` table with all financial metrics
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Helpful views for statistics
- Automatic timestamp triggers

### Step 3: Import Customer Data

**Option A: Supabase Dashboard (Recommended)**

1. Navigate to: **Table Editor → abaco_customers**
2. Click "Insert" → "Import data from CSV"
3. Select file: `notebooks/financial_analysis_results.csv`
4. Map columns (should auto-detect)
5. Click "Import"
6. Verify: Should show ~1000 records

**Option B: Using Script**

```bash
./scripts/import-customer-data.sh
# Follow the interactive prompts
```

### Step 4: Verify Database

```bash
./scripts/verify-database.sh
```

Or manually check with SQL:

```sql
-- Run in Supabase SQL Editor
SELECT
  COUNT(*) as total_customers,
  AVG(account_balance) as avg_balance,
  AVG(credit_score) as avg_credit_score
FROM abaco_customers;
---

## Environment Setup

### Step 1: Get Supabase Credentials

1. Go to: **Project Settings → API**
2. Copy these values:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for server-side only)

### Step 2: Create Environment File

```bash
cp .env.example .env.local
```

### Step 3: Configure .env.local

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (SERVER SIDE ONLY - DO NOT EXPOSE TO CLIENT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: AI Integration Keys
XAI_API_KEY=xai-...
OPENAI_API_KEY=sk-proj-...
FIGMA_ACCESS_TOKEN=figd_...

# Optional: Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **Security Note:** Never commit `.env.local` to Git!

### Step 4: Verify Configuration

```bash
# Test environment variables
npm run dev

# In another terminal
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"...","checks":{"supabase":true,"database":true}}
```

---

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # TypeScript type checking
npm run lint             # ESLint checks

# Utilities
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run clean            # Clean build artifacts
```

### Development Best Practices

1. **Always check types before committing:**
   ```bash
   npm run type-check
   ```

2. **Build locally before pushing:**
   ```bash
   npm run build
   ```

3. **Follow commit conventions:**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update documentation"
   ```

See [Git Workflow Guide](./GIT_WORKFLOW.md) for detailed Git instructions.

---

## Production Deployment

### Prerequisites Checklist

Run the automated production readiness check:

```bash
./scripts/production-readiness-check.sh
```

Or manually verify:

- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] Customer data imported and verified
- [ ] Local build succeeds (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Health API returns OK
- [ ] Git repository is clean

### Deploying to Vercel

#### One-Time Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

#### Deploy

```bash
# Production deployment
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Wait for deployment
```

#### Configure Environment Variables in Vercel

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (mark as sensitive)
   - Additional API keys as needed
3. Redeploy to apply:
   ```bash
   vercel --prod
   ```

### Post-Deployment Verification

```bash
# Test production URL
curl https://your-app.vercel.app/api/health

# Expected: {"status":"ok",...,"checks":{"supabase":true}}
```

See [Production Checklist](../PRODUCTION_CHECKLIST.md) for comprehensive deployment guide.

---

## Verification & Testing

### Health Check

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://your-app.vercel.app/api/health
```

### Database Verification

Run verification script:

```bash
./scripts/verify-database.sh
```

Manual SQL verification:

```sql
-- Check table structure
\d abaco_customers;

-- Check data integrity
SELECT
  risk_category,
  COUNT(*) as count,
  AVG(credit_score) as avg_score,
  AVG(risk_score) as avg_risk
FROM abaco_customers
GROUP BY risk_category;
```

### API Testing

Test Supabase connection:

```bash
curl http://localhost:3000/api/test-supabase
```

### Frontend Testing

1. Navigate to dashboard: [http://localhost:3000/dashboard/financial](http://localhost:3000/dashboard/financial)
2. Verify all components load
3. Check for console errors
4. Test authentication flow

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### 2. Port 3000 already in use

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 3. Supabase connection fails

- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Verify API keys are not expired
- Test connection with `./scripts/verify-database.sh`

#### 4. Build fails

```bash
# Check for TypeScript errors
npm run type-check

# Check for missing dependencies
npm install

# Clear Next.js cache
npm run clean
npm run build
```

#### 5. Git issues

See [Git Workflow Guide](./GIT_WORKFLOW.md) for:
- Merge conflict resolution
- Commit message fixes
- Branch management
- Emergency recovery

---

## Next Steps

After completing setup:

1. **Explore the Dashboard**
   - Financial metrics overview
   - Risk analysis charts
   - AI-powered insights

2. **Customize for Your Needs**
   - Modify components in `app/dashboard/`
   - Add new API routes in `app/api/`
   - Update styling in Tailwind config

3. **Review Documentation**
   - [Production Checklist](../PRODUCTION_CHECKLIST.md)
   - [Git Workflow](./GIT_WORKFLOW.md)

4. **Monitor Performance**
   - Supabase Dashboard → Reports
   - Vercel Analytics (if deployed)
   - Browser DevTools → Network/Performance

---

## Support

### Resources

- **Documentation:** `/docs` folder
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

### Getting Help

For issues or questions:

1. Check troubleshooting section above
2. Review relevant documentation
3. Search GitHub issues
4. Contact technical support

---

## Summary

You should now have:

✅ Repository cloned and dependencies installed  
✅ Supabase project configured with schema  
✅ Customer data imported  
✅ Environment variables set up  
✅ Local development server running  
✅ Health checks passing  

**Ready to deploy?** Follow the [Production Deployment](#production-deployment) section.

**Need help?** See [Troubleshooting](#troubleshooting) section.
