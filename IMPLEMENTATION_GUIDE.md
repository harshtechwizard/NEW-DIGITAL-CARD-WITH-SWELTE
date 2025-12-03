# Race Condition Fixes - Implementation Guide

## Quick Start

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Copy and paste the contents of `migration-race-condition-fixes.sql`
3. Execute the migration
4. Verify success (should see "Query executed successfully")

### Step 2: Verify Installation

Check that the following were created:

```sql
-- Check version columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('business_cards', 'personal_info', 'professional_info')
  AND column_name = 'version';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'generate_unique_slug',
  'create_business_card_atomic',
  'update_business_card_optimistic',
  'upsert_personal_info_optimistic'
);

-- Should return 4 functions
```

### Step 3: Test the Implementation

#### Test 1: Card Creation

```bash
# Create a card via API
curl -X POST http://localhost:5173/api/cards \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "Test Card",
    "template_type": "personal-small",
    "fields_config": {},
    "design_config": {}
  }'

# Should return:
# {
#   "success": true,
#   "card": {
#     "id": "...",
#     "slug": "test-card",
#     "version": 1,
#     ...
#   }
# }
```

#### Test 2: Card Update with Version

```bash
# Update card with correct version
curl -X PATCH http://localhost:5173/api/cards \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "id": "card-id",
    "version": 1,
    "name": "Updated Name"
  }'

# Should return:
# {
#   "success": true,
#   "card": { ..., "version": 2 }
# }
```

#### Test 3: Version Conflict

```bash
# Try to update with old version
curl -X PATCH http://localhost:5173/api/cards \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "id": "card-id",
    "version": 1,
    "name": "Another Update"
  }'

# Should return 409:
# {
#   "error": "Version conflict",
#   "currentVersion": 2,
#   "details": "The card was modified by another session..."
# }
```

## Client-Side Integration

### Update Card Edit Form

```svelte
<!-- src/routes/(app)/cards/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  
  let { data } = $props();
  let card = $state(data.card);
  let version = $state(card.version);
  let error = $state('');
  
  async function handleUpdate() {
    const response = await fetch('/api/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: card.id,
        version: version, // ← Include version
        name: card.name,
        template_type: card.template_type,
        fields_config: card.fields_config,
        design_config: card.design_config
      })
    });
    
    const result = await response.json();
    
    if (response.status === 409) {
      // Version conflict
      error = `Conflict: ${result.details}. Current version is ${result.currentVersion}.`;
      
      // Option 1: Auto-refresh
      window.location.reload();
      
      // Option 2: Merge changes (advanced)
      // Show diff and let user choose
    } else if (response.ok) {
      // Update local version
      version = result.card.version;
      card = result.card;
      error = '';
    } else {
      error = result.error || 'Update failed';
    }
  }
</script>

{#if error}
  <div class="alert alert-error">{error}</div>
{/if}

<form onsubmit={handleUpdate}>
  <input type="hidden" name="version" value={version} />
  <input bind:value={card.name} />
  <button type="submit">Save</button>
</form>
```

### Update Profile Form

```svelte
<!-- src/routes/(app)/profile/+page.svelte -->
<script lang="ts">
  let { data, form } = $props();
  let personalInfo = $state(data.profile.personal_info);
  let version = $state(personalInfo?.version || 0);
  
  // Check for version conflict in form response
  $effect(() => {
    if (form?.error === 'Version conflict') {
      alert(form.details);
      // Refresh page to get latest data
      window.location.reload();
    } else if (form?.success) {
      // Update version after successful save
      version = form.version;
    }
  });
</script>

<form method="POST" action="?/savePersonalInfo">
  <input type="hidden" name="version" value={version} />
  
  <input name="full_name" value={personalInfo?.full_name || ''} />
  <input name="primary_email" value={personalInfo?.primary_email || ''} />
  
  <button type="submit">Save</button>
</form>
```

## Monitoring and Debugging

### Enable Debug Logging

```typescript
// src/lib/server/retry.ts
// Uncomment console.warn to see retry attempts

console.warn(`Retry attempt ${attempt}/${opts.maxAttempts} after error:`, {
  code: error?.code,
  message: error?.message,
  delayMs: delay
});
```

### Check Version Conflicts in Database

```sql
-- See current versions
SELECT id, name, version, updated_at 
FROM business_cards 
ORDER BY updated_at DESC 
LIMIT 10;

-- Check for high version numbers (many updates)
SELECT id, name, version 
FROM business_cards 
WHERE version > 10 
ORDER BY version DESC;
```

