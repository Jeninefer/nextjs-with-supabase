# Cloud API Configuration and Troubleshooting

## Quick Resolution Guide

### Problem: Cloud Dataproc API Error

If you see an error like:
```
Error: Cloud Dataproc API has not been used in project gen-lang-client-XXXXXXXXX 
before or it is disabled.
```

**This is an environment configuration issue, not a code problem.**

### Quick Fix (Most Users)

The ABACO Financial Intelligence Platform runs entirely locally and does **not** require Google Cloud Platform:

```bash
# 1. Clear any GCP environment variables
unset GOOGLE_APPLICATION_CREDENTIALS
unset GOOGLE_CLOUD_PROJECT

# 2. Set up local Python environment
./setup_abaco_environment.sh

# 3. Verify setup
./verify_abaco_environment.sh

# 4. Run the notebook locally
source abaco_venv/bin/activate
jupyter notebook notebooks/abaco_financial_intelligence_unified.ipynb
```

### Root Cause

The error occurs when:
1. Your shell environment has Google Cloud credentials configured
2. Some code (possibly from another project) tries to use GCP services
3. The specified GCP project doesn't have the Dataproc API enabled

The ABACO notebook itself doesn't use Cloud Dataproc - this is an environment configuration issue.

## Complete Solution Paths

### Path 1: Local-Only Setup (Recommended for Getting Started)

**Best for:** Learning, development, testing, small datasets

**Advantages:**
- No cloud costs
- Fastest setup
- No API configuration needed
- Works offline

**Setup:**
```bash
# Install Python 3 if needed
# macOS: brew install python3
# Ubuntu: sudo apt-get install python3 python3-pip python3-venv

# Set up ABACO environment
chmod +x setup_abaco_environment.sh
./setup_abaco_environment.sh

# Verify installation
chmod +x verify_abaco_environment.sh
./verify_abaco_environment.sh

# Start working
source abaco_venv/bin/activate
jupyter notebook
```

See: [notebooks/README.md](../notebooks/README.md)

### Path 2: Supabase Integration (Recommended for Production) ✨

**Best for:** Production apps, persistent data, team collaboration, real-time features

**Advantages:**
- ✅ **Free tier**: 500MB database, 1GB storage, no credit card required
- ✅ **PostgreSQL**: Industry-standard relational database
- ✅ **Managed**: Automatic backups, updates, and scaling
- ✅ **Auth included**: User management built-in
- ✅ **Real-time**: Live data subscriptions

**Prerequisites:**
- Free Supabase account (no credit card required)

**Setup:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Copy your project URL and anon key from Settings > API
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Install Supabase client:
   ```bash
   pip install supabase
   ```

**Usage in notebooks:**
```python
from supabase_connector import get_connection

db = get_connection()
if db:
    results = db.query("customers", limit=10)
    db.disconnect()
```

See: [notebooks/supabase_connector.py](../notebooks/supabase_connector.py)

### Path 3: Google Cloud Integration (Enterprise Only)

**Best for:** Large enterprises with existing GCP infrastructure

**Prerequisites:**
- Google Cloud Platform account with billing enabled
- Understanding of GCP services and costs
- Budget for cloud resources (~$50-500+/month)

**⚠️ Note:** This is an advanced option and not recommended for most users. Use Supabase (Path 2) for a free, managed database instead.

**Setup:**
1. Follow the comprehensive guide: [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md)
2. Enable required APIs in your GCP project
3. Create and configure service account
4. Set environment variables in `.env.local`

## Environment Variables Guide

### Supabase (Required for Web App)

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
```

### Google Cloud (Optional - Advanced Use Only)

```bash
# Only add these if you specifically need GCP integration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Cloud SQL (optional)
CLOUD_SQL_CONNECTION_NAME=project:region:instance
CLOUD_SQL_DATABASE=abaco_production
CLOUD_SQL_USERNAME=abaco_user
CLOUD_SQL_PASSWORD=your-secure-password
```

⚠️ **Important:** If you're just running notebooks locally, **do not** set the Google Cloud variables!

## Troubleshooting Decision Tree

### 1. Python Command Not Found

**Error:** `/bin/sh: python: command not found`

**Solution:**
```bash
# Check if Python 3 is installed
python3 --version

# If not installed:
# macOS: brew install python3
# Ubuntu: sudo apt-get install python3 python3-pip python3-venv

# Verify
which python3
```

### 2. Cloud API Errors

**Error:** Any message about "Cloud Dataproc API", "Cloud SQL API", or GCP services

**Check:**
```bash
# Are GCP variables set?
env | grep GOOGLE

# If yes and you don't need GCP:
unset GOOGLE_APPLICATION_CREDENTIALS
unset GOOGLE_CLOUD_PROJECT
```

**If you DO need GCP:**
- See [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md)
- Enable the specific API mentioned in the error
- Verify service account has proper permissions

### 3. Package Import Errors

**Error:** `ModuleNotFoundError: No module named 'plotly'` or similar

**Solution:**
```bash
# Activate environment first
source abaco_venv/bin/activate

# Verify activation
echo $VIRTUAL_ENV  # Should show path to abaco_venv

# Install/reinstall packages
pip install -r notebooks/requirements.txt

