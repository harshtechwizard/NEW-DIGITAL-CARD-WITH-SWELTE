# Configuration Guide

This document explains the configuration setup for the SvelteKit Digital Card Studio application.

## Environment Variables

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values in `.env`

3. Never commit `.env` to version control (it's in `.gitignore`)

### Required Variables

These must be set for the application to run:

- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-only)

### Optional Variables (Development)

These are optional in development but recommended for production:

- `UPSTASH_REDIS_URL` - Redis URL for rate limiting
- `UPSTASH_REDIS_TOKEN` - Redis authentication token
- `SENTRY_DSN` - Sentry DSN for error tracking

### Optional Variables (OAuth)

Only needed if you want to enable OAuth login:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth

## Security Configuration

### CSRF Protection

CSRF protection is automatically enabled in `src/hooks.server.ts`:

- Validates `origin` header matches `host` for all POST/PUT/PATCH/DELETE requests
- Returns 403 if validation fails
- Allows localhost in development mode

### Security Headers

The following security headers are automatically added to all responses:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features

**Production only:**
- `Content-Security-Policy` - Restricts resource loading
- `Strict-Transport-Security` - Enforces HTTPS

### Content Security Policy (CSP)

CSP is configured in `svelte.config.js`:

```javascript
csp: {
  mode: 'auto',
  directives: {
    'default-src': ['self'],
    'script-src': ['self', 'unsafe-inline'],
    'style-src': ['self', 'unsafe-inline'],
    'img-src': ['self', 'data:', 'https:'],
    'font-src': ['self', 'data:'],
    'connect-src': ['self', 'https://*.supabase.co'],
    'frame-ancestors': ['none']
  }
}
```

## Vercel Deployment Configuration

### Adapter Settings

The Vercel adapter is configured in `svelte.config.js`:

```javascript
adapter: adapter({
  runtime: 'edge',        // Use edge runtime for optimal performance
  regions: ['iad1'],      // Deploy to US East (adjust for your audience)
  memory: 1024,           // Memory allocation in MB
  maxDuration: 10         // Maximum execution time in seconds
})
```

### Edge Runtime

Public pages (home, card views) run on Vercel's edge network for:
- Low latency worldwide
- Fast server-side rendering
- Optimal SEO performance

### Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all variables from `.env.example`
4. Set appropriate values for production
5. Mark sensitive variables (service role key, OAuth secrets) as "Sensitive"

## Environment Validation

Environment variables are validated on server startup in `src/lib/server/env.ts`:

- Checks all required variables are set
- Validates URL formats
- Validates key lengths
- Logs warnings for missing optional variables in development
- Exits with error if validation fails

### Validation Output

**Success:**
```
✓ Environment variables validated successfully
  Running in development mode
  ⚠ Redis not configured (rate limiting disabled)
  ⚠ Sentry not configured (error tracking disabled)
```

**Failure:**
```
❌ Environment validation failed:
Missing required environment variables:
  - PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY

Please check your .env file and ensure all required variables are set.
See .env.example for reference.
```

## Development vs Production

### Development Mode

- CSRF allows localhost origins
- Security headers are relaxed
- CSP is not enforced
- Redis and Sentry are optional
- Detailed error messages

### Production Mode

- Strict CSRF validation
- Full security headers including HSTS
- CSP enforced
- Redis required for rate limiting
- Sentry recommended for error tracking
- Generic error messages (no stack traces)

## Troubleshooting

### "Missing required environment variables"

- Check that `.env` file exists
- Verify all required variables are set
- Ensure no typos in variable names
- Restart dev server after changes

### "CSRF validation failed"

- Check that your origin matches your host
- In development, ensure you're using localhost
- Clear browser cache and cookies
- Check for proxy/reverse proxy issues

### "Invalid Supabase credentials"

- Verify URL format is correct (https://...)
- Check keys are copied completely
- Ensure no extra spaces or quotes
- Regenerate keys if needed in Supabase dashboard

## Best Practices

1. **Never commit secrets** - Use `.env` for local, Vercel settings for production
2. **Use PUBLIC_ prefix** - Only for variables that are safe to expose to browser
3. **Rotate keys regularly** - Especially service role keys
4. **Use different keys** - Separate keys for development and production
5. **Monitor usage** - Check Supabase and Vercel dashboards for anomalies
