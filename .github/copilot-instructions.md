# GitHub Copilot Instructions

This repository is a Next.js starter template with Supabase integration. Follow these guidelines when contributing code.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Backend**: Supabase (Auth, Database)
- **Styling**: Tailwind CSS with CSS Variables
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode
- **Auth**: Supabase SSR with cookie-based authentication

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - React components (including shadcn/ui components in `/components/ui`)
- `/lib` - Utility functions and shared code
- `/utils` - Additional utility functions
- `/supabase` - Supabase configuration and migrations

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define proper types for all props and function parameters
- Avoid using `any` type - use `unknown` or proper types instead
- Use type inference where possible, but be explicit for public APIs
- Follow ESLint rules configured in `eslint.config.mjs`

### React Components

- Use functional components with hooks
- Prefer Server Components by default (App Router pattern)
- Add `"use client"` directive only when client-side features are needed (useState, useEffect, etc.)
- Use proper component naming: PascalCase for components, kebab-case for files
- Keep components focused and single-responsibility

### File Organization

- Place reusable components in `/components`
- Use the `/app` directory for routes following Next.js App Router conventions
- Co-locate route-specific components with their routes when they're not reusable
- Create utility functions in `/lib` or `/utils`

### Styling

- Use Tailwind CSS utility classes for styling
- Follow the established design system using CSS variables defined in `globals.css`
- Use the `cn()` utility from `@/lib/utils` for conditional className combinations
- Respect the dark mode implementation using `next-themes`
- Custom colors: Primary purple gradient (`--abaco-primary-light`, `--abaco-primary-medium`, `--abaco-primary-dark`, `--abaco-primary-darker`) (see `globals.css`)

### Supabase Integration

- Use `@supabase/ssr` for authentication in Server Components
- Create Supabase clients using the utilities in `/utils/supabase`
- Follow cookie-based authentication patterns
- Handle auth state properly in both client and server contexts
- Use Server Actions for data mutations when possible

### Forms and User Input

- Use shadcn/ui form components (Label, Input, Button, etc.)
- Implement proper form validation
- Handle loading and error states
- Provide clear feedback to users

### Path Aliases

- Use `@/` prefix for imports (configured in `tsconfig.json`)
- Example: `import { Button } from "@/components/ui/button"`

## Best Practices

### Performance

- Minimize client-side JavaScript by preferring Server Components
- Use proper Next.js Image component for images
- Implement proper loading states and Suspense boundaries
- Avoid unnecessary re-renders

### Security

- Never commit `.env.local` or sensitive credentials
- Use environment variables for API keys and secrets
- Validate all user input on both client and server
- Follow Supabase Row Level Security (RLS) best practices

### Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels where needed
- Ensure keyboard navigation works properly
- shadcn/ui components have good accessibility defaults - maintain them

### Error Handling

- Handle errors gracefully with try-catch blocks
- Provide user-friendly error messages
- Use Next.js error boundaries for page-level errors
- Log errors appropriately for debugging

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Testing

- Currently no testing framework is configured
- When adding tests, follow the repository patterns and update these instructions

## Additional Notes

- The font families used in this starter kit should match those configured in the project (see Tailwind CSS and global styles for details)
- The app supports both light and dark themes
- Environment variables need to be configured in `.env.local` (see `.env.example`)
- Supabase URL and anon key are required for the app to function