# Test
python -c "import plotly, pandas, numpy; print('✅ Success!')"
```

### 4. Jupyter Kernel Issues

**Error:** "ABACO Environment" kernel not available

**Solution:**
```bash
# Activate environment
source abaco_venv/bin/activate

# Re-register kernel
python -m ipykernel install --user --name=abaco_env --display-name="ABACO Environment"

# Restart Jupyter
jupyter notebook
```

## Verification Checklist

Run this after setup:

```bash
./verify_abaco_environment.sh
```

Expected output:
- ✅ Python installed
- ✅ Virtual environment exists
- ✅ No Google Cloud variables (for local use)
- ✅ Documentation present

## Cost Considerations

### Local Development (Free)
- ✅ All processing on your machine
- ✅ No cloud service charges
- ✅ No API quotas to worry about
- ✅ Perfect for learning and development

### Supabase (Free Tier Available) ✨
- ✅ **Free forever**: Up to 500MB database
- ✅ **No credit card**: Free tier doesn't require payment info
- ✅ **1GB file storage**: Included in free tier
- ✅ **50,000 monthly active users**: More than enough for most apps
- ✅ **Social OAuth**: Google, GitHub, etc. included
- 💰 **Paid tiers**: Start at $25/month for 8GB database (optional)

**Recommendation:** Use Supabase for any app that needs a database. The free tier is generous and perfect for most use cases.

### Google Cloud Integration (Paid Only)
- 💰 Cloud SQL: ~$10-50/month for small instances (no free tier)
- 💰 Cloud Storage: ~$0.02/GB/month
- 💰 Cloud Dataproc: ~$0.01/cluster/hour + compute costs
- 💰 API calls: Usually included in free tier but may incur costs at scale
- ⚠️ **Not recommended**: Use Supabase instead for free managed database

**Recommendation:** Start with local development for learning. Use Supabase (free) for production apps. Only use Google Cloud if you have specific enterprise requirements.

## Documentation Index

- **[notebooks/README.md](../notebooks/README.md)** - Complete notebook setup and usage guide
- **[notebooks/supabase_connector.py](../notebooks/supabase_connector.py)** - Free Supabase database connector ✨
- **[notebooks/cloudsql_connector.py](../notebooks/cloudsql_connector.py)** - Google Cloud SQL connector (enterprise)
- **[docs/GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)** - Detailed GCP integration guide
- **[README.md](../README.md)** - Main platform documentation
- **[.env.example](../.env.example)** - Environment variable template

## Getting Help

### Self-Service Resources

1. **Run verification script:**
   ```bash
   ./verify_abaco_environment.sh
   ```

2. **Check Python environment:**
   ```bash
   source abaco_venv/bin/activate
   python -c "import sys; print(sys.version)"
   pip list
   ```

3. **Check environment variables:**
   ```bash
   env | grep -E "GOOGLE|SUPABASE|CLOUD"
   ```

### Common Questions

**Q: Do I need a Google Cloud account to use ABACO?**  
A: No. The platform runs entirely locally by default.

**Q: Why am I seeing Cloud API errors?**  
A: Your environment has GCP credentials configured. Either disable them or enable the required APIs in your GCP project.

**Q: How do I know if I'm using the virtual environment?**  
A: Your shell prompt should show `(abaco_venv)` prefix, and `echo $VIRTUAL_ENV` should show a path.

**Q: Can I use this on Windows?**  
A: Yes, but you'll need to adjust the shell scripts. On Windows, activate with: `abaco_venv\Scripts\activate`

**Q: The setup script failed partway through. What do I do?**  
A: Delete the `abaco_venv` directory and run `./setup_abaco_environment.sh` again.

### Contact Support

- **Technical Issues:** [Report a bug or request help on GitHub Issues](https://github.com/Jeninefer/nextjs-with-supabase/issues)
- **GCP-Specific:** [Google Cloud Support](https://cloud.google.com/support)

## Best Practices

### Security

1. ✅ Never commit `.env.local` or service account keys to version control
2. ✅ Use different credentials for development and production
3. ✅ Rotate API keys and passwords regularly
4. ✅ Use environment variables, never hardcode credentials

### Development Workflow

1. ✅ Always activate virtual environment before working
2. ✅ Test changes incrementally with small datasets
3. ✅ Clear notebook output before committing to Git
4. ✅ Keep packages updated: `pip install -r requirements.txt --upgrade`

### Cost Management

1. ✅ Use local development by default
2. ✅ Set up billing alerts in GCP Console
3. ✅ Delete unused cloud resources regularly
4. ✅ Use appropriate instance sizes (don't over-provision)

## Next Steps

1. **First Time Setup:**
   ```bash
   ./setup_abaco_environment.sh
   ./verify_abaco_environment.sh
   source abaco_venv/bin/activate
   jupyter notebook
   ```

2. **Daily Usage:**
   ```bash
   source abaco_venv/bin/activate
   jupyter notebook
   ```

3. **After Updates:**
   ```bash
   source abaco_venv/bin/activate
   pip install -r notebooks/requirements.txt --upgrade
   ```

---

*Last updated: October 2025*  
*For the latest documentation, see the main [README.md](README.md)*
