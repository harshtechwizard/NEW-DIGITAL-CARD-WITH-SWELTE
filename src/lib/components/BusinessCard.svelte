<script lang="ts">
	import type { Database } from '$lib/types/database';
	import Button from '$lib/components/ui/Button.svelte';
	import ContactInfo from '$lib/components/ContactInfo.svelte';
	import CustomSection from '$lib/components/CustomSection.svelte';

	type PersonalInfo = Database['public']['Tables']['personal_info']['Row'];
	type ProfessionalInfo = Database['public']['Tables']['professional_info']['Row'];
	type Education = Database['public']['Tables']['education']['Row'];
	type Award = Database['public']['Tables']['awards']['Row'];
	type ProductService = Database['public']['Tables']['products_services']['Row'];
	type PhotoGallery = Database['public']['Tables']['photo_gallery']['Row'];
	type CustomSection = Database['public']['Tables']['custom_sections']['Row'];

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
		customSections?: CustomSection[];
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
		customSections = [],
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

				<!-- Contact Information -->
				<div class="w-full max-w-md space-y-4">
					<!-- Personal Contact -->
					{#if shouldShowField('primary_email') || shouldShowField('mobile_number') || shouldShowField('whatsapp_number')}
						<ContactInfo
							type="personal"
							email={shouldShowField('primary_email') ? personalInfo?.primary_email : null}
							phone={shouldShowField('mobile_number') ? personalInfo?.mobile_number : null}
							whatsapp={shouldShowField('whatsapp_number') ? personalInfo?.whatsapp_number : null}
							linkedin={shouldShowField('linkedin_url') ? personalInfo?.linkedin_url : null}
							instagram={shouldShowField('instagram_url') ? personalInfo?.instagram_url : null}
							facebook={shouldShowField('facebook_url') ? personalInfo?.facebook_url : null}
						/>
					{/if}

					<!-- Professional Contact -->
					{#if selectedProfessional && (shouldShowField('office_email') || shouldShowField('office_phone') || shouldShowField('company_website'))}
						<ContactInfo
							type="professional"
							email={shouldShowField('office_email') ? selectedProfessional?.office_email : null}
							phone={shouldShowField('office_phone') ? selectedProfessional?.office_phone : null}
							website={shouldShowField('company_website') ? selectedProfessional?.company_website : null}
							linkedin={shouldShowField('linkedin_url') ? selectedProfessional?.linkedin_url : null}
							instagram={shouldShowField('instagram_url') ? selectedProfessional?.instagram_url : null}
							facebook={shouldShowField('facebook_url') ? selectedProfessional?.facebook_url : null}
						/>
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

		<!-- Custom Sections -->
		{#if customSections && customSections.length > 0}
			{#each customSections.filter(s => s.is_active).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) as section}
				<div class="relative z-10 px-6 sm:px-10 pb-6 border-t border-slate-200 dark:border-slate-700 pt-6">
					<CustomSection title={section.title} content={section.content} />
				</div>
			{/each}
		{/if}

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
