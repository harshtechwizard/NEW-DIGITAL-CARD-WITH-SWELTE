<script lang="ts">
	/**
	 * PhoneInput Component
	 * Input field with country code selector for phone numbers
	 */

	interface Props {
		name: string;
		label?: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
	}

	let {
		name,
		label,
		value = $bindable(''),
		placeholder = '',
		required = false,
		disabled = false,
		error
	}: Props = $props();

	// Popular country codes
	const countryCodes = [
		{ code: '+1', country: 'US/CA', flag: '🇺🇸' },
		{ code: '+44', country: 'UK', flag: '🇬🇧' },
		{ code: '+91', country: 'IN', flag: '🇮🇳' },
		{ code: '+86', country: 'CN', flag: '🇨🇳' },
		{ code: '+81', country: 'JP', flag: '🇯🇵' },
		{ code: '+49', country: 'DE', flag: '🇩🇪' },
		{ code: '+33', country: 'FR', flag: '🇫🇷' },
		{ code: '+39', country: 'IT', flag: '🇮🇹' },
		{ code: '+34', country: 'ES', flag: '🇪🇸' },
		{ code: '+61', country: 'AU', flag: '🇦🇺' },
		{ code: '+55', country: 'BR', flag: '🇧🇷' },
		{ code: '+7', country: 'RU', flag: '🇷🇺' },
		{ code: '+82', country: 'KR', flag: '🇰🇷' },
		{ code: '+52', country: 'MX', flag: '🇲🇽' },
		{ code: '+27', country: 'ZA', flag: '🇿🇦' },
		{ code: '+971', country: 'AE', flag: '🇦🇪' },
		{ code: '+966', country: 'SA', flag: '🇸🇦' },
		{ code: '+65', country: 'SG', flag: '🇸🇬' },
		{ code: '+60', country: 'MY', flag: '🇲🇾' },
		{ code: '+62', country: 'ID', flag: '🇮🇩' },
		{ code: '+63', country: 'PH', flag: '🇵🇭' },
		{ code: '+64', country: 'NZ', flag: '🇳🇿' },
		{ code: '+20', country: 'EG', flag: '🇪🇬' },
		{ code: '+234', country: 'NG', flag: '🇳🇬' },
		{ code: '+254', country: 'KE', flag: '🇰🇪' }
	];

	// Extract country code and number from value
	let selectedCode = $state('+1');
	let phoneNumber = $state('');

	$effect(() => {
		if (value) {
			// Try to extract country code from value
			const match = value.match(/^(\+\d{1,4})\s?(.*)$/);
			if (match) {
				selectedCode = match[1];
				phoneNumber = match[2];
			} else {
				phoneNumber = value;
			}
		}
	});

	// Update value when code or number changes
	$effect(() => {
		if (phoneNumber) {
			value = `${selectedCode} ${phoneNumber}`;
		} else {
			value = '';
		}
	});
</script>

<div class="space-y-2">
	{#if label}
		<label for={name} class="block text-sm font-medium text-foreground">
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</label>
	{/if}

	<div class="flex gap-2">
		<!-- Country Code Selector -->
		<select
			bind:value={selectedCode}
			{disabled}
			class="w-32 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#each countryCodes as { code, country, flag }}
				<option value={code}>
					{flag} {code} {country}
				</option>
			{/each}
		</select>

		<!-- Phone Number Input -->
		<input
			type="tel"
			id={name}
			{name}
			bind:value={phoneNumber}
			{placeholder}
			{required}
			{disabled}
			class="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed {error
				? 'border-destructive focus:ring-destructive'
				: ''}"
		/>
	</div>

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}

	<!-- Hidden input for form submission -->
	<input type="hidden" name={name} value={value} />
</div>
