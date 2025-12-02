# Content Security Policy (CSP) Fix for YouTube Embeds

## Problem
YouTube videos and other iframe embeds were being blocked with the error:
```
Framing 'https://www.youtube.com/' violates the following Content Security Policy directive: "default-src 'self'". 
Note that 'frame-src' was not explicitly set, so 'default-src' is used as a fallback.
```

## Root Cause
The Content Security Policy (CSP) in `src/hooks.server.ts` didn't include a `frame-src` directive, which is required to allow iframe embeds from external sources like YouTube.

## Solution
Updated the CSP configuration to include `frame-src` with whitelisted domains.

### Changes Made
**File:** `src/hooks.server.ts`

Added `frame-src` directive with allowed domains:
```typescript
"frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com https://www.dailymotion.com https://w.soundcloud.com"
```

Also moved CSP to apply in both dev and production (was production-only before).

### Allowed Iframe Sources
- ✅ YouTube (youtube.com, youtube-nocookie.com)
- ✅ Vimeo (player.vimeo.com)
- ✅ Google Maps (google.com, maps.google.com)
- ✅ Dailymotion (dailymotion.com)
- ✅ SoundCloud (w.soundcloud.com)
- ✅ Self (same origin)

### Other CSP Improvements
- Added `blob:` to `img-src` for better image handling
- Applied CSP in development mode too (was production-only)
- Kept all other security headers intact

## Testing
After restarting your dev server:

1. Go to Profile → Custom Sections
2. Create a new section
3. Click "▶️ YouTube" button
4. Paste a YouTube URL (e.g., `https://youtube.com/watch?v=dQw4w9WgXcQ`)
5. Save the section
6. View your card - YouTube video should now embed properly!

## Security Notes
- Only whitelisted domains can be embedded
- `frame-ancestors 'none'` prevents your site from being embedded elsewhere
- All other CSP directives remain strict for security
- This follows security best practices for allowing trusted embeds

## Restart Required
**Important:** You need to restart your development server for the CSP changes to take effect:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Verification
After restart, check browser console - the CSP error should be gone and YouTube videos should load!
