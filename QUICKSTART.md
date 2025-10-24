# Quick Start Guide

## Prerequisites
- Node.js >= 18.0.0
- npm >= 8.19.0

> **Need to install Node.js and npm?**  
> Download and install the latest LTS version from [nodejs.org](https://nodejs.org/).  
> npm is included with Node.js. For more details, see the [npm documentation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys
# - SUPABASE_URL and SUPABASE_ANON_KEY from https://supabase.com/dashboard
# - OPENAI_API_KEY from https://platform.openai.com/api-keys
# - XAI_API_KEY from https://console.x.ai/
# - FIGMA_ACCESS_TOKEN from https://www.figma.com/settings
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

### 4. Verify Setup
```bash
npm run verify
```

This will:
- Clean duplicate files
- Run TypeScript type checking
- Run ESLint linting

## Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run verify` - Run cleanup, type-check, and lint
- `npm run clean` - Remove build artifacts
- `npm run clean:duplicates` - Remove duplicate files

## Troubleshooting

### HTTP 404 Error on Port 5173
**Issue**: Cannot access http://127.0.0.1:5173/

**Solution**: Ensure the following Vite configuration files are present:
- `vite.config.ts` - Vite configuration
- `index.html` - Application entry point
- `src/main.tsx` - React entry point
- `src/App.tsx` - Main application component

### Missing Environment Variables
If you see errors about missing environment variables, ensure you've created the `.env` file from `.env.example` and filled in all required values.

### Build Errors
If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Run `npm run verify` to check for issues

## Project Structure

```
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles with Tailwind
│   ├── components/        # React components
│   │   └── slides/        # Presentation slide components
│   ├── api/               # API integrations
│   ├── supabase/          # Supabase configuration
│   └── taskpane/          # Office Add-in taskpane
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
└── .eslintrc.json         # ESLint configuration
```

## Features

- ✅ Vite dev server running on port 5173
- ✅ React 18 with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Interactive presentation slides
- ✅ Office Add-in integration
- ✅ Figma API integration
- ✅ AI-powered content (OpenAI & xAI)
- ✅ Supabase backend
