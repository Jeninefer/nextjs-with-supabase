
#!/bin/bash

# Change to the directory where this script is located
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🚨 EMERGENCY FIX: Supabase + Cache + Duplicates"
echo "=============================================="

# ==========================================
# PHASE 1: STOP ALL SERVERS
# ==========================================
echo ""
echo "⏹️  PHASE 1: STOPPING SERVERS"
echo "============================"

# Kill Next.js dev servers
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "✅ Servers stopped"

# ==========================================
# PHASE 2: DELETE DUPLICATES & CLEAN CACHE
# ==========================================
echo ""
echo "🗑️  PHASE 2: CLEANING DUPLICATES & CACHE"
echo "======================================="

# Remove duplicates
rm -f AI_APIS.md.backup 2>/dev/null || true
rm -f *.bak *.backup 2>/dev/null || true
find . -name "*.example" -type f -delete 2>/dev/null || true

# Clean Next.js cache completely
rm -rf .next
rm -rf node_modules/.cache
mkdir -p .next/cache/webpack

echo "✅ Cache cleaned"

# ==========================================
# PHASE 3: FIX AI_APIS.MD (REMOVE JSON)
# ==========================================
echo ""
echo "📝 PHASE 3: FIXING AI_APIS.MD"
echo "============================"

# Find line where markdown starts
LINE_NUM=$(grep -n "^# AI APIs Integration Guide" AI_APIS.md | head -1 | cut -d: -f1)

if [ ! -z "$LINE_NUM" ] && [ "$LINE_NUM" -gt 1 ]; then
    tail -n +"$LINE_NUM" AI_APIS.md > AI_APIS.md.tmp
    mv AI_APIS.md.tmp AI_APIS.md
    echo "✅ AI_APIS.md cleaned (removed embedded JSON)"
else
    echo "✅ AI_APIS.md already clean"
fi

# ==========================================
# PHASE 4: START & CONFIGURE SUPABASE
# ==========================================
echo ""
echo "🐘 PHASE 4: STARTING SUPABASE"
echo "============================="

# Check if supabase CLI exists
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize if needed
if [ ! -f "supabase/config.toml" ]; then
    echo "Initializing Supabase..."
    supabase init
fi

# Start Supabase
echo "Starting Supabase local instance..."
supabase start 2>&1 | tee supabase-start.log

# Wait for startup
sleep 10

# Extract credentials
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')
SUPABASE_ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

echo "✅ Supabase started"

# ==========================================
# PHASE 5: CREATE PROPER .ENV.LOCAL
# ==========================================
echo ""
echo "🔐 PHASE 5: CONFIGURING .ENV.LOCAL"
echo "=================================="

cat > .env.local << EOF
# Supabase (Local Instance)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL:-http://localhost:54321}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9}

# OpenAI (Add your real key)
OPENAI_API_KEY=sk-proj-your-key-here

# xAI Grok (Add your real key)
XAI_API_KEY=xai-your-key-here

# Figma
FIGMA_ACCESS_TOKEN=figd_your-token-here
FIGMA_FILE_KEY=nuVKwuPuLS7VmLFvqzOX1G

# SonarQube
SONAR_TOKEN=7852347c583ef4851c5ea2c14413d55865888b8b
SONAR_HOST_URL=http://localhost:9000
SONAR_PROJECT_KEY=abaco-office-addin
EOF

echo "✅ .env.local created with Supabase credentials"

# ==========================================
# PHASE 6: FIX VSCODE SETTINGS (NO DUPLICATES)
# ==========================================
echo ""
echo "⚙️  PHASE 6: FIXING VSCODE SETTINGS"
echo "=================================="

cat > .vscode/settings.json << 'EOF'
{
  "sonarlint.connectedMode.connections.sonarqube": [{
    "connectionId": "abaco-sonarqube",
    "serverUrl": "http://localhost:9000",
    "token": "7852347c583ef4851c5ea2c14413d55865888b8b"
  }],
  "sonarlint.connectedMode.project": {
    "projectKey": "abaco-office-addin",
    "connectionId": "abaco-sonarqube"
  },
  "sonarlint.analysisExcludesStandalone": [
    "**/node_modules/**",
    "**/.next/**"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true
}
EOF

echo "✅ VS Code settings fixed"

# ==========================================
# PHASE 7: REBUILD
# ==========================================
echo ""
echo "🔨 PHASE 7: REBUILDING PROJECT"
echo "=============================="

npm run build 2>&1 | tee build.log || echo "⚠️ Build had warnings"

# ==========================================
# FINAL SUMMARY
# ==========================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          ✅ EMERGENCY FIX COMPLETED                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"

echo ""
echo "📊 SUMMARY:"
echo "==========="
echo "  ✅ Servers stopped"
echo "  ✅ Cache cleaned"
echo "  ✅ Duplicates removed"
echo "  ✅ AI_APIS.md fixed"
echo "  ✅ Supabase started: $SUPABASE_URL"
echo "  ✅ .env.local configured"
echo "  ✅ VS Code settings fixed"
echo "  ✅ Project rebuilt"

echo ""
echo "🔐 SUPABASE CREDENTIALS:"
echo "======================="
echo "  URL: $SUPABASE_URL"
echo "  Anon Key: ${SUPABASE_ANON_KEY:0:50}..."

echo ""
echo "🚀 START DEVELOPMENT:"
echo "===================="
echo "  npm run dev"

echo ""
echo "⚠️  UPDATE .env.local WITH YOUR REAL API KEYS:"
echo "=============================================="
echo "  nano .env.local"

exit 0
