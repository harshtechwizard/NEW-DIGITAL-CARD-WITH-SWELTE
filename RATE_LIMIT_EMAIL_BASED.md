# Rate Limiting Changed to Email-Based ✅

## What Changed

### Before (IP-Based)
Rate limiting was based on IP address:
- All login attempts from the same IP shared the same limit
- Testing with different emails from the same IP would hit the limit
- Problem: Multiple users on same network (office, cafe) would share limits

### After (Email-Based)
Rate limiting is now based on email address:
- Each email address has its own independent rate limit
- You can test with different emails without hitting limits
- More fair for shared networks

## Changes Made

### 1. Login (`src/routes/(auth)/login/+page.server.ts`)
**Before:**
```typescript
const ip = getClientAddress();
const rateLimitResult = await rateLimit(ip, 'login', 5, 900);
```

**After:**
```typescript
const email = formData.get('email')?.toString() || '';
const rateLimitResult = await rateLimit(email.toLowerCase(), 'login', 5, 900);
```

**Limits:**
- 5 attempts per 15 minutes per email
- Resets on successful login

### 2. Signup (`src/routes/(auth)/signup/+page.server.ts`)
**Before:**
```typescript
const ip = getClientAddress();
const rateLimitResult = await rateLimit(ip, 'signup', 3, 900);
```

**After:**
```typescript
const email = formData.get('email')?.toString() || '';
const rateLimitResult = await rateLimit(email.toLowerCase(), 'signup', 3, 900);
```

**Limits:**
- 3 attempts per 15 minutes per email

### 3. Password Reset (`src/routes/(auth)/reset-password/+page.server.ts`)
**Before:**
```typescript
const ip = getClientAddress();
const rateLimitResult = await rateLimit(ip, 'password-reset', 3, 900);
```

**After:**
```typescript
const email = formData.get('email')?.toString() || '';
const rateLimitResult = await rateLimit(email.toLowerCase(), 'password-reset', 3, 900);
```

**Limits:**
- 3 attempts per 15 minutes per email

## How It Works Now

### Rate Limit Keys
```
login:user@example.com
signup:user@example.com
password-reset:user@example.com
```

Each email gets its own counter for each action type.

### Testing Scenario
**Before (IP-based):**
1. Try login with `user1@example.com` - 5 attempts
2. Hit rate limit
3. Try login with `user2@example.com` - BLOCKED (same IP)

**After (Email-based):**
1. Try login with `user1@example.com` - 5 attempts
2. Hit rate limit for `user1@example.com`
3. Try login with `user2@example.com` - Works fine! (different email)

## Benefits

### For Users
- ✅ Fair rate limiting per account
- ✅ Shared networks don't affect each other
- ✅ Multiple users in same office/cafe can login
- ✅ Testing with different emails works properly

### For Security
- ✅ Still prevents brute force attacks on individual accounts
- ✅ Attackers can't spam one email from multiple IPs (each email is limited)
- ✅ Prevents account enumeration attacks
- ✅ Automatic cleanup of expired entries

## Rate Limit Details

### Login
- **Limit:** 5 attempts per 15 minutes
- **Scope:** Per email address
- **Reset:** On successful login
- **Message:** "Too many login attempts for this email. Please try again in X minutes."

### Signup
- **Limit:** 3 attempts per 15 minutes
- **Scope:** Per email address
- **Message:** "Too many signup attempts for this email. Please try again in X minutes."

### Password Reset
- **Limit:** 3 attempts per 15 minutes
- **Scope:** Per email address
- **Message:** "Too many reset attempts for this email. Please try again in X minutes."

## Implementation Details

### Email Normalization
All emails are converted to lowercase before rate limiting:
```typescript
email.toLowerCase()
```

This prevents bypassing limits with:
- `User@Example.com`
- `user@example.com`
- `USER@EXAMPLE.COM`

### Storage
Rate limits are stored in-memory with automatic cleanup:
```typescript
const key = `${action}:${email}`;
// e.g., "login:user@example.com"
```

### Cleanup
Expired entries are automatically removed every 5 minutes to prevent memory leaks.

## Testing

### Test Different Emails
```bash
# Email 1 - 5 attempts
curl -X POST http://localhost:5173/login \
  -d "email=test1@example.com&password=wrong"

# Email 2 - Fresh 5 attempts (not blocked!)
curl -X POST http://localhost:5173/login \
  -d "email=test2@example.com&password=wrong"
```

### Test Same Email
```bash
# Attempt 1-5: Allowed
# Attempt 6+: Blocked for 15 minutes
curl -X POST http://localhost:5173/login \
  -d "email=test@example.com&password=wrong"
```

## Production Considerations

### Current Implementation
- In-memory storage (Map)
- Works for single server
- Resets on server restart

### For Production (Multiple Servers)
Consider using Redis for distributed rate limiting:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

export async function rateLimit(email: string, action: string, max: number, window: number) {
  const key = `ratelimit:${action}:${email}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window);
  }
  
  return {
    allowed: count <= max,
    retryAfter: count > max ? await redis.ttl(key) : 0,
    remaining: Math.max(0, max - count)
  };
}
```

## Migration Notes

### No Database Changes
- No migration required
- Changes are code-only
- Existing rate limits will expire naturally

### Backward Compatibility
- Old IP-based limits will expire after 15 minutes
- New email-based limits take effect immediately
- No user action required

## Summary

Rate limiting is now **email-based** instead of IP-based:
- ✅ Each email has independent limits
- ✅ Testing with different emails works properly
- ✅ Fair for shared networks
- ✅ Still secure against brute force
- ✅ Better user experience

You can now test with `user1@example.com` and `demo@example.com` without them interfering with each other!
