#!/bin/bash

echo "🏦 Setting up Abaco Financial Intelligence Development Environment"
echo "================================================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️ Please update .env.local with your actual Supabase credentials"
    echo "🌐 Get them from: https://supabase.com/dashboard/project/_/settings/api"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "📥 Installing Supabase CLI..."
    npm install -g supabase@latest
fi

# Initialize Supabase if needed
if [ ! -f "supabase/config.toml" ]; then
    echo "🗄️ Initializing Supabase..."
    supabase init
fi

# Start Supabase local development
echo "🚀 Starting Supabase local development..."
supabase start

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
supabase db reset

# Display connection info
echo ""
echo "✅ Development environment ready!"
echo "📋 Connection Details:"
echo "   Local Supabase URL: http://127.0.0.1:54321"
echo "   Anon Key: Use the key displayed above"
echo "   Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "🌐 Update your .env.local with these local development values:"
echo "   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=[use the anon key from supabase start output]"
echo ""
echo "🚀 Start development server: npm run dev"