### Monitor Retry Attempts

Add custom logging:

```typescript
// In your application
let retryCount = 0;

const result = await retryDatabaseOperation(async () => {
  retryCount++;
  if (retryCount > 1) {
    console.log(`Retry attempt ${retryCount} for operation`);
  }
  return await operation();
});

if (retryCount > 1) {
  // Log to analytics
  analytics.track('database_retry', {
    operation: 'card_update',
    attempts: retryCount
  });
}
```

## Troubleshooting

### Issue: "Function does not exist"

**Cause:** Database migration not run or failed

**Solution:**
```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';

-- If missing, re-run migration
```

### Issue: "Version is required for optimistic locking"

**Cause:** Client not sending version number

**Solution:**
```typescript
// Always include version in updates
const response = await fetch('/api/cards', {
  method: 'PATCH',
  body: JSON.stringify({
    id: cardId,
    version: currentVersion, // ← Must include
    ...updates
  })
});
```

### Issue: Constant version conflicts

**Cause:** Multiple users/tabs editing same data

**Solution:**
1. This is expected behavior - working as designed
2. Implement auto-refresh on conflict
3. Consider adding "last modified by" indicator
4. Add optimistic UI updates with rollback

### Issue: "Unable to generate unique slug"

**Cause:** Too many cards with similar names

**Solution:**
```typescript
// The function tries 10 times with random suffixes
// If it still fails, suggest different name to user
if (error.message.includes('Unable to generate unique slug')) {
  return {
    error: 'Please choose a more unique card name',
    suggestion: `Try adding a number or date: "${name} 2024"`
  };
}
```

## Performance Optimization

### 1. Reduce Version Conflicts

```typescript
// Debounce auto-save to reduce conflicts
let saveTimeout: NodeJS.Timeout;

function autoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await saveCard();
  }, 2000); // Wait 2 seconds after last change
}
```

### 2. Batch Updates

```typescript
// Instead of saving each field separately
// Collect changes and save once
let pendingChanges = {};

function queueChange(field: string, value: any) {
  pendingChanges[field] = value;
}

async function flushChanges() {
  if (Object.keys(pendingChanges).length === 0) return;
  
  await updateCard({
    ...pendingChanges,
    version: currentVersion
  });
  
  pendingChanges = {};
}
```

### 3. Optimistic UI Updates

```typescript
// Update UI immediately, rollback on conflict
function optimisticUpdate(changes: any) {
  const oldData = { ...card };
  const oldVersion = version;
  
  // Update UI immediately
  card = { ...card, ...changes };
  
  // Save to server
  updateCard({ ...changes, version })
    .then(result => {
      // Success - update version
      version = result.card.version;
    })
    .catch(error => {
      if (error.status === 409) {
        // Conflict - rollback UI
        card = oldData;
        version = oldVersion;
        alert('Changes were not saved due to conflict');
      }
    });
}
```

## Best Practices Summary

### ✅ DO

1. **Always include version** in update requests
2. **Handle 409 conflicts** gracefully
3. **Refresh data** after conflicts
4. **Use retry utilities** for transient errors
5. **Test concurrent scenarios** during development
6. **Monitor version conflict rates** in production
7. **Show clear error messages** to users

### ❌ DON'T

1. **Don't ignore version conflicts** - they indicate real issues
2. **Don't retry indefinitely** - set reasonable limits (3-5 attempts)
3. **Don't hide conflicts** from users - be transparent
4. **Don't skip version checks** for "quick updates"
5. **Don't assume single-user access** - always code for concurrency
6. **Don't use stale data** - always fetch latest before update
7. **Don't panic on conflicts** - they're normal in concurrent systems

## Support

If you encounter issues:

1. Check database migration ran successfully
2. Verify version columns exist in tables
3. Check browser console for errors
4. Review server logs for retry attempts
5. Test with single user first, then concurrent
6. Refer to `RACE_CONDITION_FIXES.md` for detailed explanation

## Next Steps

1. ✅ Run database migration
2. ✅ Test card creation and updates
3. ✅ Update client forms to include version
4. ✅ Add conflict handling UI
5. ✅ Monitor for version conflicts
6. ✅ Optimize based on usage patterns

Your application now has enterprise-grade race condition protection! 🎉
