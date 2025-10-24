# Quick Start: Free Services Migration

**Migrate from paid services to 100% free alternatives in under 30 minutes!**

## 💰 Cost Savings

| Service | Before | After | Savings |
|---------|--------|-------|---------|
| Backend | Supabase ($25/mo) | PocketBase (Free) | $25/mo |
| AI/ML | OpenAI ($50/mo) | Google Gemini (Free) | $50/mo |
| Storage | Supabase ($25/mo) | Cloudinary (Free) | $25/mo |
| Deploy | Vercel Pro ($20/mo) | Netlify (Free) | $20/mo |
| **Total** | **$120+/month** | **$0/month** | **$120+/mo** |

## 🚀 Quick Migration (5 Steps)

### Step 1: Run Migration Script (2 minutes)

```bash
# From project root
bash scripts/migrate-to-free-services.sh
```

This will:
- ✅ Install PocketBase backend
- ✅ Install free service dependencies
- ✅ Create `.env.local` template
- ✅ Generate `MIGRATION_GUIDE.md`
- ✅ Update configuration files

### Step 2: Get Free API Keys (5 minutes)

Visit these links to get your free API keys:

1. **Google Gemini** (Free AI - 15 req/min)
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key
   - Copy key

2. **Cloudinary** (Free Storage - 25GB)
   - Visit: https://cloudinary.com/users/register/free
   - Sign up
   - Get: Cloud Name, API Key, API Secret

3. **Hugging Face** (Free ML Models - Unlimited)
   - Visit: https://huggingface.co/settings/tokens
   - Create token
   - Copy token

### Step 3: Update Configuration (1 minute)

Edit `.env.local` and replace placeholder values:

```env
# Replace these with your actual keys
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
GEMINI_API_KEY=your_actual_gemini_key
HUGGINGFACE_API_KEY=your_actual_hf_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Start PocketBase (30 seconds)

```bash
# Start PocketBase backend
npm run pocketbase:start
```

First time only:
1. Open http://127.0.0.1:8090/_/
2. Create admin account
3. Set up your data collections

### Step 5: Start Development (30 seconds)

In a new terminal:

```bash
# Start Next.js app
npm run dev
```

Open http://localhost:3000 - Your app is now running on 100% free services! 🎉

## 📚 Next Steps

### Code Migration

Update your code to use the new services:

**PocketBase (instead of Supabase):**
```javascript
// Before
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)

// After
import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
```

**Gemini (instead of OpenAI):**
```javascript
// Before
import OpenAI from 'openai'
const openai = new OpenAI()

// After
import { GoogleGenerativeAI } from "@google/generative-ai"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
```

See `MIGRATION_GUIDE.md` for complete code examples.

### Deploy to Netlify (Free)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify init
netlify deploy --prod
```

**Or use GitHub Actions:**
1. Add secrets to GitHub:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`
   - `POCKETBASE_URL` (your production PocketBase URL)
   - `GEMINI_API_KEY`
   - Cloudinary credentials

2. Push to main branch - automatic deployment! 🚀

## 🆘 Troubleshooting

### PocketBase won't start
```bash
# Check if port 8090 is in use
lsof -i :8090

# Kill process if needed
kill -9 <PID>

# Or change port in backend/pocketbase/init.sh
```

### API Key not working
- Double-check key is copied correctly
- Ensure no extra spaces in `.env.local`
- Restart development server after changing env vars

### Build errors
```bash
# Clear cache and rebuild
npm run clean
rm -rf .next
npm run build
```

## 📖 Additional Resources

- [Complete Migration Guide](./MIGRATION_GUIDE.md) - Detailed instructions
- [Scripts Documentation](./scripts/README.md) - All available scripts
- [PocketBase Docs](https://pocketbase.io/docs) - Backend documentation
- [Gemini API Docs](https://ai.google.dev/docs) - AI documentation
- [Cloudinary Docs](https://cloudinary.com/documentation) - Storage docs
- [Netlify Docs](https://docs.netlify.com) - Deployment docs

## ✅ Verification Checklist

After migration, verify:

- [ ] PocketBase runs at http://127.0.0.1:8090
- [ ] Admin UI accessible at http://127.0.0.1:8090/_/
- [ ] Development server runs without errors
- [ ] Environment variables loaded correctly
- [ ] Can authenticate users
- [ ] Can query data
- [ ] AI features work
- [ ] File uploads work (if used)
- [ ] Production build succeeds: `npm run build`
- [ ] Deployment works (Netlify)

## 💡 Tips

1. **Keep Supabase temporarily** - Comment out old env vars instead of deleting
2. **Test incrementally** - Migrate one feature at a time
3. **Use production PocketBase** - Consider PocketBase Cloud or self-host on free tier platforms
4. **Monitor usage** - Stay within free tier limits
5. **Backup data** - Export from Supabase before full migration

## 🎓 Learning Resources

New to these services? Start here:

- [PocketBase in 100 Seconds](https://www.youtube.com/watch?v=fN8a_8maVkE)
- [Google Gemini Tutorial](https://ai.google.dev/tutorials)
- [Cloudinary Getting Started](https://cloudinary.com/documentation/quick_start)
- [Netlify Deploy Tutorial](https://docs.netlify.com/get-started/)

---

**Questions?** Check `MIGRATION_GUIDE.md` or open an issue!

**Ready to save $120+/month?** Run the migration script now:
```bash
bash scripts/migrate-to-free-services.sh
```
