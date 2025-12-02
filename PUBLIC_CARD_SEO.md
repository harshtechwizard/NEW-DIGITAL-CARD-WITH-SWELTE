# Public Card SEO Implementation

## Overview

This document describes the SEO optimization implementation for public business card pages, including Open Graph meta tags, Twitter Card tags, and JSON-LD structured data.

**Requirements:** 1.2

## Implementation Details

### 1. Open Graph Meta Tags

Open Graph meta tags enable rich social media previews when cards are shared on platforms like Facebook, LinkedIn, and WhatsApp.

**Implemented Tags:**
- `og:type` - Set to "profile" for person cards
- `og:url` - Canonical URL of the card
- `og:title` - Person's full name or card title
- `og:description` - Bio with professional context (designation + company)
- `og:image` - Profile photo or company logo
- `og:image:alt` - Descriptive alt text for accessibility
- `og:image:width` - 1200px (optimal for social media)
- `og:image:height` - 630px (optimal for social media)
- `og:site_name` - "Digital Card Studio"
- `og:locale` - "en_US"

**Location:** `sveltekit-app/src/routes/card/[slug]/+page.svelte`

### 2. Twitter Card Meta Tags

Twitter Card tags optimize how cards appear when shared on Twitter/X.

**Implemented Tags:**
- `twitter:card` - Set to "summary_large_image" for prominent display
- `twitter:url` - Card URL
- `twitter:title` - Person's full name
- `twitter:description` - Bio with professional context
- `twitter:image` - Profile photo or company logo
- `twitter:image:alt` - Descriptive alt text

**Location:** `sveltekit-app/src/routes/card/[slug]/+page.svelte`

### 3. Structured Data (JSON-LD)

JSON-LD structured data helps search engines understand the content and display rich snippets in search results.

**Schemas Implemented:**

#### Person Schema (Personal Cards)
Used when the card is primarily personal without professional organization info.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "John Doe",
  "email": "john@example.com",
  "telephone": "+1234567890",
  "image": "https://example.com/photo.jpg",
  "url": "https://example.com/card/john-doe",
  "description": "Bio text",
  "sameAs": [
    "https://linkedin.com/in/johndoe",
    "https://facebook.com/johndoe",
    "https://instagram.com/johndoe"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1234567890",
    "contactType": "personal",
    "availableLanguage": "en"
  }
}
```

#### Organization Schema (Professional Cards)
Used when the card includes professional organization information.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corporation",
  "url": "https://acme.com",
  "description": "Company description",
  "logo": "https://example.com/logo.jpg",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1234567890",
    "email": "contact@acme.com",
    "contactType": "customer service",
    "availableLanguage": "en"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Business Ave",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "employee": {
    "@type": "Person",
    "name": "John Doe",
    "jobTitle": "CEO",
    "email": "john@acme.com",
    "telephone": "+1234567890",
    "image": "https://example.com/photo.jpg",
    "worksFor": {
      "@type": "Organization",
      "name": "Acme Corporation"
    },
    "sameAs": [
      "https://linkedin.com/in/johndoe"
    ]
  },
  "sameAs": [
    "https://linkedin.com/company/acme",
    "https://facebook.com/acme"
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "17:00"
  }
}
```

**Location:** `sveltekit-app/src/routes/card/[slug]/+page.server.ts` (generateStructuredData function)

### 4. Additional SEO Meta Tags

**Implemented Tags:**
- `<title>` - Page title (person's name)
- `<meta name="description">` - Page description
- `<link rel="canonical">` - Canonical URL to prevent duplicate content issues
- `<meta name="robots">` - Set to "index, follow" for search engine indexing
- `<meta name="author">` - Person's name

## Server-Side Rendering (SSR)

All meta tags and structured data are generated server-side in the `+page.server.ts` load function. This ensures:

1. **SEO Crawlers** can read the content (no JavaScript required)
2. **Social Media Platforms** can generate rich previews
3. **Fast Initial Load** with pre-rendered HTML
4. **Cache-Control Headers** set to 5 minutes for optimal performance

## Testing Social Media Previews

### Facebook/LinkedIn Debugger
- URL: https://developers.facebook.com/tools/debug/
- Paste your card URL to see how it appears on Facebook/LinkedIn

### Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Paste your card URL to see how it appears on Twitter

### LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Paste your card URL to see how it appears on LinkedIn

## Image Requirements

For optimal social media display:
- **Minimum Size:** 1200x630 pixels
- **Aspect Ratio:** 1.91:1 (recommended)
- **Format:** JPEG, PNG, or WebP
- **File Size:** Under 5MB
- **Content:** Should include person's photo or company logo

## Cache Considerations

Public card pages are cached for 5 minutes (`cache-control: public, max-age=300`). After updating profile information:

1. Wait 5 minutes for cache to expire, OR
2. Use social media debugger tools to force a refresh, OR
3. Add a cache-busting query parameter (e.g., `?v=2`)

## Validation

To validate the implementation:

1. **View Page Source** - Check that meta tags are present in HTML
2. **Google Rich Results Test** - https://search.google.com/test/rich-results
3. **Schema.org Validator** - https://validator.schema.org/
4. **Social Media Debuggers** - Use platform-specific tools listed above

## Future Enhancements

Potential improvements for future iterations:

1. **Multiple Images** - Add `og:image` array for image carousel
2. **Video Support** - Add `og:video` for video cards
3. **Localization** - Support multiple languages with `og:locale:alternate`
4. **Article Schema** - For cards with blog/article content
5. **Product Schema** - For cards showcasing products/services
6. **Review Schema** - For cards with testimonials/reviews

## References

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
