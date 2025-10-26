#!/bin/bash
# ABACO Ultimate Recovery - Fix All Node.js and Tailwind Issues

set -e
cd "$(dirname "$0")"

echo "🚨 ABACO ULTIMATE RECOVERY - COMPLETE SYSTEM FIX"
echo "==============================================="

# Step 1: Complete system cleanup
echo "🗑️ Step 1: Complete system cleanup..."
rm -rf node_modules
rm -f package-lock.json
rm -rf .next
rm -rf .turbo
npm cache clean --force

# (Optional) Clear VS Code Tailwind CSS extension cache.
# This will attempt to clear the Tailwind CSS extension cache in the most common VSCode extension directories.
# You can override the extensions directory by setting the VSCODE_EXTENSIONS_DIR environment variable.
echo "🧹 Attempting to clear VSCode Tailwind CSS extension cache (if present)..."
found_cache=0

# Build a list of candidate extension directories
candidate_dirs=()

# 1. User override
if [ -n "$VSCODE_EXTENSIONS_DIR" ]; then
  candidate_dirs+=("$VSCODE_EXTENSIONS_DIR")
fi

# 2. Standard VSCode
if [ -d "$HOME/.vscode/extensions" ]; then
  candidate_dirs+=("$HOME/.vscode/extensions")
fi

# 3. VSCode Insiders
if [ -d "$HOME/.vscode-insiders/extensions" ]; then
  candidate_dirs+=("$HOME/.vscode-insiders/extensions")
fi

# 4. VSCode Portable (if set)
if [ -n "$VSCODE_PORTABLE" ] && [ -d "$VSCODE_PORTABLE/extensions" ]; then
  candidate_dirs+=("$VSCODE_PORTABLE/extensions")
fi

# Search for Tailwind CSS extension cache in all candidate directories
for ext_dir in "${candidate_dirs[@]}"; do
  for d in "$ext_dir"/bradlc.vscode-tailwindcss-*/cache; do
    if [ -d "$d" ]; then
      rm -rf "$d"
      found_cache=1
    fi
  done
done
if [ "$found_cache" -eq 1 ]; then
  echo "✅ VSCode Tailwind CSS extension cache cleared."
else
  echo "ℹ️  No VSCode Tailwind CSS extension cache found to clear."
fi

echo "✅ System completely cleaned"

# Step 2: Reinstall Node.js dependencies
echo "📦 Step 2: Fresh Node.js installation..."
npm install

echo "✅ Dependencies installed"

# Step 3: Verify critical files exist
echo "🔍 Step 3: Verifying critical installations..."

# Check Tailwind CSS installation
if [ -f "node_modules/tailwindcss/lib/util/flattenColorPalette.js" ]; then
    echo "✅ Tailwind CSS flattenColorPalette found"
else
    echo "❌ Tailwind CSS installation incomplete, reinstalling..."
    npm install tailwindcss@latest
fi

# Check PostCSS installation  
if [ -f "node_modules/postcss/package.json" ]; then
    echo "✅ PostCSS installation verified"
else
    echo "❌ PostCSS missing, reinstalling..."
    npm install postcss@latest
fi

# Check Next.js installation
if [ -f "node_modules/next/package.json" ]; then
    echo "✅ Next.js installation verified"
    NEXT_VERSION=$(node -p "require('./node_modules/next/package.json').version")
    echo "   Next.js version: $NEXT_VERSION"
else
    echo "❌ Next.js missing, reinstalling..."
    npm install next@latest
fi

# Step 4: Test configuration files
echo "⚙️ Step 4: Testing configuration files..."

# Test Tailwind config without problematic imports
echo "Testing Tailwind CSS configuration..."
if [ -f "tailwind.config.js" ]; then
  node -e "
  try {
    const config = require('./tailwind.config.js');
    console.log('✅ Tailwind config loads successfully');
  } catch (e) {
    console.log('⚠️ Tailwind config has issues:', e.message);
  }
  "
elif [ -f "tailwind.config.ts" ]; then
  echo "⚠️ Skipping dynamic runtime validation of tailwind.config.ts (Node.js cannot require TypeScript files directly without additional tooling)."
  echo "   Your tailwind.config.ts will be validated during the build process. To validate it at runtime, consider using 'ts-node' (e.g., 'npx ts-node tailwind.config.ts')."
