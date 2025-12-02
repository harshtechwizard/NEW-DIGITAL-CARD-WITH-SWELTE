# Database Types

This directory contains TypeScript types generated from the Supabase database schema.

## Files

- `database.ts` - Auto-generated types from Supabase schema with helper types

## Regenerating Types

When you make changes to your Supabase database schema, you need to regenerate these types.

### Prerequisites

Install the Supabase CLI:

```bash
npm install -g supabase
```

### Method 1: Using Supabase CLI (Recommended)

If you have a local Supabase project:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --local > src/lib/types/database.ts
```

### Method 2: Using Remote Database

If you're using a remote Supabase instance:

```bash
# Generate types from remote database
supabase gen types typescript --project-id your-project-id --schema public > src/lib/types/database.ts
```

### Method 3: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the TypeScript types
4. Paste into `src/lib/types/database.ts`

## Helper Types

The `database.ts` file includes several helper types for common patterns:

### Table Type Helpers

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '$lib/types/database';

// Get the Row type for a table
type PersonalInfo = Tables<'personal_info'>;

// Get the Insert type for a table
type PersonalInfoInsert = TablesInsert<'personal_info'>;

// Get the Update type for a table
type PersonalInfoUpdate = TablesUpdate<'personal_info'>;
```

### Convenience Aliases

```typescript
import type {
	PersonalInfo,
	BusinessCard,
	CardAnalytics
} from '$lib/types/database';
```

### Complex Query Types

```typescript
import type {
	BusinessCardWithUserInfo,
	UserProfile,
	CardAnalyticsSummary
} from '$lib/types/database';
```

## Usage Examples

### In Server Load Functions

```typescript
// src/routes/(app)/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import type { PersonalInfo } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals }) => {
	const { data } = await locals.supabase
		.from('personal_info')
		.select('*')
		.eq('user_id', locals.user!.id)
		.single();

	return {
		profile: data as PersonalInfo | null
	};
};
```

### In Form Actions

```typescript
// src/routes/(app)/profile/+page.server.ts
import type { Actions } from './$types';
import type { TablesInsert } from '$lib/types/database';

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const formData = await request.formData();
		
		const update: TablesInsert<'personal_info'> = {
			user_id: locals.user!.id,
			full_name: formData.get('full_name') as string,
			bio: formData.get('bio') as string
		};

		const { error } = await locals.supabase
			.from('personal_info')
			.upsert(update);

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true };
	}
};
```

### In Components

```typescript
// src/lib/components/BusinessCard.svelte
<script lang="ts">
	import type { BusinessCardWithUserInfo } from '$lib/types/database';
	
	interface Props {
		card: BusinessCardWithUserInfo;
	}
	
	let { card }: Props = $props();
</script>

<div class="card">
	<h2>{card.personal_info?.full_name}</h2>
	<p>{card.personal_info?.bio}</p>
</div>
```

## Notes

- Always regenerate types after schema changes
- The helper types at the bottom of `database.ts` are manually maintained
- Keep the auto-generated section separate from helper types
- Use the convenience aliases for cleaner imports
