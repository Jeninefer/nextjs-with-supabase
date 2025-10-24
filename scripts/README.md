# Scripts Directory

This directory contains automation scripts for repository maintenance and service migration.

## Available Scripts

### migrate-to-free-services.sh

Automated migration script that transitions the application from paid services (Supabase, OpenAI) to 100% free alternatives.

**What it does:**
- Downloads and installs PocketBase (free backend/database)
- Installs free service dependencies (Gemini AI, Cloudinary, Netlify CLI)
- Creates `.env.local` with free service configuration templates
- Generates comprehensive migration documentation
- Updates `.gitignore` for PocketBase files
- Adds convenience scripts to `package.json`

**Usage:**
```bash
# From project root
bash scripts/migrate-to-free-services.sh

# Or with npm
npm run migrate:check  # After running the script once
```

**Prerequisites:**
- Node.js 18+
- npm
- Internet connection
- wget or curl

**Cost Savings:**
- Supabase → PocketBase: Save $25/month
- OpenAI → Google Gemini: Save $50/month  
- Supabase Storage → Cloudinary: Save $25/month
- Vercel Pro → Netlify Free: Save $20/month
- **Total: $120+/month → $0**

**After Running:**
1. Review generated `MIGRATION_GUIDE.md`
2. Get free API keys from providers
3. Update `.env.local` with real credentials
4. Start PocketBase: `npm run pocketbase:start`
5. Follow migration guide for code changes

### cleanup-repository.sh

Repository maintenance script for cleaning up generated files and artifacts.

**Usage:**
```bash
bash scripts/cleanup-repository.sh
```

## Service Migration Overview

### Free Services Stack

| Service | Provider | Free Tier |
|---------|----------|-----------|
| **Backend** | PocketBase | Unlimited (self-hosted) |
| **Database** | PocketBase (SQLite) | Unlimited (self-hosted) |
| **AI/ML** | Google Gemini | 15 req/min |
| **Storage** | Cloudinary | 25GB storage, 25GB bandwidth/month |
| **Deployment** | Netlify | 100GB bandwidth/month |
| **Auth** | PocketBase | Unlimited (self-hosted) |

### Migration Timeline

1. **Preparation** (5 minutes) - Run migration script
2. **API Keys** (10 minutes) - Sign up and get keys
3. **Configuration** (5 minutes) - Update `.env.local`
4. **Code Migration** (1-2 hours) - Update code to use new services
5. **Testing** (30 minutes) - Verify functionality
6. **Deployment** (15 minutes) - Deploy to Netlify

Total: ~2.5-3 hours for complete migration

## Development Workflow

### After Migration

```bash
# 1. Start PocketBase backend
npm run pocketbase:start

# 2. In another terminal, start Next.js
npm run dev

# 3. Deploy when ready
npm run deploy:netlify
```

## Troubleshooting

### Script Issues

**Permission Denied:**
```bash
chmod +x scripts/migrate-to-free-services.sh
```

**Download Failed:**
- Check internet connection
- Ensure wget or curl is installed
- Try manual download from GitHub releases

**PocketBase Won't Start:**
- Check if port 8090 is available
- Run `lsof -i :8090` to see what's using the port
- Change port in `backend/pocketbase/init.sh`

### Service Issues

See `MIGRATION_GUIDE.md` for detailed troubleshooting steps.

## Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Netlify Documentation](https://docs.netlify.com)

## Contributing

When adding new scripts:
1. Add execute permissions: `chmod +x scripts/your-script.sh`
2. Use proper error handling: `set -e`
3. Add colored output for better UX
4. Document the script in this README
5. Test on clean repository clone
