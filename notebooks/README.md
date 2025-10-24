# ABACO Financial Intelligence - Notebooks

## Overview

This directory contains Jupyter notebooks for financial analysis and intelligence using the ABACO platform.

## Quick Start

### 1. Set Up Python Environment

```bash
# Navigate to project root
cd /path/to/nextjs-with-supabase

# Run setup script
chmod +x setup_abaco_environment.sh
./setup_abaco_environment.sh

# Verify setup (optional but recommended)
chmod +x verify_abaco_environment.sh
./verify_abaco_environment.sh

# Activate virtual environment
source abaco_venv/bin/activate
```

### 2. Verify Installation

```bash
# Check Python installation
python --version  # Should be Python 3.x

# Test packages
python -c "import plotly, matplotlib, pandas; print('✅ All packages working!')"
```

### 3. Start Jupyter Notebook

```bash
# Make sure virtual environment is activated
source abaco_venv/bin/activate

# Start Jupyter
jupyter notebook

# Or start with specific notebook
jupyter notebook notebooks/abaco_financial_intelligence_unified.ipynb
```

### 4. Select Correct Kernel

In Jupyter:
1. Click "Kernel" → "Change Kernel"
2. Select "ABACO Environment"
3. Run the notebook cells

## Available Notebooks

### abaco_financial_intelligence_unified.ipynb

**Main financial analysis notebook** with comprehensive features:

- 30+ dimensional customer analytics
- Real-time risk modeling & multi-factor scoring
- Automated financial metrics & KPI engine
- AI-powered market intelligence
- Enterprise security & compliance
- Universal visualization support (Plotly/Matplotlib/Text)

## Dependencies

All required packages are listed in `requirements.txt` and installed automatically by the setup script.

Core dependencies:
- pandas, numpy, scipy (data processing)
- plotly, matplotlib, seaborn (visualization)
- scikit-learn, statsmodels (machine learning)
- jupyter, ipython (notebook environment)

## Troubleshooting

### Python Command Not Found

**Error:** `/bin/sh: python: command not found`

**Solution:**
```bash
# Install Python 3
# macOS:
brew install python3

# Ubuntu/Debian:
sudo apt-get install python3 python3-pip

# Verify installation
which python3
python3 --version
```

### Cloud Dataproc API Error

**Error:** `Cloud Dataproc API has not been used in project...`

**Cause:** This error indicates your environment is trying to use Google Cloud services, but the ABACO notebook runs entirely locally by default.

**Solutions:**

1. **Option A: Run Locally (Recommended)**
   ```bash
   # Clear any GCP environment variables
   unset GOOGLE_APPLICATION_CREDENTIALS
   unset GOOGLE_CLOUD_PROJECT
   
   # Use local Python environment
   source abaco_venv/bin/activate
   jupyter notebook
   ```

2. **Option B: Enable Cloud Integration**
   - See [../docs/GOOGLE_CLOUD_SETUP.md](../docs/GOOGLE_CLOUD_SETUP.md) for detailed instructions
   - Enable Cloud Dataproc API in your GCP project
   - Configure service account credentials

### Virtual Environment Not Activated

**Symptoms:**
- Package import errors
- Wrong Python version
- Missing dependencies

**Solution:**
```bash
# Always activate before using Jupyter
source abaco_venv/bin/activate

# Verify activation (should show abaco_venv path)
which python
```

### Kernel Not Found

**Error:** "ABACO Environment" kernel not available

**Solution:**
```bash
# Activate environment
source abaco_venv/bin/activate

# Register kernel again
python -m ipykernel install --user --name=abaco_env --display-name="ABACO Environment"

# Restart Jupyter
jupyter notebook
```

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'plotly'`

**Solution:**
```bash
# Activate environment
source abaco_venv/bin/activate

# Reinstall dependencies
pip install -r notebooks/requirements.txt

# Verify installation
python -c "import plotly; print('✅ Plotly installed')"
```

## Database Integration (Optional)

The notebooks can optionally integrate with databases for persistent storage:

### Supabase (Recommended - Free Tier Available) ✨

**Why Supabase:**
- ✅ **Free tier**: Up to 500MB database, 1GB file storage
- ✅ **PostgreSQL**: Industry-standard relational database
- ✅ **Easy setup**: No credit card required for free tier
- ✅ **Already configured**: This project uses Supabase

**Setup:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Copy your project URL and anon key
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

**Usage in notebooks:**
```python
from supabase_connector import get_connection

