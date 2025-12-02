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
		return designConfig.layout === 'horizontal' ? 'md:flex-row' : 'flex-col';
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

<div class="relative w-full max-w-2xl mx-auto {fontSizeClass()}">
	<div
		class="relative overflow-hidden rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-slate-50 to-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
		style={cardStyle()}
	>
		<!-- Subtle logo watermark -->
		{#if shouldShowField('company_logo') && selectedProfessional?.company_logo_url}
			<div
				class="absolute inset-0 opacity-[0.08] bg-center bg-cover"
				style="background-image: url({selectedProfessional.company_logo_url})"
			></div>
		{/if}

		<div class="relative z-10 px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8 flex {layoutClass()} items-center gap-6">
			<!-- Main content section -->
			<div class="flex-1 flex flex-col items-center gap-4 sm:gap-6">
				<!-- Company logo -->
				{#if shouldShowField('company_logo') && selectedProfessional?.company_logo_url}
					<img
						src={selectedProfessional.company_logo_url}
						alt={selectedProfessional.company_name || 'Company logo'}
						class="h-12 sm:h-16 object-contain"
					/>
				{/if}

				<!-- Profile photo -->
				{#if shouldShowField('profile_photo_url')}
					<div
						class="w-[180px] sm:w-[230px] h-[120px] sm:h-[150px] rounded-[24px] sm:rounded-[28px] border-4 border-white shadow-xl ring-4 ring-primary/15 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/40 flex items-center justify-center text-3xl sm:text-4xl font-semibold text-white"
					>
						{#if personalInfo?.profile_photo_url}
							<img
								src={personalInfo.profile_photo_url}
								alt={personalInfo.full_name || 'Profile'}
								class="w-full h-full object-cover"
							/>
						{:else}
							{getInitials()}
						{/if}
					</div>
				{/if}

				<!-- Name and title -->
				{#if shouldShowField('full_name') && personalInfo?.full_name}
					<div class="text-center space-y-1 sm:space-y-2">
						<h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
							{personalInfo.full_name}
						</h1>

						{#if selectedProfessional}
							<div class="text-center space-y-1">
								{#if shouldShowField('designation') && selectedProfessional.designation}
									<p class="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
										{selectedProfessional.designation}
									</p>
								{/if}
								{#if shouldShowField('company_name') && selectedProfessional.company_name}
									<p
										class="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300"
									>
										{selectedProfessional.company_name}
									</p>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<!-- Bio -->
				{#if shouldShowField('bio') && personalInfo?.bio}
					<p
						class="text-center text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed max-w-md px-4"
					>
						{personalInfo.bio}
					</p>
				{/if}

				<!-- Contact buttons -->
				<div class="flex flex-wrap justify-center gap-2 sm:gap-3">
					{#if shouldShowField('primary_email') && personalInfo?.primary_email}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
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
					{#if shouldShowField('office_email') && selectedProfessional?.office_email}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
							onclick={() => (window.location.href = `mailto:${selectedProfessional.office_email}`)}
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
					{#if shouldShowField('mobile_number') && personalInfo?.mobile_number}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
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
					{#if shouldShowField('office_phone') && selectedProfessional?.office_phone}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
							onclick={() => (window.location.href = `tel:${selectedProfessional.office_phone}`)}
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
					{#if shouldShowField('whatsapp_number') && personalInfo?.whatsapp_number}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition"
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
					{#if shouldShowField('company_website') && selectedProfessional?.company_website}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
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
					{#if shouldShowField('linkedin_url') && (personalInfo?.linkedin_url || selectedProfessional?.linkedin_url)}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
							onclick={() =>
								window.open(
									personalInfo?.linkedin_url || selectedProfessional?.linkedin_url!,
									'_blank'
								)}
						>
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="w-4 h-4"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
									/>
								</svg>
							{/snippet}
						</Button>
					{/if}
					{#if shouldShowField('instagram_url') && (personalInfo?.instagram_url || selectedProfessional?.instagram_url)}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
							onclick={() =>
								window.open(
									personalInfo?.instagram_url || selectedProfessional?.instagram_url!,
									'_blank'
								)}
						>
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="w-4 h-4"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
									/>
								</svg>
							{/snippet}
						</Button>
					{/if}
					{#if shouldShowField('facebook_url') && (personalInfo?.facebook_url || selectedProfessional?.facebook_url)}
						<Button
							variant="outline"
							size="icon"
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-400 transition"
							onclick={() =>
								window.open(
									personalInfo?.facebook_url || selectedProfessional?.facebook_url!,
									'_blank'
								)}
						>
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="w-4 h-4"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
									/>
								</svg>
							{/snippet}
						</Button>
					{/if}
				</div>

				<!-- Address -->
				{#if shouldShowField('home_address') && personalInfo?.home_address}
					<div class="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md px-4">
						<p class="font-medium">{formatAddress(personalInfo.home_address)}</p>
					</div>
				{/if}
				{#if shouldShowField('office_address') && selectedProfessional?.office_address}
					<div class="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md px-4">
						<p class="font-medium">{formatAddress(selectedProfessional.office_address)}</p>
					</div>
				{/if}

				<!-- Office hours -->
				{#if shouldShowField('office_hours') && selectedProfessional?.office_opening_time && selectedProfessional?.office_closing_time}
					<div class="text-center text-xs text-slate-500 dark:text-slate-400">
						<p class="uppercase tracking-[0.3em] text-[10px] sm:text-[11px]">Office Hours</p>
						<p class="font-medium text-xs sm:text-sm">
							{selectedProfessional.office_days || 'Mon-Fri'} ·
							{selectedProfessional.office_opening_time} – {selectedProfessional.office_closing_time}
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Education section (for detailed templates) -->
		{#if shouldShowField('education') && education.length > 0}
			<div class="relative z-10 px-6 sm:px-10 pb-6 border-t border-slate-200 dark:border-slate-700 pt-6">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 text-center">
					Education
				</h3>
				<div class="space-y-3">
					{#each education as edu}
						<div class="text-center">
							<p class="font-medium text-slate-900 dark:text-white text-sm">{edu.degree_name}</p>
							<p class="text-xs text-slate-600 dark:text-slate-400">{edu.institution}</p>
							{#if edu.year_completed}
								<p class="text-xs text-slate-500 dark:text-slate-500">{edu.year_completed}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Awards section (for detailed templates) -->
		{#if shouldShowField('awards') && awards.length > 0}
			<div class="relative z-10 px-6 sm:px-10 pb-6 border-t border-slate-200 dark:border-slate-700 pt-6">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 text-center">
					Awards & Certifications
				</h3>
				<div class="space-y-3">
					{#each awards as award}
						<div class="text-center">
							<p class="font-medium text-slate-900 dark:text-white text-sm">{award.title}</p>
							<p class="text-xs text-slate-600 dark:text-slate-400">{award.issuing_org}</p>
							{#if award.date_received}
								<p class="text-xs text-slate-500 dark:text-slate-500">
									{new Date(award.date_received).getFullYear()}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Products/Services section (for detailed templates) -->
		{#if shouldShowField('products_services') && productsServices.length > 0}
			<div class="relative z-10 px-6 sm:px-10 pb-6 border-t border-slate-200 dark:border-slate-700 pt-6">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 text-center">
					Products & Services
				</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each productsServices as product}
						<div class="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
							{#if product.photo_url}
								<img
									src={product.photo_url}
									alt={product.name}
									class="w-full h-24 object-cover rounded-md mb-2"
								/>
							{/if}
							<p class="font-medium text-slate-900 dark:text-white text-sm">{product.name}</p>
							{#if product.description}
								<p class="text-xs text-slate-600 dark:text-slate-400 mt-1">{product.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Photo Gallery section (for detailed templates) -->
		{#if shouldShowField('photo_gallery') && photoGallery.length > 0}
			<div class="relative z-10 px-6 sm:px-10 pb-6 sm:pb-8 border-t border-slate-200 dark:border-slate-700 pt-6">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 text-center">
					Gallery
				</h3>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each photoGallery.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) as photo}
						<div class="relative aspect-square rounded-lg overflow-hidden">
							<img
								src={photo.photo_url}
								alt={photo.caption || 'Gallery photo'}
								class="w-full h-full object-cover"
							/>
							{#if photo.caption}
								<div
									class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center"
								>
									{photo.caption}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
