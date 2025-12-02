# Authentication Implementation

This document describes the authentication system implemented for the SvelteKit 5 migration.

## Overview

The authentication system provides secure, server-side authentication with the following features:

- Email/password authentication
- OAuth providers (Google, GitHub)
- Password reset flow
- Rate limiting to prevent abuse
- Progressive enhancement (works without JavaScript)
- Server-side validation with Zod
- httpOnly cookies for session security

## Implemented Features

### 1. Login Page (`/login`)

**Location**: `src/routes/(auth)/login/+page.svelte`

Features:
- Email and password input fields
- Client-side validation with real-time feedback
- Server-side validation with Zod
- Rate limiting (5 attempts per 15 minutes)
- OAuth buttons for Google and GitHub
- Progressive enhancement (works without JS)
- Error messages from server
- Link to signup and password reset

**Server Action**: `src/routes/(auth)/login/+page.server.ts`
- Validates credentials with Zod schema
- Implements rate limiting
- Creates secure session with httpOnly cookies
- Redirects to dashboard on success

### 2. Signup Page (`/signup`)

**Location**: `src/routes/(auth)/signup/+page.svelte`

Features:
- Email, password, and confirm password fields
- Password strength indicator (weak/medium/strong)
- Terms of service checkbox
- Client-side validation
- OAuth buttons for Google and GitHub
- Progressive enhancement

**Server Action**: `src/routes/(auth)/signup/+page.server.ts`
- Validates input with Zod schema
- Enforces password strength requirements
- Implements rate limiting (3 attempts per 15 minutes)
- Sends email verification
- Shows success message with instructions

### 3. Password Reset Flow

#### Reset Request (`/reset-password`)

**Location**: `src/routes/(auth)/reset-password/+page.svelte`

Features:
- Email input field
- Client-side validation
- Success message after submission

**Server Action**: `src/routes/(auth)/reset-password/+page.server.ts`
- Validates email with Zod
- Implements rate limiting (3 attempts per 15 minutes)
- Sends password reset email via Supabase
- Doesn't reveal if email exists (security best practice)

#### Reset Confirmation (`/reset-password/confirm`)

**Location**: `src/routes/(auth)/reset-password/confirm/+page.svelte`

Features:
- New password and confirm password fields
- Password strength indicator
- Client-side validation

**Server Action**: `src/routes/(auth)/reset-password/confirm/+page.server.ts`
- Validates tokens from email link
- Validates new password with Zod
- Updates user password
- Signs out user (requires re-login with new password)

### 4. OAuth Integration

**Providers**: Google and GitHub

**Implementation**:
- OAuth buttons on login and signup pages
- OAuth callback handler at `/auth/callback`
- Redirects to dashboard after successful authentication

**Configuration Required**:
To enable OAuth, configure the following in Supabase:
1. Go to Authentication > Providers
2. Enable Google and/or GitHub
3. Add OAuth credentials (Client ID and Secret)
4. Set redirect URL to: `https://yourdomain.com/auth/callback`

### 5. Protected Routes

**Layout**: `src/routes/(app)/+layout.server.ts`

Features:
- Checks for valid session
- Redirects to login if not authenticated
- Provides user data to all protected pages

**Dashboard**: `src/routes/(app)/dashboard/+page.svelte`
- Simple dashboard with links to profile, cards, and analytics
- Shows user email
- Sign out button

### 6. Logout

**Endpoint**: `/logout` (POST)

Features:
- Signs out user
- Clears session cookies
- Redirects to home page

## Security Features

### Rate Limiting

**Implementation**: `src/lib/server/rate-limiter.ts`

- In-memory rate limiting (for production, use Redis)
- Configurable limits per action
- Exponential backoff
- Automatic cleanup of expired entries

**Limits**:
- Login: 5 attempts per 15 minutes
- Signup: 3 attempts per 15 minutes
- Password reset: 3 attempts per 15 minutes

### Validation

**Implementation**: `src/lib/server/validation.ts`

All user inputs are validated with Zod schemas:
- `loginSchema`: Email and password validation
- `signupSchema`: Email, password, confirm password, and terms acceptance
- `passwordResetRequestSchema`: Email validation
- `passwordResetConfirmSchema`: Password and confirm password validation

