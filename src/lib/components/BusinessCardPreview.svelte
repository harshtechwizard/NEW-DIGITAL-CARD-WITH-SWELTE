<script lang="ts">
	import type { Database } from '$lib/types/database';
	import Button from '$lib/components/ui/Button.svelte';

	type PersonalInfo = Database['public']['Tables']['personal_info']['Row'];
	type ProfessionalInfo = Database['public']['Tables']['professional_info']['Row'];
	type Education = Database['public']['Tables']['education']['Row'];
	type Award = Database['public']['Tables']['awards']['Row'];
	type ProductService = Database['public']['Tables']['products_services']['Row'];
	type PhotoGallery = Database['public']['Tables']['photo_gallery']['Row'];

	type TemplateType =
		| 'personal-small'
		| 'personal-detailed'
		| 'professional-small'
		| 'professional-detailed'
		| 'custom';

	interface FieldsConfig {
		full_name?: boolean;
		profile_photo_url?: boolean;
		bio?: boolean;
		primary_email?: boolean;
		secondary_email?: boolean;
		mobile_number?: boolean;
		phone_number?: boolean;
		whatsapp_number?: boolean;
		home_address?: boolean;
		linkedin_url?: boolean;
		instagram_url?: boolean;
		facebook_url?: boolean;
		designation?: boolean;
		company_name?: boolean;
		company_logo?: boolean;
		company_website?: boolean;
		office_email?: boolean;
		office_phone?: boolean;
		office_address?: boolean;
		office_hours?: boolean;
		education?: boolean;
		awards?: boolean;
		products_services?: boolean;
		photo_gallery?: boolean;
		professionalIds?: string[];
		[key: string]: boolean | string[] | undefined;
	}

	interface DesignConfig {
		primaryColor?: string;
		secondaryColor?: string;
		fontFamily?: string;
		fontSize?: 'small' | 'medium' | 'large';
		layout?: 'vertical' | 'horizontal';
		theme?: 'light' | 'dark';
		[key: string]: string | undefined;
	}

	interface Props {
		personalInfo: PersonalInfo | null;
		professionalInfo?: ProfessionalInfo[];
		education?: Education[];
		awards?: Award[];
		productsServices?: ProductService[];
		photoGallery?: PhotoGallery[];
		fieldsConfig?: FieldsConfig;
		designConfig?: DesignConfig;
		templateType?: TemplateType;
	}

	let {
		personalInfo,
		professionalInfo = [],
		education = [],
		awards = [],
		productsServices = [],
		photoGallery = [],
		fieldsConfig = {},
		designConfig = {},
		templateType = 'professional-small'
	}: Props = $props();

	const selectedProfessional = $derived(
		professionalInfo.find((p) => fieldsConfig?.professionalIds?.includes(p.id)) ||
			professionalInfo[0] ||
			null
	);

	// Determine which fields to show based on template type and config
	const shouldShowField = (fieldName: keyof FieldsConfig): boolean => {
		// If explicitly configured, use that
		if (fieldsConfig[fieldName] !== undefined) {
			return !!fieldsConfig[fieldName];
		}

		// Otherwise, use template defaults
		switch (templateType) {
			case 'personal-small':
				return ['full_name', 'profile_photo_url', 'bio', 'primary_email', 'mobile_number', 'whatsapp_number', 'linkedin_url', 'instagram_url', 'facebook_url'].includes(fieldName);
			case 'personal-detailed':
				return !['office_email', 'office_phone', 'office_address', 'office_hours', 'company_logo', 'company_name', 'designation'].includes(fieldName);
			case 'professional-small':
				return ['full_name', 'profile_photo_url', 'designation', 'company_name', 'company_logo', 'primary_email', 'mobile_number', 'company_website', 'linkedin_url'].includes(fieldName);
			case 'professional-detailed':
				return true;
			case 'custom':
				return true;
			default:
				return true;
		}
	};

	// Apply design configuration
	const cardStyle = $derived(() => {
		const styles: string[] = [];
		if (designConfig.primaryColor) {
			styles.push(`--primary-color: ${designConfig.primaryColor}`);
		}
		if (designConfig.secondaryColor) {
			styles.push(`--secondary-color: ${designConfig.secondaryColor}`);
		}
		if (designConfig.fontFamily) {
			styles.push(`font-family: ${designConfig.fontFamily}`);
		}
		return styles.join('; ');
	});

	const fontSizeClass = $derived(() => {
		switch (designConfig.fontSize) {
			case 'small':
				return 'text-sm';
			case 'large':
				return 'text-lg';
			default:
				return 'text-base';
		}
	});

	const layoutClass = $derived(() => {
		return designConfig.layout === 'horizontal' ? 'flex-row' : 'flex-col';
	});

	function getInitials(): string {
		if (!personalInfo?.full_name) return 'BC';
		return personalInfo.full_name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function handleWhatsAppClick(number: string) {
		const cleanNumber = number.replace(/[^0-9]/g, '');
		window.open(`https://wa.me/${cleanNumber}`, '_blank');
	}

	function formatAddress(address: any): string {
		if (!address) return '';
		if (typeof address === 'string') return address;
		const parts = [address.street, address.city, address.state, address.zip, address.country];
		return parts.filter(Boolean).join(', ');
	}
</script>

<div class="relative w-full max-w-lg mx-auto">
	<div
		class="relative overflow-hidden rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-slate-50 to-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
	>
		<!-- subtle logo watermark -->
		{#if selectedProfessional?.company_logo_url}
			<div
				class="absolute inset-0 opacity-[0.08] bg-center bg-cover"
				style="background-image: url({selectedProfessional.company_logo_url})"
			></div>
		{/if}

		<div class="relative z-10 px-10 pt-10 pb-8 flex flex-col items-center gap-6">
			<!-- Company logo -->
			{#if selectedProfessional?.company_logo_url}
				<img
					src={selectedProfessional.company_logo_url}
					alt={selectedProfessional.company_name || 'Company logo'}
					class="h-16 object-contain"
				/>
			{/if}

			<!-- Rectangular profile photo -->
			<div
				class="w-[230px] h-[150px] rounded-[28px] border-4 border-white shadow-xl ring-4 ring-primary/15 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/40 flex items-center justify-center text-4xl font-semibold text-white"
			>
				{#if fieldsConfig?.profile_photo_url && personalInfo?.profile_photo_url}
					<img
						src={personalInfo.profile_photo_url}
						alt={personalInfo.full_name || 'Profile'}
						class="w-full h-full object-cover"
					/>
				{:else}
					{getInitials()}
				{/if}
			</div>

			<!-- Name -->
			{#if fieldsConfig?.full_name && personalInfo?.full_name}
				<div class="text-center space-y-1">
					<h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
						{personalInfo.full_name}
					</h1>

					{#if selectedProfessional}
						<div class="text-center space-y-1">
							{#if selectedProfessional.designation}
								<p class="text-base font-medium text-slate-700 dark:text-slate-200">
									{selectedProfessional.designation}
								</p>
							{/if}
							{#if selectedProfessional.company_name}
								<p
									class="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300"
								>
									{selectedProfessional.company_name}
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Bio -->
			{#if fieldsConfig?.bio && personalInfo?.bio}
				<p
					class="text-center text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed max-w-md"
				>
					{personalInfo.bio}
				</p>
			{/if}

			<!-- Contact buttons -->
			<div class="flex flex-wrap justify-center gap-3">
				{#if fieldsConfig?.primary_email && personalInfo?.primary_email}
					<Button
						variant="outline"
						size="icon"
						class="h-12 w-12 rounded-2xl border-slate-200 hover:border-slate-400 transition"
						onclick={() => (window.location.href = `mailto:${personalInfo.primary_email}`)}
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-4 h-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
								/>
								<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
							</svg>
						{/snippet}
					</Button>
				{/if}
				{#if fieldsConfig?.mobile_number && personalInfo?.mobile_number}
					<Button
						variant="outline"
						size="icon"
						class="h-12 w-12 rounded-2xl border-slate-200 hover:border-slate-400 transition"
						onclick={() => (window.location.href = `tel:${personalInfo.mobile_number}`)}
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-4 h-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
								/>
							</svg>
						{/snippet}
					</Button>
				{/if}
				{#if fieldsConfig?.whatsapp_number && personalInfo?.whatsapp_number}
					<Button
						variant="outline"
						size="icon"
						class="h-12 w-12 rounded-2xl border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition"
						onclick={() => handleWhatsAppClick(personalInfo.whatsapp_number!)}
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-4 h-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
									clip-rule="evenodd"
								/>
							</svg>
						{/snippet}
					</Button>
				{/if}
				{#if selectedProfessional?.company_website}
					<Button
						variant="outline"
						size="icon"
						class="h-12 w-12 rounded-2xl border-slate-200 hover:border-slate-400 transition"
						onclick={() => window.open(selectedProfessional.company_website!, '_blank')}
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-4 h-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
									clip-rule="evenodd"
								/>
							</svg>
						{/snippet}
					</Button>
				{/if}
			</div>

			<!-- Office hours -->
			{#if selectedProfessional?.office_opening_time && selectedProfessional?.office_closing_time}
				<div class="text-center text-xs text-slate-500 dark:text-slate-400">
					<p class="uppercase tracking-[0.3em] text-[11px]">Office Hours</p>
					<p class="font-medium">
						{selectedProfessional.office_days || 'Mon-Fri'} ·
						{selectedProfessional.office_opening_time} – {selectedProfessional.office_closing_time}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
