# Digital Card Studio - SvelteKit 5 Migration

This is the SvelteKit 5 version of the Digital Card Studio application, migrated from React + Vite.

## Project Structure

```
sveltekit-app/
├── src/
│   ├── lib/
│   │   ├── server/          # Server-only code (Supabase clients, auth, validation)
│   │   ├── components/      # Reusable Svelte components
│   │   ├── stores/          # Svelte stores for state management
│   │   └── types/           # TypeScript type definitions
│   ├── routes/              # SvelteKit routes (pages and API endpoints)
│   ├── app.html             # HTML template
│   └── app.d.ts             # TypeScript declarations
├── static/                  # Static assets
├── tests/                   # Playwright E2E tests
└── svelte.config.js         # SvelteKit configuration
```

## Tech Stack

- **Framework**: SvelteKit 5
- **Language**: TypeScript (strict mode)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Edge Runtime)
- **Testing**: Playwright
- **Linting**: ESLint
- **Formatting**: Prettier

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run Playwright E2E tests

## Core Dependencies

- `@sveltejs/adapter-vercel` - Vercel deployment adapter
- `@supabase/ssr` - Supabase SSR helpers
- `@supabase/supabase-js` - Supabase JavaScript client

## Development Guidelines

- All server-side code goes in `src/lib/server/`
- Use TypeScript strict mode for all files
- Follow the existing folder structure
- Run `npm run check` before committing
- Format code with `npm run format`

## Migration Status

This project is currently in the migration phase. See `.kiro/specs/sveltekit-migration/tasks.md` for the implementation plan.