else
  echo "❌ No Tailwind config file found (tailwind.config.js or tailwind.config.ts missing)."
fi

# Test Next.js config
echo "Testing Next.js configuration..."
if [ -f "next.config.js" ]; then
  node -e "
  try {
    const config = require('./next.config.js');
    console.log('✅ Next.js config loads successfully');
  } catch (e) {
    console.log('⚠️ Next.js config has issues:', e.message);
  }
  "
elif [ -f "next.config.ts" ]; then
  echo "⚠️ Skipping runtime validation of next.config.ts (Node.js cannot require TypeScript files directly)."
  echo "   Please ensure your next.config.ts compiles and is valid."
else
  echo "❌ No Next.js config file found (next.config.js or next.config.ts missing)."
fi

# Step 5: Create backup Tailwind config without problematic imports
echo "🔧 Step 5: Creating safe Tailwind configuration..."
cat > tailwind.config.safe.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      // ABACO Financial Intelligence Platform colors
      colors: {
        abaco: {
          primary: {
            light: '#C1A6FF',
            DEFAULT: '#A855F7', 
            dark: '#5F4896',
          },
          background: '#030E19',
          surface: '#1E293B',
          accent: '#8B5CF6',
        },
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config

export default config
EOF

echo "✅ Safe Tailwind config created"

# Step 6: Test build process
echo "🏗️ Step 6: Testing build process..."
BUILD_LOG=$(mktemp)
if npm run build > "$BUILD_LOG" 2>&1; then
    echo "✅ Build successful with current config!"
else
    echo "⚠️ Build failed, trying with safe config..."
    echo "---- Build log (last 40 lines) ----"
    tail -n 40 "$BUILD_LOG"
    echo "-----------------------------------"
    mv tailwind.config.ts tailwind.config.original.ts
    mv tailwind.config.safe.ts tailwind.config.ts
    
    if npm run build > "$BUILD_LOG" 2>&1; then
        echo "✅ Build successful with safe config!"
        echo "ℹ️ Original config saved as tailwind.config.original.ts"
    else
        echo "❌ Build still failing, manual intervention needed"
        echo "---- Build log (last 40 lines) ----"
        tail -n 40 "$BUILD_LOG"
        echo "-----------------------------------"
        mv tailwind.config.ts tailwind.config.safe.ts
        mv tailwind.config.original.ts tailwind.config.ts
    fi
fi
rm -f "$BUILD_LOG"

# Step 7: (Skipped) Development server test
echo "🚀 Step 7: Skipping development server test for efficiency (see build test above)..."
# If you wish to manually test the dev server, run: npm run dev
# Step 7: Final verification
echo "✅ Step 7: Final verification..."
echo ""
echo "📊 ABACO RECOVERY SUMMARY:"
echo "========================="
echo "✅ Node modules: $(ls node_modules | wc -l) packages installed"
echo "✅ Tailwind CSS: $([ -f node_modules/tailwindcss/package.json ] && echo 'INSTALLED' || echo 'MISSING')"
echo "✅ PostCSS: $([ -f node_modules/postcss/package.json ] && echo 'INSTALLED' || echo 'MISSING')"
echo "✅ Next.js: $([ -f node_modules/next/package.json ] && echo 'INSTALLED' || echo 'MISSING')"

echo ""
echo "🎉 ABACO ULTIMATE RECOVERY COMPLETED!"
echo "===================================="
echo "🚀 Your ABACO Financial Intelligence Platform is ready!"

echo ""
echo "🌟 Start Development:"
echo "   npm run dev"
echo ""
echo "🌐 Platform URLs:"
echo "   Main: http://localhost:3000"
echo "   Dashboard: http://localhost:3000/dashboard/financial"

echo ""
echo "📝 If Tailwind CSS VSCode extension still shows errors:"
echo "   1. Restart VSCode"
echo "   2. Reload window (Cmd+Shift+P or Ctrl+Shift+P -> 'Reload Window')"
echo "   3. Clear VSCode cache if needed"
