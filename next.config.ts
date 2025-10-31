import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/Cloud Run deployment
  output: "standalone",
  serverExternalPackages: [
    "@node-rs/argon2",
    "@node-rs/bcrypt",
    "@supabase/supabase-js",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