Password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### CSRF Protection

Implemented in `src/hooks.server.ts`:
- Validates origin header for state-changing requests
- Returns 403 for invalid origins
- Allows localhost in development

### Security Headers

Implemented in `src/hooks.server.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy (production only)
- Strict-Transport-Security (production only)

### Session Management

- httpOnly cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- sameSite: 'lax' provides CSRF protection
- Automatic session refresh
- Server-side session validation

## Progressive Enhancement

All forms work without JavaScript:
- Form submissions use native HTML form actions
- Server-side validation provides fallback
- Error messages preserved on page reload
- Client-side validation enhances UX when JS is available

## Testing

To test the authentication system:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test signup**:
   - Navigate to `/signup`
   - Fill in email, password, and confirm password
   - Accept terms of service
   - Submit form
   - Check email for verification link

3. **Test login**:
   - Navigate to `/login`
   - Enter email and password
   - Submit form
   - Should redirect to `/dashboard`

4. **Test password reset**:
   - Navigate to `/reset-password`
   - Enter email
   - Check email for reset link
   - Click link and set new password
   - Login with new password

5. **Test OAuth** (requires configuration):
   - Click Google or GitHub button
   - Authorize the application
   - Should redirect to `/dashboard`

6. **Test rate limiting**:
   - Try logging in with wrong password 6 times
   - Should see rate limit error after 5 attempts

7. **Test logout**:
   - Click "Sign Out" button
   - Should redirect to home page
   - Try accessing `/dashboard` - should redirect to `/login`

## Next Steps

The following features are planned for future implementation:

1. **Profile Management** (Task 7-8)
   - Personal info form
   - Professional info form
   - Education, awards, products/services
   - Photo gallery

2. **Business Card Management** (Task 9-12)
   - Card creation and editing
   - Template selection
   - Design customization
   - Public card viewing

3. **Analytics** (Task 13-15)
   - View tracking
   - Analytics dashboard
   - Engagement metrics

4. **File Upload** (Task 16)
   - Profile photo upload
   - Company logo upload
   - Image processing with Sharp

5. **QR Codes and NFC** (Task 17-19)
   - QR code generation
   - NFC payload generation
   - vCard export

## Environment Variables

Required environment variables (already configured in `.env`):

```env
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For OAuth, add:

```env
# Optional - for OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## File Structure

```
src/
├── routes/
│   ├── (auth)/                      # Auth route group
│   │   ├── +layout.svelte          # Auth layout
│   │   ├── login/
│   │   │   ├── +page.svelte        # Login page
│   │   │   └── +page.server.ts     # Login action
│   │   ├── signup/
│   │   │   ├── +page.svelte        # Signup page
│   │   │   └── +page.server.ts     # Signup action
│   │   └── reset-password/
│   │       ├── +page.svelte        # Reset request page
│   │       ├── +page.server.ts     # Reset request action
│   │       └── confirm/
│   │           ├── +page.svelte    # Reset confirm page
│   │           └── +page.server.ts # Reset confirm action
│   │
│   ├── (app)/                       # Protected route group
│   │   ├── +layout.svelte          # App layout with nav
│   │   ├── +layout.server.ts       # Auth check
│   │   └── dashboard/
│   │       ├── +page.svelte        # Dashboard page
│   │       └── +page.server.ts     # Dashboard load
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── +server.ts          # OAuth callback
│   │
│   └── logout/
│       └── +server.ts              # Logout endpoint
│
└── lib/
    └── server/
        ├── rate-limiter.ts         # Rate limiting utility
        └── validation.ts           # Zod schemas
```

## Troubleshooting

### "CSRF validation failed"

- Make sure you're accessing the app from the correct domain
- In development, use `localhost` or `127.0.0.1`
- Check that the origin header matches the host

### "Too many attempts"

- Wait for the rate limit window to expire (15 minutes)
- Rate limits are per IP address
- In production, consider using Redis for distributed rate limiting

### OAuth not working

- Verify OAuth credentials are configured in Supabase
- Check redirect URL matches exactly
- Ensure OAuth providers are enabled in Supabase dashboard

### Email verification not received

- Check spam folder
- Verify email settings in Supabase
- Check Supabase logs for email delivery errors

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Zod Documentation](https://zod.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
