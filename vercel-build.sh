#!/bin/bash

# Vercel build script for Office Add-in
echo "Building Office Add-in for Vercel deployment..."

# Install dependencies
npm install

# Build the project
npm run build

echo "Build complete! Output in dist/ directory"
