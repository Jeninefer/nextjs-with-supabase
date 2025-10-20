# ABACO Production Deployment Checklist

## ✅ PRE-DEPLOYMENT VERIFICATION

### 1. Environment Variables - CRITICAL ⚠️

**Supabase Production:**

```bash
# REQUIRED in production
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SERVER ONLY ⚠️

# AI Integration
XAI_API_KEY=xai-... # Grok API
OPENAI_API_KEY=sk-proj-... # OpenAI GPT-4
FIGMA_ACCESS_TOKEN=figd_... # Design system

# Optional
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Verification Commands:**

```bash
# Check Vercel environment variables
vercel env ls

# Verify Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/

# Test API routes
curl https://yourdomain.com/api/health
```

---

### 2. Supabase Configuration

**A) Verify Project Settings:**

```bash
# Go to: https://supabase.com/dashboard/project/[your-project]/settings/general
✅ Project Name: abaco-financial-intelligence
✅ Region: Closest to users (us-east-1, eu-west-1, etc.)
✅ Database version: PostgreSQL 15+
✅ Plan: Free/Pro (check limits)
```

**B) Check Extensions:**

```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_available_extensions
WHERE installed_version IS NOT NULL;

-- Required extensions:
-- ✅ pgcrypto (for UUID generation)
-- ✅ pg_stat_statements (for performance monitoring)
-- Optional: vector (for AI/ML features)
```

**C) Verify RLS (Row Level Security):**

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verify policies exist
SELECT * FROM pg_policies
WHERE schemaname = 'public';

-- Test RLS policy
-- Should return data for authenticated users only
SELECT * FROM abaco_customers LIMIT 1;
```

**D) Database Migrations:**

```bash
# Verify all migrations applied
# Go to: https://supabase.com/dashboard/project/[your-project]/database/migrations

✅ 001_create_abaco_schema.sql - Applied
✅ Check timestamp matches latest version
```

---

### 3. Data Import Verification

**Import ABACO Customer Data:**

```bash
# Option A: Supabase Dashboard
# 1. Go to Table Editor → abaco_customers
# 2. Import CSV → notebooks/financial_analysis_results.csv
# 3. Verify row count: 1,000 records

# Option B: Command Line (using psql)
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  -c "\COPY abaco_customers(customer_id, account_balance, ...) \
      FROM 'notebooks/financial_analysis_results.csv' CSV HEADER"

# Verify data imported
SELECT COUNT(*) FROM abaco_customers;
-- Example expected value (from initial dataset): 1000
-- NOTE: These values are examples from the initial dataset and may change as data evolves.
-- For current expected values, refer to the dataset documentation in notebooks/README.md or the data source at notebooks/financial_analysis_results.csv.

SELECT
  COUNT(*) as total_customers,
  AVG(account_balance) as avg_balance,
  AVG(credit_score) as avg_credit_score
FROM abaco_customers;
-- Example expected values (initial dataset): total_customers=1000, avg_balance≈9804.12, avg_credit_score≈606.40
-- NOTE: These are example values; actual results may vary. See dataset documentation for up-to-date statistics.

---

### 4. Security Verification

**A) RLS Policies Test:**

```typescript
// filepath: scripts/test-rls-policies.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Server only

async function testRLS() {
  // Test 1: Anon key should NOT access without auth
  const anonClient = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: anonData, error: anonError } = await anonClient
    .from("abaco_customers")
    .select("*")
    .limit(1);

  console.log("Anon access (should fail):", {
    success: !anonError,
    error: anonError?.message,
    data: anonData,
  });

  // Test 2: Service role should have full access
  const serviceClient = createClient(supabaseUrl, serviceKey);

  const { data: serviceData, error: serviceError } = await serviceClient
    .from("abaco_customers")
    .select("*")
    .limit(1);

  console.log("Service role access (should succeed):", {
    success: !serviceError,
    count: serviceData?.length,
  });
}

testRLS();
```

**B) Environment Variable Security:**

```bash
# NEVER commit these to git:
❌ .env.local (ignored by .gitignore)
❌ .env (ignored by .gitignore)
❌ Hard-coded API keys

# ALWAYS use environment variables in CI/CD:
✅ Vercel: Settings → Environment Variables
✅ GitHub Actions: Settings → Secrets
✅ Other platforms: Check their docs
```

---

### 5. Performance & Monitoring

**A) Set Up Supabase Realtime (Optional):**

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE abaco_customers;
```

**B) Create Database Indexes:**

```sql
-- Verify indexes exist (already in schema)
\di abaco_customers*

-- Expected indexes:
-- ✅ idx_customer_id
-- ✅ idx_risk_category
-- ✅ idx_credit_score
-- ✅ idx_account_balance

-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM abaco_customers
WHERE risk_category = 'High Risk';
-- Should use idx_risk_category
```

**C) Enable Monitoring:**

```bash
# Supabase Dashboard:
# 1. Go to Reports → Performance
# 2. Enable query performance tracking
# 3. Set up alerts for:
#    - High CPU usage (>80%)
#    - Slow queries (>1s)
#    - Connection pool exhaustion

# Vercel Dashboard:
# 1. Go to Analytics → Speed Insights
# 2. Enable Real User Monitoring (RUM)
# 3. Set up alerts for:
#    - 5xx errors
#    - High latency (>2s)
#    - Build failures
```

---

### 6. API Routes Testing

**Test All ABACO API Endpoints:**

```bash
# Test Grok AI endpoint
curl -X POST https://yourdomain.com/api/ai/grok-insights \
  -H "Content-Type: application/json" \
  -d '{"customerData":{"credit_score":650,"utilization":0.3}}'

# Test ABACO metrics endpoint
curl https://yourdomain.com/api/abaco/metrics

# Test health check (create this endpoint)
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","version":"1.0.0","timestamp":"2025-01-XX"}
```