db = get_connection()
if db:
    # Query data
    results = db.query("customers", limit=10)
    
    # Insert data
    db.insert("customers", {"name": "John", "email": "john@example.com"})
    
    db.disconnect()
```

See [Supabase Connector Documentation](supabase_connector.py) for full API.

### Google Cloud SQL (Advanced - Paid)

For enterprise use cases requiring Google Cloud:
- Cloud SQL database connections
- Cloud Storage for large datasets
- Distributed processing with Dataproc

**Note:** Cloud SQL requires a paid Google Cloud account.

For cloud setup, see:
- [Google Cloud Setup Guide](../docs/GOOGLE_CLOUD_SETUP.md)
- [Cloud SQL Connector Documentation](cloudsql_connector.py)

## Configuration Files

- `abaco_config.py` - Platform configuration and settings
- `cloudsql_connector.py` - Cloud SQL database connector (optional)
- `financial_utils.py` - Utility functions for financial analysis
- `requirements.txt` - Python package dependencies

## Output Files

The notebooks generate various output files:

- `charts/` - Generated visualizations (HTML, PNG)
- `exports/` - CSV exports of analysis results
- `data/` - Processed datasets
- `financial_analysis_results.csv` - Main analysis output

## Best Practices

### Performance

1. **Use virtual environment** - Ensures consistent package versions
2. **Restart kernel** - If you modify configuration files
3. **Clear output** - Before committing notebooks to version control
4. **Close unused notebooks** - To free up system resources

### Data Security

1. **Never commit** sensitive financial data
2. **Use .gitignore** - Exclude data files and credentials
3. **Anonymize data** - When sharing analysis results
4. **Secure credentials** - Use environment variables, not hardcoded values

### Development

1. **Document changes** - Add markdown cells explaining modifications
2. **Version control** - Commit working versions regularly
3. **Test incrementally** - Run cells one at a time when developing
4. **Export results** - Save important findings to CSV/Excel

## Advanced Usage

### Custom Analysis

Modify `abaco_config.py` to customize:
- Default number of records
- Risk categories and thresholds
- Chart themes and colors
- Export formats

### Database Integration

To connect to Cloud SQL or local MySQL:

```python
from cloudsql_connector import get_connection

db = get_connection()
if db:
    results = db.query("SELECT * FROM customers LIMIT 10")
    print(results)
    db.disconnect()
```

### Batch Processing

For large datasets:

```python
import pandas as pd

# Process in chunks
chunk_size = 10000
for chunk in pd.read_csv('large_file.csv', chunksize=chunk_size):
    # Process each chunk
    results = analyze_financial_data(chunk)
    # Save results
    results.to_csv('output.csv', mode='a', header=False)
```

## Environment Variables

The notebooks respect these environment variables:

```bash
# Supabase (primary database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Google Cloud (optional)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Cloud SQL (optional)
CLOUD_SQL_CONNECTION_NAME=project:region:instance
CLOUD_SQL_DATABASE=abaco_production
CLOUD_SQL_USERNAME=abaco_user
CLOUD_SQL_PASSWORD=secure-password
```

## Support

### Common Questions

**Q: Do I need Google Cloud to use the notebooks?**  
A: No. The notebooks run entirely locally by default.

**Q: How do I update packages?**  
A: Activate the virtual environment and run `pip install -r requirements.txt --upgrade`

**Q: Can I run this on Windows?**  
A: Yes, but you may need to adjust the setup script. Use `abaco_venv\Scripts\activate` to activate the environment.

**Q: Where are visualization files saved?**  
A: In the `notebooks/charts/` directory by default.

### Getting Help

- **Technical Issues**: See [../docs/GOOGLE_CLOUD_SETUP.md](../docs/GOOGLE_CLOUD_SETUP.md)
- **Platform Documentation**: See [../README.md](../README.md)
- **Report Issues**: [GitHub Issues](https://github.com/<your-org>/<your-repo>/issues)

## Contributing

When contributing notebooks:

1. Clear all output before committing
2. Document all code cells with markdown
3. Test with fresh virtual environment
4. Update this README if adding new features

---

*For the complete ABACO platform documentation, see [../README.md](../README.md)*
