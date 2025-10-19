/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['demo-nextjs-with-supabase.vercel.app'],
  },
}

module.exports = nextConfig
