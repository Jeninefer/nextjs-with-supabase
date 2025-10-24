#!/bin/bash

# Automated Migration Script for Free Services Setup
# Migrates from Supabase to PocketBase and configures free service alternatives
# Version: 1.0.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔄 Migration to Free Services Stack                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print status messages
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm first."
    exit 1
fi

log_success "Prerequisites check passed"

# 1. Install PocketBase
echo ""
log_info "Installing PocketBase..."

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *) 
        log_error "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# PocketBase version is pinned for compatibility and reproducibility.
# If you wish to use a newer version, update the value below.
# Check for the latest releases at: https://github.com/pocketbase/pocketbase/releases
# After updating, ensure the migration process works as expected with the new version.
POCKETBASE_VERSION="0.22.0"
POCKETBASE_DIR="$PROJECT_ROOT/backend/pocketbase"
mkdir -p "$POCKETBASE_DIR"

if [ -f "$POCKETBASE_DIR/pocketbase" ]; then
    log_warning "PocketBase already exists, skipping download"
else
    POCKETBASE_ZIP="pocketbase_${POCKETBASE_VERSION}_${OS}_${ARCH}.zip"
    DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/${POCKETBASE_ZIP}"
    
    log_info "Downloading PocketBase from $DOWNLOAD_URL"
    
    if command -v wget &> /dev/null; then
        wget -q -O "$POCKETBASE_DIR/$POCKETBASE_ZIP" "$DOWNLOAD_URL"
    elif command -v curl &> /dev/null; then
        curl -sL -o "$POCKETBASE_DIR/$POCKETBASE_ZIP" "$DOWNLOAD_URL"
    else
        log_error "Neither wget nor curl is available. Please install one of them."
        exit 1
    fi
    
    cd "$POCKETBASE_DIR"
    unzip -q "$POCKETBASE_ZIP"
    chmod +x pocketbase
    rm "$POCKETBASE_ZIP"
    cd "$PROJECT_ROOT"
    
    log_success "PocketBase installed successfully"
fi

# 2. Update dependencies
echo ""
log_info "Installing free service dependencies..."

npm install pocketbase @google/generative-ai cloudinary netlify-cli --save

log_success "Dependencies installed"

# 3. Create configuration files
echo ""
log_info "Creating configuration files..."

# Backup existing .env.local if it exists
if [ -f ".env.local" ]; then
    cp .env.local ".env.local.backup.$(date +%Y%m%d_%H%M%S)"
    log_warning "Existing .env.local backed up"
fi

# Create .env.local with free service configurations
cat > .env.local << 'EOF'
# ========================================
# Free Services Configuration
# ========================================

# PocketBase (FREE - Self-hosted backend)
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090

# Google Gemini AI (FREE - 15 requests/min)
# Get your key: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Hugging Face (FREE - Unlimited inference API)
# Get your key: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Cloudinary (FREE - 25GB storage, 25GB bandwidth/month)
# Get your credentials: https://cloudinary.com/users/register/free
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Figma (FREE)
FIGMA_ACCESS_TOKEN=your_figma_token
FIGMA_FILE_KEY=your_figma_file_key

# Optional: Keep these for gradual migration
# Comment out after migration is complete
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF

log_success "Configuration file created: .env.local"

# 4. Create PocketBase initialization script
log_info "Creating PocketBase initialization script..."

cat > "$POCKETBASE_DIR/init.sh" << 'EOF'
#!/bin/bash
# PocketBase Initialization Script
# Starts PocketBase with sensible defaults

./pocketbase serve --http="127.0.0.1:8090"
EOF

chmod +x "$POCKETBASE_DIR/init.sh"

log_success "PocketBase initialization script created"

# 5. Create migration documentation
log_info "Creating migration documentation..."

cat > MIGRATION_GUIDE.md << 'EOF'
# Migration to Free Services Guide

## Overview

This guide documents the migration from paid services to 100% free alternatives:

| Service Type | From | To | Savings |
|--------------|------|-----|---------|
| Backend/Database | Supabase | PocketBase | $25/month |
| AI/ML | OpenAI | Google Gemini | $50/month |
| Storage | Supabase Storage | Cloudinary | $25/month |
| Deployment | Vercel Pro | Netlify/Vercel Free | $20/month |
| **Total** | | | **$120+/month → $0** |

## Services Configuration

### 1. PocketBase (Backend & Database)

**Features:**
- SQLite database
- Real-time subscriptions
- User authentication
- File storage
- Admin UI at http://127.0.0.1:8090/_/

**Setup:**
```bash
cd backend/pocketbase
./init.sh
```

**First Time Setup:**
1. Open http://127.0.0.1:8090/_/
2. Create admin account
3. Set up your collections/tables
4. Configure authentication rules

### 2. Google Gemini (AI)

**Features:**
- 15 requests per minute (free tier)
- Text generation, embeddings, chat
- Multi-modal capabilities

**Get API Key:**
https://makersuite.google.com/app/apikey

**Usage:**
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

### 3. Cloudinary (Storage)

**Free Tier:**
- 25GB storage
- 25GB bandwidth/month
- Image/video transformations
- CDN delivery

**Get Credentials:**
https://cloudinary.com/users/register/free

