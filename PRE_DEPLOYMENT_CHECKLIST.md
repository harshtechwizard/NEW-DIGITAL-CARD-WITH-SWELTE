# Pre-Deployment Checklist for SvelteKit App

## 🔍 Pre-Deployment Verification

### 1. Environment Variables ✅
- [ ] `PUBLIC_SUPABASE_URL` - Get from Supabase Dashboard > Settings > API
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - Get from Supabase Dashboard > Settings > API
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase Dashboard > Settings > API (⚠️ Keep secret!)

**How to get Service Role Key:**
1. Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Find "service_role" key under "Project API keys"
3. Copy the key (starts with `eyJ...`)
4. Add to Vercel Environment Variables (NOT in code!)

### 2. Supabase Configuration ✅
- [ ] Add deployment URL to Supabase redirect URLs
  - Go to: Supabase Dashboard > Authentication > URL Configuration
  - Add: `https://your-app.vercel.app/auth/callback`
  - Add: `https://your-custom-domain.com/auth/callback` (if using custom domain)
  - Keep: `http://localhost:5173/auth/callback` (for local dev)

### 3. Local Build Test ✅
```bash
cd sveltekit-app

# Install dependencies
npm install

# Run type checking
npm run check

# Build the app
npm run build

# Preview the build
npm run preview
```

Expected output:
- ✅ No TypeScript errors
- ✅ Build completes successfully
- ✅ Preview server starts on http://localhost:4173

### 4. Critical Path Testing ✅
Test these flows locally before deploying:

**Authentication:**
- [ ] Sign up with email/password
- [ ] Log in with existing account
- [ ] Log out
- [ ] Password reset flow
- [ ] Protected routes redirect to login
- [ ] Public routes accessible without auth

**Card Management:**
- [ ] Create new card
- [ ] Edit existing card
- [ ] Delete card
- [ ] View card list
- [ ] Toggle card active/inactive

**Public Features:**
- [ ] View public card by slug
- [ ] SEO meta tags present (check page source)
- [ ] QR code generation works
- [ ] vCard download works
- [ ] Analytics tracking (check Supabase logs)

**File Uploads:**
- [ ] Upload profile photo
- [ ] Upload company logo
- [ ] Upload product images
- [ ] Images optimized (check file size)

**UI/UX:**
- [ ] Dark mode toggle works
- [ ] Mobile responsive
- [ ] Forms validate correctly
- [ ] Error messages display
- [ ] Success messages display

### 5. Code Quality Checks ✅
```bash
# Lint the code
npm run lint

# Format the code
npm run format

# Run tests (if any)
npm run test
```

### 6. Security Checks ✅
- [ ] No `.env` file in git
- [ ] No hardcoded secrets in code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used server-side
- [ ] All API routes have proper authentication
- [ ] File upload size limits enforced
- [ ] Rate limiting configured (optional but recommended)

### 7. Performance Checks ✅
- [ ] Images optimized (WebP format)
- [ ] Lazy loading implemented where appropriate
- [ ] No console.log statements in production code
- [ ] Bundle size reasonable (check build output)

### 8. SEO Checks ✅
- [ ] All pages have title tags
- [ ] All pages have meta descriptions
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Structured data for public cards
- [ ] Sitemap generated (optional)

## 🚀 Deployment Steps

### Option A: Deploy via Vercel CLI
```bash
cd sveltekit-app

# Login to Vercel (first time only)
npx vercel login

# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

### Option B: Deploy via Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Root Directory**: `sveltekit-app`
   - **Framework Preset**: SvelteKit (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.svelte-kit` (auto-detected)
4. Add Environment Variables:
   ```
   PUBLIC_SUPABASE_URL=https://imykxtymdfbjvshiudnh.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
   ```
5. Click "Deploy"

### Option C: Deploy via Git Push (After Initial Setup)
```bash
git add .
git commit -m "Deploy SvelteKit app"
git push origin main
```
Vercel will automatically deploy on push.

## 📋 Post-Deployment Verification

### 1. Smoke Tests ✅
Visit your deployed URL and test:
- [ ] Home page loads
- [ ] Sign up works
- [ ] Log in works
- [ ] Create card works
- [ ] View public card works
- [ ] File upload works
- [ ] QR code generation works

### 2. Monitor Logs ✅
- [ ] Check Vercel deployment logs for errors
- [ ] Check Vercel function logs for runtime errors
- [ ] Check Supabase logs for database errors
- [ ] Check browser console for client errors

### 3. Performance Metrics ✅
- [ ] Run Lighthouse audit (target: >90 score)
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Monitor response times
- [ ] Check bundle sizes

### 4. Error Tracking ✅
- [ ] Set up Sentry (optional but recommended)
- [ ] Configure error alerts
- [ ] Test error reporting

## 🔧 Troubleshooting

### Build Fails
**Error**: `EPERM: operation not permitted, symlink`
**Solution**: Deploy from Linux/Mac, use WSL, or deploy via Vercel Dashboard

**Error**: `Missing environment variables`
**Solution**: Add all required env vars in Vercel Project Settings

### Authentication Issues
**Error**: `Invalid redirect URL`
**Solution**: Add deployment URL to Supabase redirect URLs

**Error**: `Session not found`
**Solution**: Check cookie settings, ensure HTTPS in production

### Database Issues
**Error**: `Permission denied`
**Solution**: Check RLS policies, ensure user is authenticated

**Error**: `Service role key not found`
**Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars

### File Upload Issues
**Error**: `Storage bucket not found`
**Solution**: Create storage buckets in Supabase (run CREATE_STORAGE_BUCKETS.sql)

**Error**: `File too large`
**Solution**: Check file size limits in code and Supabase settings

## 📊 Monitoring Dashboard

### Vercel
- Deployments: https://vercel.com/dashboard
- Analytics: https://vercel.com/analytics
- Logs: https://vercel.com/logs

### Supabase
- Dashboard: https://app.supabase.com/project/imykxtymdfbjvshiudnh
- Auth logs: https://app.supabase.com/project/imykxtymdfbjvshiudnh/auth/users
- Database logs: https://app.supabase.com/project/imykxtymdfbjvshiudnh/logs/postgres-logs

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ All critical paths work in production
- ✅ No console errors in browser
- ✅ Lighthouse score > 90
- ✅ Authentication works
- ✅ File uploads work
- ✅ Public cards accessible
- ✅ Analytics tracking works
- ✅ No errors in Vercel/Supabase logs

## 📞 Support

If you encounter issues:
1. Check this checklist
2. Review DEPLOYMENT_STRATEGY.md
3. Check Vercel documentation: https://vercel.com/docs
4. Check SvelteKit documentation: https://kit.svelte.dev/docs
5. Check Supabase documentation: https://supabase.com/docs

## 🎉 Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure CDN caching
3. Set up monitoring alerts
4. Plan gradual migration from React app
5. Gather user feedback
6. Iterate and improve

---

**Last Updated**: December 2, 2024
**Version**: 1.0.0
