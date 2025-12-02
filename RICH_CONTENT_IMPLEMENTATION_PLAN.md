# Rich Content Sections - Implementation Plan

## Overview
Add a flexible rich content editor (Quill) to allow users to add custom sections with:
- Rich text formatting (bold, italic, lists, headings)
- Embedded images/banners
- YouTube/video embeds (iframes)
- Custom HTML content
- Multiple sections per card

## Database Design

### New Table: `custom_sections`
```sql
CREATE TABLE custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                    -- Section title (e.g., "About Me", "Services")
  content TEXT NOT NULL,                  -- Rich HTML content from Quill
  display_order INTEGER DEFAULT 0,        -- Order of sections
  is_active BOOLEAN DEFAULT true,         -- Can hide/show sections
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why this design:**
- Separate table = unlimited sections per user
- `content` stores HTML from Quill editor
- `display_order` allows drag-and-drop reordering
- `is_active` allows hiding sections without deleting
- User can reuse sections across multiple cards

## Frontend Components

### 1. RichTextEditor Component
**File:** `src/lib/components/ui/RichTextEditor.svelte`
- Quill.js integration
- Toolbar with formatting options
- Image upload support
- Embed video/iframe support
- Preview mode

### 2. CustomSection Component  
**File:** `src/lib/components/CustomSection.svelte`
- Displays rendered HTML content
- Sanitizes HTML for security
- Responsive design
- Matches card theme

## Integration Points

### 1. Profile Page (`/profile`)
New tab: "Custom Sections"
- List all custom sections
- Add/Edit/Delete sections
- Reorder sections (drag-and-drop)
- Preview section

### 2. Card Creator (`/cards/new`)
Field selection:
- Checkbox for each custom section
- Select which sections to include
- Preview in live card preview

### 3. BusinessCard Component
- Render selected custom sections
- Position: After contact info, before education
- Respects display_order

### 4. Card View (`/card/[slug]`)
- Public display of custom sections
- Sanitized HTML rendering
- Responsive layout

## Security Considerations

### HTML Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Allowed tags and attributes
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'iframe',
    'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'width', 'height',
    'class', 'style', 'frameborder', 'allowfullscreen'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
};

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, sanitizeConfig);
}
```

### Iframe Restrictions
- Only allow YouTube, Vimeo, Google Maps
- Whitelist domains
- Add sandbox attributes

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/
│   │   │   └── RichTextEditor.svelte (NEW)
│   │   ├── CustomSection.svelte (NEW)
│   │   └── BusinessCard.svelte (UPDATED)
│   ├── server/
│   │   ├── validation.ts (UPDATED - add customSectionSchema)
│   │   └── sanitize.ts (NEW - HTML sanitization)
│   └── types/
│       └── database.ts (UPDATED - add CustomSection type)
├── routes/
│   ├── (app)/
│   │   ├── profile/
│   │   │   ├── +page.svelte (UPDATED - add Custom Sections tab)
│   │   │   └── +page.server.ts (UPDATED - CRUD for sections)
│   │   └── cards/
│   │       └── new/
│   │           ├── +page.svelte (UPDATED - section selection)
│   │           └── +page.server.ts (UPDATED - load sections)
│   └── card/
│       └── [slug]/
│           ├── +page.svelte (UPDATED - render sections)
│           └── +page.server.ts (UPDATED - load sections)
└── migration.sql (UPDATED - add custom_sections table)
```

## Implementation Steps

### Phase 1: Database & Backend (30 min)
1. ✅ Add `custom_sections` table to migration.sql
2. ✅ Add RLS policies
3. ✅ Update database types
4. ✅ Add validation schema
5. ✅ Create sanitization utility

### Phase 2: Rich Text Editor (45 min)
1. ✅ Install Quill.js (`npm install quill`)
2. ✅ Create RichTextEditor component
3. ✅ Add toolbar configuration
4. ✅ Implement image upload
5. ✅ Add iframe/embed support

### Phase 3: Profile Integration (30 min)
1. ✅ Add "Custom Sections" tab to profile
2. ✅ Create section list UI
3. ✅ Add/Edit/Delete functionality
4. ✅ Implement reordering
5. ✅ Add server actions

### Phase 4: Card Integration (30 min)
1. ✅ Update card creator to show sections
2. ✅ Add section selection checkboxes
3. ✅ Update BusinessCard component
4. ✅ Render sections in preview
5. ✅ Update public card view

### Phase 5: Testing & Polish (15 min)
1. ✅ Test HTML sanitization
2. ✅ Test iframe embeds
3. ✅ Test responsive design
4. ✅ Test security (XSS prevention)
5. ✅ Add loading states

## Example Use Cases

### 1. About Me Section
```html
<h2>About Me</h2>
<p>I'm a <strong>full-stack developer</strong> with 10 years of experience...</p>
<ul>
  <li>React & Vue.js</li>
  <li>Node.js & Python</li>
  <li>AWS & Docker</li>
</ul>
```

### 2. YouTube Video
```html
<h2>Watch My Latest Talk</h2>
<iframe 
  width="560" 
  height="315" 
  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

### 3. Banner Image
```html
<img 
  src="https://example.com/banner.jpg" 
  alt="Company Banner" 
  style="width: 100%; border-radius: 12px;"
/>
```

### 4. Services Section
```html
<h2>My Services</h2>
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
  <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h3>Web Development</h3>
    <p>Custom websites and web applications</p>
  </div>
  <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h3>Consulting</h3>
    <p>Technical consulting and architecture</p>
  </div>
</div>
```

## Quill Configuration

```typescript
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ]
};
```

## Benefits

### For Users
- ✅ Unlimited customization
- ✅ Add any content type
- ✅ Reusable sections
- ✅ Easy formatting
- ✅ Embed media

### For Business
- ✅ Differentiation from competitors
- ✅ More engaging cards
- ✅ Better storytelling
- ✅ Professional appearance
- ✅ Flexible use cases

## Migration Path

### Existing Users
- No breaking changes
- Custom sections are optional
- Existing cards work as-is
- Can add sections anytime

### New Users
- See example sections
- Templates with pre-made sections
- Easy to get started

## Performance Considerations

### Content Size
- Limit: 50KB per section (plenty for rich content)
- Validation on save
- Warning if approaching limit

### Loading
- Lazy load Quill editor
- Only load on edit mode
- Sanitize on server, cache result

### SEO
- Custom sections are crawlable
- Proper semantic HTML
- Meta tags from content

## Future Enhancements

1. **Section Templates**
   - Pre-made section layouts
   - One-click insert
   - Customizable

2. **Drag-and-Drop Builder**
   - Visual section builder
   - No code required
   - Block-based editing

3. **Animations**
   - Fade-in effects
   - Scroll animations
   - Hover effects

4. **Collaboration**
   - Share sections with team
   - Section marketplace
   - Import/export

5. **Analytics**
   - Track section views
   - Engagement metrics
   - A/B testing

## Estimated Time
- **Total:** ~2.5 hours
- **Core functionality:** 2 hours
- **Polish & testing:** 30 minutes

## Dependencies
```json
{
  "quill": "^2.0.0",
  "isomorphic-dompurify": "^2.0.0"
}
```

## Ready to Implement?
This plan provides a complete, secure, and user-friendly rich content system. Let me know if you want me to proceed with the implementation!
