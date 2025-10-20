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
- Custom colors: Primary purple gradient (`--brand-primary-light`, `--brand-primary-medium`, `--brand-primary-dark`, `--brand-primary-darker`) (see `globals.css`). 
  The `brand` prefix is a placeholder for your project's custom color palette. Please customize these variable names and color values to match your own branding and design system.

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

> **Note:** This project officially supports and tests only `npm` as the package manager. Using `yarn` or `pnpm` is not recommended and may result in deployment errors unless you manually maintain the corresponding lockfile (`yarn.lock` or `pnpm-lock.yaml`) and resolve any issues yourself. Only `npm` is guaranteed to work in CI/CD and deployment.

**Start development server**
- `npm run dev`

<!--
**Unofficial commands for alternative package managers (unsupported):**
- `yarn dev`
- `pnpm dev`
-->

**Build for production**
- `npm run build`

<!--
- `yarn build`
- `pnpm build`
-->

**Start production server**
- `npm run start`

<!--
- `yarn start`
- `pnpm start`
-->

**Run ESLint**
- `npm run lint`

<!--
- `yarn lint`
- `pnpm lint`
-->
## Testing

- Currently, no testing framework is configured.
- When adding tests, consider the following:
  - **Unit and integration tests**: Recommended frameworks are [Jest](https://jestjs.io/) or [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for React components.
  - **End-to-end (E2E) tests**: Consider using [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/).
  - Use TypeScript for all test files.
  - Place test files alongside the code under test or in a `/tests` directory, following repository conventions.
  - Update these instructions and document any new testing setup or patterns you introduce.

## Additional Notes

- The font families used in this starter kit should match those configured in the project (see Tailwind CSS and global styles for details)
- The app supports both light and dark themes
- Environment variables need to be configured in `.env.local` (see `.env.example`)
- Supabase URL and anon key are required for the app to function
