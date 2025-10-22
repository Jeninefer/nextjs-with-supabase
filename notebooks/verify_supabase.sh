#!/bin/bash

echo "🔍 ABACO Supabase Connection Verification"
echo "========================================"

cd /Users/jenineferderas/Documents/GitHub/nextjs-with-supabase

# Check Supabase CLI installation
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Check Supabase status
echo "📊 Checking Supabase status..."
supabase status

# Check if Supabase is running
if supabase status | grep -q "supabase local development setup is running"; then
    echo "✅ Supabase is running!"
    
    # Get connection details
    echo "🔗 Connection details:"
    supabase status | grep -E "(API URL|anon key|service_role key)"
    
    # Test connection
    echo "🧪 Testing connection..."
    curl -s "http://127.0.0.1:54321/rest/v1/" \
        -H "apikey: $(supabase status --output=json | jq -r '.[] | select(.name=="API URL") | .value' | sed 's/.*anon_key=//'" \
        > /dev/null && echo "✅ API connection successful" || echo "❌ API connection failed"
        
else
    echo "❌ Supabase is not running"
    echo "🚀 Starting Supabase..."
    supabase start
fi

# Check environment file
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" .env.local; then
        echo "✅ Local Supabase URL configured"
    else
        echo "⚠️ .env.local needs local Supabase URL"
    fi
else
    echo "❌ .env.local not found - creating template..."
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
fi

echo "✅ Verification complete!"
