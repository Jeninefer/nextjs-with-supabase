# ABACO Platform - Quick Start Guide

## 🚀 One-Command Setup

First, ensure your environment is clean from Google Cloud interference:

```bash
# Clear Google Cloud environment variables
./scripts/setup_clean_environment.sh

# Verify environment is ready
./scripts/verify_environment.sh
```

Then set up the ABACO environment:

```bash
chmod +x setup_abaco_environment.sh && ./setup_abaco_environment.sh
```

## ✅ Verification Commands

After setup, verify everything works:

```bash
# 1. Verify environment is clean
./scripts/verify_environment.sh

# 2. Activate Python environment
source abaco_venv/bin/activate

# 3. Test Python packages
python -c "import plotly, matplotlib, pandas; print('✅ All packages working!')"

# 4. Test Next.js build
npm run build

# 5. Start development
npm run dev
```

## 📊 Launch ABACO Analytics

```bash
# Start Jupyter with ABACO kernel
jupyter notebook

# Open: notebooks/abaco_financial_intelligence_unified.ipynb
# Select: "ABACO Environment" kernel
```

## 🎯 Platform Status

- ✅ **Environment**: Virtual environment with all dependencies
- ✅ **Build System**: Next.js 15.5.6 compatible
- ✅ **Analytics**: 30+ customer dataset with 35+ dimensions
- ✅ **Security**: P0 vulnerability patched
- ✅ **Ready**: Enterprise deployment ready

**That's it! Your ABACO platform is ready for enterprise use! 🎉**