---

### 7. SSL/TLS & Domain Verification

**A) Verify SSL Certificate:**

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Expected output:
# ✅ Verify return code: 0 (ok)
# ✅ Valid certificate chain
# ✅ Not expired
```

**B) Verify DNS Configuration:**

```bash
# Check DNS records
dig yourdomain.com

# Expected:
# ✅ A record points to Vercel IP
# ✅ CNAME for www subdomain (optional)
# ✅ SSL/TLS certificate auto-provisioned
```

---

### 8. Backup Strategy

**A) Supabase Automated Backups:**

```bash
# Go to: https://supabase.com/dashboard/project/[your-project]/settings/database

✅ Point-in-Time Recovery (PITR): Enabled (Pro plan)
✅ Daily snapshots: Enabled
✅ Retention: 7 days (Free), 30 days (Pro)
```

**B) Manual Backup Script:**

```bash
# filepath: scripts/backup-database.sh
#!/bin/bash

PROJECT_REF="your-project-ref"
PASSWORD="your-db-password"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump "postgresql://postgres:$PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres" \
  --schema=public \
  --data-only \
  --file="$BACKUP_DIR/abaco_backup_$DATE.sql"

echo "Backup completed: $BACKUP_DIR/abaco_backup_$DATE.sql"

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/abaco_backup_$DATE.sql s3://your-bucket/
```

---

### 9. CI/CD Pipeline Verification

**GitHub Actions Workflow:**

```yaml
# filepath: .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

### 10. Post-Deployment Testing

**A) Smoke Tests:**

```bash
# Run after each deployment
curl -f https://yourdomain.com || exit 1
curl -f https://yourdomain.com/api/health || exit 1
curl -f https://yourdomain.com/dashboard || exit 1
```

**B) Load Testing (Optional):**

```bash
# Install Apache Bench
brew install ab

# Test API endpoint
ab -n 1000 -c 10 https://yourdomain.com/api/abaco/metrics

# Expected:
# ✅ 99% of requests < 500ms
# ✅ 0% failed requests
# ✅ Throughput > 100 req/s
```

---

## 🚨 PRODUCTION DEPLOYMENT STEPS

### Step-by-Step Guide:

**1. Final Local Verification:**

```bash
cd ~/Documents/GitHub/nextjs-with-supabase

# Verify clean state
git status

# Run production build locally
npm run build
npm run start

# Test locally
open http://localhost:3000
```

**2. Commit and Push:**

```bash
git add .
git commit -m "chore: production-ready configuration"
git push origin main
```

**3. Deploy to Vercel:**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts:
# ✅ Link to existing project
# ✅ Confirm production deployment
# ✅ Wait for build to complete
```

**4. Configure Supabase:**

```bash
# 1. Create project at https://supabase.com/dashboard
# 2. Run SQL schema (from supabase/migrations/001_create_abaco_schema.sql)
# 3. Import CSV data
# 4. Copy credentials to Vercel
```

**5. Set Vercel Environment Variables:**

```bash
# Add each variable in Vercel dashboard:
# Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # MARK AS SECRET ⚠️
XAI_API_KEY=xai-...
OPENAI_API_KEY=sk-proj-...
FIGMA_ACCESS_TOKEN=figd_...
```

**6. Redeploy with Environment Variables:**

```bash
# Trigger new deployment to pick up env vars
vercel --prod
```

**7. Final Verification:**

```bash
# Test production URL
curl https://your-deployment-url.vercel.app

# Test API
curl https://your-deployment-url.vercel.app/api/health

# Test dashboard
open https://your-deployment-url.vercel.app/dashboard
```

---

## ✅ PRODUCTION READINESS CHECKLIST

### Before Going Live:

- [ ] ✅ All environment variables configured in Vercel
- [ ] ✅ Supabase project created and schema applied
- [ ] ✅ ABACO data imported (1,000 customers)
- [ ] ✅ RLS policies enabled and tested
- [ ] ✅ SSL certificate verified
- [ ] ✅ API endpoints tested
- [ ] ✅ Monitoring and alerts configured
- [ ] ✅ Backup strategy in place
- [ ] ✅ Performance tested
- [ ] ✅ Custom domain configured (optional)

### Post-Launch Monitoring:

- [ ] ✅ Check error logs daily (first week)
- [ ] ✅ Monitor performance metrics
- [ ] ✅ Test user flows
- [ ] ✅ Verify data integrity
- [ ] ✅ Test backup restoration

---

## 📊 PRODUCTION METRICS TO MONITOR

### Supabase Dashboard:

- **Database size**: < 500 MB (Free), < 8 GB (Pro)
- **Active connections**: < 60 (Free), < 200 (Pro)
- **Query performance**: < 100ms average
- **Error rate**: < 0.1%

### Vercel Analytics:

- **Response time**: < 500ms p95
- **Error rate**: < 0.5%
- **Build time**: < 5 minutes
- **Deployment success**: > 99%

### Application Health:

- **API availability**: > 99.9%
- **Data accuracy**: 100% (spot check daily)
- **User experience**: No reported issues

---

## 🆘 EMERGENCY ROLLBACK

If production deployment fails:

```bash
# Option 1: Revert via Vercel Dashboard
# Go to Deployments → Previous Deployment → Promote to Production

# Option 2: Revert via CLI
vercel rollback

# Option 3: Deploy specific commit
git revert HEAD
git push origin main
vercel --prod
```

---

## 🎉 PRODUCTION LAUNCH COMPLETE

Once all checkboxes are ✅, your ABACO Financial Intelligence Platform is **LIVE IN PRODUCTION**! 🚀

**Your platform is now serving real users with enterprise-grade reliability.** 💼📊✨
