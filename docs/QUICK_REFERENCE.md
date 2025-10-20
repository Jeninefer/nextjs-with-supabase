# ABACO Platform - Quick Command Reference

## 🚀 Essential Commands

### Start Development
```bash
npm run dev                    # Start dev server at http://localhost:3000
```

### Build & Deploy
```bash
npm run build                  # Build for production
npm run start                  # Start production server
vercel --prod                  # Deploy to Vercel
```

### Code Quality
```bash
npm run type-check             # TypeScript type checking
npm run lint                   # Lint code
npm run format                 # Format code with Prettier
```

---

## 📊 Database Commands

### Production Readiness Check
```bash
./scripts/production-readiness-check.sh   # Complete production readiness verification
```

### Verify Database Setup
```bash
./scripts/verify-database.sh   # Comprehensive database verification
```

### Import Data
```bash
./scripts/import-customer-data.sh   # Interactive data import guide
```

### Quick SQL Queries (in Supabase SQL Editor)
```sql
-- Check customer count
SELECT COUNT(*) FROM abaco_customers;

-- View summary statistics
SELECT * FROM abaco_customer_stats;

-- Check high-risk customers
SELECT * FROM abaco_customers 
WHERE risk_category = 'High' 
LIMIT 10;
```

---

## 🔧 Git Commands

### Daily Workflow
```bash
git status                     # Check status
git add .                      # Stage all changes
git commit -m "message"        # Commit with message
git push origin main           # Push to remote
```

### Sync with Remote
```bash
git pull origin main           # Pull latest changes
git log --oneline -5           # View recent commits
```

### Fix Common Issues
```bash
git reset --soft HEAD~1        # Undo last commit (keep changes)
git clean -fd                  # Remove untracked files
```

📖 **Detailed Guide:** See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)

---

## 🔍 Testing & Verification

### API Health Check
```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://your-app.vercel.app/api/health
```

### Test Supabase Connection
```bash
curl http://localhost:3000/api/test-supabase
```

### Check Environment
```bash
# Verify .env.local exists
ls -la .env.local

# Test environment variables (dev server must be running)
curl http://localhost:3000/api/health | jq '.checks'
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
lsof -i :3000                  # Find process using port 3000
kill -9 <PID>                  # Kill process
# OR
PORT=3001 npm run dev          # Use different port
```

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Build Cache
```bash
npm run clean                  # Clean Next.js cache
rm -rf .next out
npm run build
```

### Database Connection Issues
```bash
./scripts/verify-database.sh   # Run verification script
# Check .env.local has correct Supabase credentials
```

---

## 📁 Important Files & Locations

### Configuration
- `.env.local` - Environment variables (create from .env.example)
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

### Database
- `supabase/migrations/001_create_abaco_schema.sql` - Database schema
- `notebooks/financial_analysis_results.csv` - Customer data

### Documentation
- `docs/SETUP_GUIDE.md` - Complete setup guide
- `docs/GIT_WORKFLOW.md` - Git workflow guide
- `PRODUCTION_CHECKLIST.md` - Production deployment checklist
- `README.md` - Project overview

### Scripts
- `scripts/verify-database.sh` - Database verification
- `scripts/import-customer-data.sh` - Data import guide

---

## 🌐 Important URLs

### Local Development
- Frontend: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard/financial
- Health API: http://localhost:3000/api/health

### Supabase Dashboard
- Main: https://supabase.com/dashboard
- Your Project: https://supabase.com/dashboard/project/[your-project-ref]
- SQL Editor: https://supabase.com/dashboard/project/[your-project-ref]/sql
- Table Editor: https://supabase.com/dashboard/project/[your-project-ref]/editor

### Deployment
- Vercel Dashboard: https://vercel.com/dashboard
- Production URL: (set after deployment)

---

## 📞 Quick Help

### Setup Issues?
1. Run: `./scripts/verify-database.sh`
2. Check: `docs/SETUP_GUIDE.md`
3. Review: `.env.local` configuration

### Git Issues?
1. Check: `git status`
2. Review: `docs/GIT_WORKFLOW.md`
3. Common fixes in troubleshooting section above

### Build Errors?
1. Run: `npm run type-check`
2. Run: `npm run clean && npm run build`
3. Check for missing dependencies: `npm install`

---

## 🎯 Production Deployment Checklist

Before deploying:
- [ ] Run: `./scripts/production-readiness-check.sh`
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] `.env.local` configured correctly
- [ ] Database schema applied
- [ ] Customer data imported
- [ ] Health API returns OK
- [ ] All changes committed to Git

Deploy:
```bash
git push origin main           # Push changes
vercel --prod                  # Deploy to Vercel
```

Verify:
```bash
curl https://your-app.vercel.app/api/health
```

📖 **Full Guide:** See [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md)

---

## 💡 Tips

- Always run `npm run type-check` before committing
- Use `git status` frequently to track changes
- Keep `.env.local` secure and never commit it
- Run `./scripts/verify-database.sh` to check setup
- Review build output for warnings
- Test locally before deploying to production

---

**Need more details?** Check the full documentation in the `/docs` folder.