### 4. Netlify (Deployment)

**Free Tier:**
- 100GB bandwidth/month
- Automatic HTTPS
- Continuous deployment
- Serverless functions

**Deploy:**
```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

## Migration Steps

### Phase 1: Setup (Completed by script)
- [x] Install PocketBase
- [x] Install free service dependencies
- [x] Create .env.local configuration

### Phase 2: Manual Configuration
- [ ] Get API keys for all services
- [ ] Update .env.local with real credentials
- [ ] Start PocketBase and create admin account
- [ ] Set up PocketBase collections matching your data model

### Phase 3: Code Migration
- [ ] Replace Supabase client with PocketBase client
- [ ] Update authentication flows
- [ ] Migrate database queries
- [ ] Update file upload/storage code
- [ ] Replace OpenAI calls with Gemini

### Phase 4: Testing
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Test file uploads
- [ ] Test AI features
- [ ] End-to-end testing

### Phase 5: Deployment
- [ ] Deploy to Netlify
- [ ] Configure environment variables
- [ ] Test production deployment
- [ ] Monitor for issues

## Code Examples

### Supabase → PocketBase Migration

**Before (Supabase):**
```javascript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
const { data } = await supabase.from('users').select()
```

**After (PocketBase):**
```javascript
import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
const records = await pb.collection('users').getFullList()
```

### OpenAI → Gemini Migration

**Before (OpenAI):**
```javascript
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: "Hello" }]
})
```

**After (Gemini):**
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })
const result = await model.generateContent("Hello")
```

## Troubleshooting

### PocketBase Issues
- **Port already in use:** Change port in init.sh
- **Permission denied:** Run `chmod +x backend/pocketbase/pocketbase`
- **Can't access admin UI:** Check firewall settings

### API Key Issues
- **Invalid API key:** Verify key in .env.local
- **Rate limit exceeded:** Wait or upgrade plan
- **CORS errors:** Check API configuration

## Support & Resources

- PocketBase Docs: https://pocketbase.io/docs
- Gemini API Docs: https://ai.google.dev/docs
- Cloudinary Docs: https://cloudinary.com/documentation
- Netlify Docs: https://docs.netlify.com

## Rollback Plan

If issues occur, you can rollback by:
1. Restore .env.local.backup file
2. Recommit previous code
3. Redeploy to Vercel

Your backup files are preserved with timestamps.
EOF

log_success "Migration guide created: MIGRATION_GUIDE.md"

# 6. Update package.json scripts
log_info "Updating package.json scripts..."

# Check if jq is available for JSON manipulation
if command -v jq &> /dev/null; then
    # Add PocketBase and deployment scripts using jq
    jq '.scripts += {
        "pocketbase:start": "cd backend/pocketbase && ./init.sh",
        "pocketbase:setup": "cd backend/pocketbase && ./pocketbase serve",
        "deploy:netlify": "netlify deploy --prod",
        "migrate:check": "echo \"Review MIGRATION_GUIDE.md for next steps\""
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    log_success "package.json updated with new scripts"
else
    log_warning "jq not available, skipping package.json script updates"
    log_info "You can manually add these scripts to package.json:"
    echo '  "pocketbase:start": "cd backend/pocketbase && ./init.sh"'
    echo '  "deploy:netlify": "netlify deploy --prod"'
    echo '  "migrate:check": "echo \"Review MIGRATION_GUIDE.md for next steps\""'
fi

# 7. Create .gitignore entries for PocketBase
log_info "Updating .gitignore..."

if ! grep -q "pb_data" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# PocketBase
backend/pocketbase/pb_data/
backend/pocketbase/pb_migrations/
*.db
*.db-shm
*.db-wal

# Environment backups
.env.local.backup.*
EOF
    log_success ".gitignore updated"
else
    log_warning "PocketBase entries already in .gitignore"
fi

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 Migration Setup Completed Successfully!             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GREEN}  ✅${NC} PocketBase installed at backend/pocketbase"
echo -e "${GREEN}  ✅${NC} Free service dependencies added"
echo -e "${GREEN}  ✅${NC} Configuration file created (.env.local)"
echo -e "${GREEN}  ✅${NC} Migration guide created (MIGRATION_GUIDE.md)"
echo -e "${GREEN}  ✅${NC} Initialization scripts ready"

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "1. Get free API keys:"
echo "   • Gemini:        https://makersuite.google.com/app/apikey"
echo "   • Hugging Face:  https://huggingface.co/settings/tokens"
echo "   • Cloudinary:    https://cloudinary.com/users/register/free"
echo ""
echo "2. Update .env.local with your API keys"
echo ""
echo "3. Start PocketBase:"
echo "   npm run pocketbase:start"
echo "   Then open http://127.0.0.1:8090/_/ to create admin account"
echo ""
echo "4. Review migration guide:"
echo "   cat MIGRATION_GUIDE.md"
echo ""
echo "5. Start development:"
echo "   npm run dev"
echo ""
echo -e "${GREEN}💰 Cost Savings: $120+/month → $0/month${NC}"
echo -e "${GREEN}🎊 100% Free Services Stack Ready!${NC}"
echo ""

log_warning "Remember to commit your changes when ready!"
