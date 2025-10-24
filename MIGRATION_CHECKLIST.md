# Migration Checklist

Use this checklist to track your migration from paid services to free alternatives.

## Pre-Migration (5 minutes)

- [ ] Review [Service Comparison](./SERVICE_COMPARISON.md) to understand differences
- [ ] Read [Quick Start Migration Guide](./QUICK_START_MIGRATION.md)
- [ ] Backup your current `.env.local` file
- [ ] Ensure you have Node.js 18+ and npm installed
- [ ] Verify git status is clean (`git status`)

## Run Migration Script (5 minutes)

- [ ] Run: `bash scripts/migrate-to-free-services.sh`
- [ ] Verify PocketBase was installed in `backend/pocketbase/`
- [ ] Confirm `.env.local` was created
- [ ] Review generated `MIGRATION_GUIDE.md`
- [ ] Check that npm dependencies were installed

## Get Free API Keys (10 minutes)

### Google Gemini (Free AI)
- [ ] Visit: https://makersuite.google.com/app/apikey
- [ ] Create Google account if needed
- [ ] Generate API key
- [ ] Copy key to `.env.local` as `GEMINI_API_KEY`

### Cloudinary (Free Storage)
- [ ] Visit: https://cloudinary.com/users/register/free
- [ ] Sign up for free account
- [ ] Get Cloud Name from dashboard
- [ ] Get API Key from dashboard
- [ ] Get API Secret from dashboard
- [ ] Update `.env.local` with all three values

### Hugging Face (Optional)
- [ ] Visit: https://huggingface.co/settings/tokens
- [ ] Create account if needed
- [ ] Generate access token
- [ ] Copy to `.env.local` as `HUGGINGFACE_API_KEY`

## Configure PocketBase (5 minutes)

- [ ] Start PocketBase: `npm run pocketbase:start`
- [ ] Open http://127.0.0.1:8090/_/
- [ ] Create admin account (remember credentials!)
- [ ] Explore admin UI to familiarize yourself
- [ ] Keep PocketBase running in terminal

## Start Development (2 minutes)

- [ ] Open new terminal window
- [ ] Run: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify application loads without errors
- [ ] Check browser console for errors

## Update Code (30-60 minutes)

### Authentication
- [ ] Replace Supabase auth imports with PocketBase
- [ ] Update login/signup functions
- [ ] Update session handling
- [ ] Test authentication flow

### Database Queries
- [ ] Replace Supabase queries with PocketBase SDK
- [ ] Update collection names if needed
- [ ] Test CRUD operations
- [ ] Verify real-time subscriptions work

### File Uploads (if used)
- [ ] Replace Supabase Storage with Cloudinary
- [ ] Update upload functions
- [ ] Update file URLs
- [ ] Test file upload/download

### AI Features (if used)
- [ ] Replace OpenAI imports with Gemini
- [ ] Update API calls
- [ ] Test AI responses
- [ ] Verify streaming works

## Testing (15 minutes)

### Functional Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test user logout
- [ ] Test data fetching
- [ ] Test data creation
- [ ] Test data updates
- [ ] Test data deletion
- [ ] Test file uploads (if applicable)
- [ ] Test AI features (if applicable)

### Performance Testing
- [ ] Check page load times
- [ ] Test with network throttling
- [ ] Verify real-time updates
- [ ] Check mobile responsiveness

## Production Setup (15 minutes)

### PocketBase Production
- [ ] Choose hosting option:
  - [ ] PocketBase Cloud (easiest)
  - [ ] Self-host on VPS (DigitalOcean, Linode, etc.)
  - [ ] Self-host on Platform.sh
  - [ ] Self-host on Fly.io
- [ ] Set up production PocketBase instance
- [ ] Configure SSL/HTTPS
- [ ] Update `NEXT_PUBLIC_POCKETBASE_URL` in production env

### Netlify Deployment
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Initialize: `netlify init`
- [ ] Configure environment variables in Netlify dashboard
- [ ] Deploy: `netlify deploy --prod`
- [ ] Test production URL

### GitHub Actions (Optional)
- [ ] Add Netlify secrets to GitHub:
  - [ ] `NETLIFY_AUTH_TOKEN`
  - [ ] `NETLIFY_SITE_ID`
- [ ] Add service secrets to GitHub:
  - [ ] `POCKETBASE_URL`
  - [ ] `GEMINI_API_KEY`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Push to main branch
- [ ] Verify automatic deployment works

## Post-Migration Verification (10 minutes)

### Functionality
- [ ] All pages load correctly
- [ ] Authentication works in production
- [ ] Database operations work
- [ ] File uploads work (if applicable)
- [ ] AI features work (if applicable)
- [ ] Real-time features work

### Performance
- [ ] Page speed is acceptable
- [ ] API responses are fast
- [ ] No console errors
- [ ] No broken links
- [ ] Images load properly

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot - free)
- [ ] Configure error tracking (Sentry - free tier)
- [ ] Set up analytics (Plausible - free tier)
- [ ] Monitor API usage to stay within free tiers

## Cleanup (5 minutes)

### Remove Old Services (Optional)
- [ ] Export any remaining data from Supabase
- [ ] Cancel Supabase subscription
- [ ] Cancel OpenAI subscription
- [ ] Cancel Vercel Pro subscription (if not using)
- [ ] Remove old API keys from `.env.local`

### Documentation
- [ ] Update your project documentation
- [ ] Document any custom migration steps
- [ ] Update team on new stack
- [ ] Share production URLs

## Success! 🎉

Congratulations! You've successfully migrated to 100% free services.

### Monthly Savings
- **Before:** $120-270/month
- **After:** $0/month
- **Annual Savings:** $1,440-3,240/year

### What You're Now Using
- ✅ PocketBase (Backend + Database) - Free
- ✅ Google Gemini (AI) - Free
- ✅ Cloudinary (Storage) - Free
- ✅ Netlify (Deployment) - Free

### Next Steps
- [ ] Monitor usage to ensure staying within free tiers
- [ ] Consider upgrading specific services if needed
- [ ] Share your migration success story
- [ ] Help others migrate with your experience

## Troubleshooting

If you encounter issues, check:
1. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Comprehensive guide
2. [Quick Start Guide](./QUICK_START_MIGRATION.md) - Common solutions
3. [Service Comparison](./SERVICE_COMPARISON.md) - Service details
4. GitHub Issues - Community support

## Rollback Plan

If you need to rollback:
1. Restore `.env.local.backup.[timestamp]` file
2. Revert code changes: `git checkout [previous-commit]`
3. Restart services
4. Verify everything works

Your data is safe - PocketBase and Supabase can coexist during transition.

---

**Time Estimate:** Total migration time: 1.5-2.5 hours  
**Difficulty:** Intermediate  
**Cost Savings:** $120-270/month → $0/month

**Questions?** See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) or open an issue!
