<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import RichTextEditor from '$lib/components/ui/RichTextEditor.svelte';
	import { tick } from 'svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let activeTab = $state('personal');
	let isEditingPersonal = $state(false);
	let editingProfessional = $state<string | null>(null);
	let editingEducation = $state<string | null>(null);
	let editingAward = $state<string | null>(null);
	let editingProduct = $state<string | null>(null);
	let editingPhoto = $state<string | null>(null);
	let editingCustomSection = $state<string | null>(null);

	let isSubmitting = $state(false);
	let toast = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// Initialize personal data from server
	let personalData = $state({
		full_name: data.profile.personal_info?.full_name || '',
		date_of_birth: data.profile.personal_info?.date_of_birth || '',
		primary_email: data.profile.personal_info?.primary_email || '',
		secondary_email: data.profile.personal_info?.secondary_email || '',
		mobile_number: data.profile.personal_info?.mobile_number || '',
		phone_number: data.profile.personal_info?.phone_number || '',
		whatsapp_number: data.profile.personal_info?.whatsapp_number || '',
		bio: data.profile.personal_info?.bio || '',
		instagram_url: data.profile.personal_info?.instagram_url || '',
		facebook_url: data.profile.personal_info?.facebook_url || '',
		linkedin_url: data.profile.personal_info?.linkedin_url || '',
		profile_photo_url: data.profile.personal_info?.profile_photo_url || ''
	});

	// Keep a backup for cancel functionality
	let personalDataBackup = $state({ ...personalData });

	// Professional form state
	let professionalFormData = $state<Record<string, any>>({});
	let companyLogoUrl = $state('');
	let productPhotoUrl = $state('');
	let galleryPhotoUrl = $state('');

	const tabs = [
		{ id: 'personal', label: 'Personal Info' },
		{ id: 'professional', label: 'Professional Info' },
		{ id: 'education', label: 'Education' },
		{ id: 'awards', label: 'Awards' },
		{ id: 'products', label: 'Products/Services' },
		{ id: 'gallery', label: 'Photo Gallery' },
		{ id: 'custom', label: 'Custom Sections' }
	];

	function showToast(type: 'success' | 'error', message: string) {
		toast = { type, message };
		setTimeout(() => {
			toast = null;
		}, 5000);
	}

	function startEditingPersonal() {
		personalDataBackup = { ...personalData };
		isEditingPersonal = true;
	}

	function cancelEditingPersonal() {
		personalData = { ...personalDataBackup };
		isEditingPersonal = false;
	}

	function initProfessionalForm(prof: any) {
		professionalFormData = {
			id: prof?.id || '',
			designation: prof?.designation || '',
			company_name: prof?.company_name || '',
			company_website: prof?.company_website || '',
			office_email: prof?.office_email || '',
			office_phone: prof?.office_phone || '',
			whatsapp_number: prof?.whatsapp_number || '',
			department: prof?.department || '',
			office_opening_time: prof?.office_opening_time || '',
			office_closing_time: prof?.office_closing_time || '',
			office_days: prof?.office_days || '',
			instagram_url: prof?.instagram_url || '',
			facebook_url: prof?.facebook_url || '',
			linkedin_url: prof?.linkedin_url || '',
			company_logo_url: prof?.company_logo_url || ''
		};
		companyLogoUrl = prof?.company_logo_url || '';
	}
</script>

<div class="container mx-auto py-8 px-4 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">Profile Management</h1>

	<!-- Toast Notification -->
	{#if toast}
		<div
			class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2 {toast.type ===
			'success'
				? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
				: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}"
		>
			<div class="flex items-center gap-3">
				{#if toast.type === 'success'}
					<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
				<span class="font-medium">{toast.message}</span>
				<button
					onclick={() => (toast = null)}
					class="ml-4 text-current opacity-70 hover:opacity-100"
				>
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<!-- Tabs -->
	<div class="border-b border-border mb-8">
		<nav class="flex space-x-8 overflow-x-auto">
			{#each tabs as tab}
				<button
					onclick={() => (activeTab = tab.id)}
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors {activeTab ===
					tab.id
						? 'border-primary text-primary'
						: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}"
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Personal Info Tab -->
	{#if activeTab === 'personal'}
		<div class="bg-card rounded-lg border border-border p-6">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-semibold">Personal Information</h2>
				{#if !isEditingPersonal}
					<Button onclick={startEditingPersonal}>Edit</Button>
				{/if}
			</div>

			{#if isEditingPersonal}
				<form
					method="POST"
					action="?/savePersonalInfo"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								isEditingPersonal = false;
								personalDataBackup = { ...personalData };
								showToast('success', 'Personal information saved successfully!');
								await update({ reset: false });
							} else if (result.type === 'failure') {
								showToast('error', result.data?.error || 'Failed to save personal information');
								await update({ reset: false });
							}
						};
					}}
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Input
							name="full_name"
							label="Full Name"
							bind:value={personalData.full_name}
							required
							disabled={isSubmitting}
						/>
						<Input
							name="date_of_birth"
							type="date"
							label="Date of Birth"
							bind:value={personalData.date_of_birth}
							disabled={isSubmitting}
						/>
						<Input
							name="primary_email"
							type="email"
							label="Primary Email"
							bind:value={personalData.primary_email}
							disabled={isSubmitting}
						/>
						<Input
							name="secondary_email"
							type="email"
							label="Secondary Email"
							bind:value={personalData.secondary_email}
							disabled={isSubmitting}
						/>
						<Input
							name="mobile_number"
							type="tel"
							label="Mobile Number"
							bind:value={personalData.mobile_number}
							placeholder="+1234567890"
							disabled={isSubmitting}
						/>
						<Input
							name="phone_number"
							type="tel"
							label="Phone Number"
							bind:value={personalData.phone_number}
							placeholder="+1234567890"
							disabled={isSubmitting}
						/>
						<Input
							name="whatsapp_number"
							type="tel"
							label="WhatsApp Number"
							bind:value={personalData.whatsapp_number}
							placeholder="+1234567890"
							disabled={isSubmitting}
						/>
					</div>

					<div class="mt-6">
						<FileUpload
							bucket="profile-photos"
							bind:currentUrl={personalData.profile_photo_url}
							maxSizeMB={5}
							label="Profile Photo"
							description="Upload your profile photo (max 5MB)"
						/>
						<input type="hidden" name="profile_photo_url" value={personalData.profile_photo_url || ''} />
					</div>

					<div class="mt-6">
						<Textarea
							name="bio"
							label="Bio"
							bind:value={personalData.bio}
							rows={4}
							maxlength={500}
							placeholder="Tell us about yourself..."
							disabled={isSubmitting}
						/>
					</div>

					<div class="mt-6">
						<h3 class="text-lg font-medium mb-4">Social Media</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Input
								name="instagram_url"
								type="url"
								label="Instagram"
								bind:value={personalData.instagram_url}
								placeholder="https://instagram.com/username"
								disabled={isSubmitting}
							/>
							<Input
								name="facebook_url"
								type="url"
								label="Facebook"
								bind:value={personalData.facebook_url}
								placeholder="https://facebook.com/username"
								disabled={isSubmitting}
							/>
							<Input
								name="linkedin_url"
								type="url"
								label="LinkedIn"
								bind:value={personalData.linkedin_url}
								placeholder="https://linkedin.com/in/username"
								disabled={isSubmitting}
							/>
						</div>
					</div>

					<div class="mt-8 flex justify-end gap-4">
						<Button type="button" variant="outline" onclick={cancelEditingPersonal} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</form>
			{:else}
				<!-- View Mode -->
				<div class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="text-sm font-medium text-muted-foreground">Full Name</label>
							<p class="mt-1 text-base">{personalData.full_name || 'Not set'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Date of Birth</label>
							<p class="mt-1 text-base">
								{personalData.date_of_birth
									? new Date(personalData.date_of_birth).toLocaleDateString()
									: 'Not set'}
							</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Primary Email</label>
							<p class="mt-1 text-base">{personalData.primary_email || 'Not set'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Secondary Email</label>
							<p class="mt-1 text-base">{personalData.secondary_email || 'Not set'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Mobile Number</label>
							<p class="mt-1 text-base">{personalData.mobile_number || 'Not set'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Phone Number</label>
							<p class="mt-1 text-base">{personalData.phone_number || 'Not set'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">WhatsApp Number</label>
							<p class="mt-1 text-base">{personalData.whatsapp_number || 'Not set'}</p>
						</div>
					</div>

					{#if personalData.profile_photo_url}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Profile Photo</label>
							<img
								src={personalData.profile_photo_url}
								alt="Profile"
								class="mt-2 w-32 h-32 rounded-full object-cover"
							/>
						</div>
					{/if}

					{#if personalData.bio}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Bio</label>
							<p class="mt-1 text-base whitespace-pre-wrap">{personalData.bio}</p>
						</div>
					{/if}

					<div>
						<h3 class="text-lg font-medium mb-4">Social Media</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<label class="text-sm font-medium text-muted-foreground">Instagram</label>
								<p class="mt-1 text-base break-all">
									{personalData.instagram_url || 'Not set'}
								</p>
							</div>
							<div>
								<label class="text-sm font-medium text-muted-foreground">Facebook</label>
								<p class="mt-1 text-base break-all">
									{personalData.facebook_url || 'Not set'}
								</p>
							</div>
							<div>
								<label class="text-sm font-medium text-muted-foreground">LinkedIn</label>
								<p class="mt-1 text-base break-all">
									{personalData.linkedin_url || 'Not set'}
								</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Professional Info Tab -->
	{#if activeTab === 'professional'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-semibold">Professional Information</h2>
				<Button
					onclick={() => {
						initProfessionalForm(null);
						editingProfessional = 'new';
					}}>Add Professional Info</Button
				>
			</div>

			{#if editingProfessional}
				{@const editData =
					editingProfessional === 'new'
						? null
						: data.profile.professional_info.find((p) => p.id === editingProfessional)}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingProfessional === 'new' ? 'Add' : 'Edit'} Professional Info
					</h3>
					<form
						method="POST"
						action="?/saveProfessionalInfo"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									editingProfessional = null;
									professionalFormData = {};
									companyLogoUrl = '';
									showToast('success', 'Professional information saved successfully!');
									await update({ reset: false });
								} else if (result.type === 'failure') {
									showToast('error', result.data?.error || 'Failed to save professional information');
									await update({ reset: false });
								}
							};
						}}
					>
						{#if editingProfessional !== 'new'}
							<input type="hidden" name="id" value={editingProfessional} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								name="designation"
								label="Designation"
								value={editData?.designation || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="company_name"
								label="Company Name"
								value={editData?.company_name || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="company_website"
								type="url"
								label="Company Website"
								value={editData?.company_website || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="office_email"
								type="email"
								label="Office Email"
								value={editData?.office_email || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="office_phone"
								type="tel"
								label="Office Phone"
								value={editData?.office_phone || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="whatsapp_number"
								type="tel"
								label="WhatsApp Number"
								value={editData?.whatsapp_number || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="department"
								label="Department"
								value={editData?.department || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="office_opening_time"
								label="Opening Time"
								placeholder="09:00 AM"
								value={editData?.office_opening_time || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="office_closing_time"
								label="Closing Time"
								placeholder="05:00 PM"
								value={editData?.office_closing_time || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="office_days"
								label="Office Days"
								placeholder="Mon-Fri"
								value={editData?.office_days || ''}
								disabled={isSubmitting}
							/>
						</div>

						<div class="mt-6">
							<FileUpload
								bucket="company-logos"
								bind:currentUrl={companyLogoUrl}
								maxSizeMB={10}
								label="Company Logo"
								description="Upload company logo (max 10MB)"
							/>
							<input type="hidden" name="company_logo_url" value={companyLogoUrl || ''} />
						</div>

						<div class="mt-6">
							<h4 class="text-lg font-medium mb-4">Social Media</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Input
									name="instagram_url"
									type="url"
									label="Instagram"
									value={editData?.instagram_url || ''}
									disabled={isSubmitting}
								/>
								<Input
									name="facebook_url"
									type="url"
									label="Facebook"
									value={editData?.facebook_url || ''}
									disabled={isSubmitting}
								/>
								<Input
									name="linkedin_url"
									type="url"
									label="LinkedIn"
									value={editData?.linkedin_url || ''}
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div class="mt-8 flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									editingProfessional = null;
									professionalFormData = {};
									companyLogoUrl = '';
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each data.profile.professional_info as prof}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start mb-4">
							<div class="flex-1">
								<h3 class="text-lg font-semibold">{prof.designation || 'No Designation'}</h3>
								<p class="text-muted-foreground">{prof.company_name || 'No Company'}</p>
								{#if prof.department}
									<p class="text-sm text-muted-foreground mt-1">{prof.department}</p>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										initProfessionalForm(prof);
										editingProfessional = prof.id;
									}}
								>
									Edit
								</Button>
								<form
									method="POST"
									action="?/deleteProfessionalInfo"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												showToast('success', 'Professional information deleted successfully!');
												await update({ reset: false });
											} else {
												showToast('error', 'Failed to delete professional information');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={prof.id} />
									<Button size="sm" variant="destructive" type="submit">Delete</Button>
								</form>
							</div>
						</div>
						<div class="space-y-1 text-sm">
							{#if prof.office_email}
								<p>📧 {prof.office_email}</p>
							{/if}
							{#if prof.office_phone}
								<p>📞 {prof.office_phone}</p>
							{/if}
							{#if prof.office_opening_time && prof.office_closing_time}
								<p>🕐 {prof.office_opening_time} - {prof.office_closing_time}</p>
							{/if}
							{#if prof.office_days}
								<p>📅 {prof.office_days}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Education Tab -->
	{#if activeTab === 'education'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-semibold">Education</h2>
				<Button onclick={() => (editingEducation = 'new')}>Add Education</Button>
			</div>

			{#if editingEducation}
				{@const editData =
					editingEducation === 'new'
						? null
						: data.profile.education.find((e) => e.id === editingEducation)}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingEducation === 'new' ? 'Add' : 'Edit'} Education
					</h3>
					<form
						method="POST"
						action="?/saveEducation"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									editingEducation = null;
									showToast('success', 'Education saved successfully!');
									await update({ reset: false });
								} else if (result.type === 'failure') {
									showToast('error', result.data?.error || 'Failed to save education');
									await update({ reset: false });
								}
							};
						}}
					>
						{#if editingEducation !== 'new'}
							<input type="hidden" name="id" value={editingEducation} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								name="degree_name"
								label="Degree Name"
								required
								value={editData?.degree_name || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="institution"
								label="Institution"
								required
								value={editData?.institution || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="year_completed"
								type="number"
								label="Year Completed"
								value={editData?.year_completed?.toString() || ''}
								disabled={isSubmitting}
							/>
						</div>
						<div class="mt-6">
							<Textarea
								name="description"
								label="Description"
								rows={3}
								value={editData?.description || ''}
								disabled={isSubmitting}
							/>
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onclick={() => (editingEducation = null)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="space-y-4">
				{#each data.profile.education as edu}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start">
							<div class="flex-1">
								<h3 class="text-lg font-semibold">{edu.degree_name}</h3>
								<p class="text-muted-foreground">{edu.institution}</p>
								{#if edu.year_completed}
									<p class="text-sm text-muted-foreground mt-1">🎓 {edu.year_completed}</p>
								{/if}
								{#if edu.description}
									<p class="text-sm mt-2">{edu.description}</p>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button size="sm" variant="outline" onclick={() => (editingEducation = edu.id)}>
									Edit
								</Button>
								<form
									method="POST"
									action="?/deleteEducation"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												showToast('success', 'Education deleted successfully!');
												await update({ reset: false });
											} else {
												showToast('error', 'Failed to delete education');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={edu.id} />
									<Button size="sm" variant="destructive" type="submit">Delete</Button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Awards Tab -->
	{#if activeTab === 'awards'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-semibold">Awards & Certifications</h2>
				<Button onclick={() => (editingAward = 'new')}>Add Award</Button>
			</div>

			{#if editingAward}
				{@const editData =
					editingAward === 'new' ? null : data.profile.awards.find((a) => a.id === editingAward)}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">{editingAward === 'new' ? 'Add' : 'Edit'} Award</h3>
					<form
						method="POST"
						action="?/saveAward"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									editingAward = null;
									showToast('success', 'Award saved successfully!');
									await update({ reset: false });
								} else if (result.type === 'failure') {
									showToast('error', result.data?.error || 'Failed to save award');
									await update({ reset: false });
								}
							};
						}}
					>
						{#if editingAward !== 'new'}
							<input type="hidden" name="id" value={editingAward} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								name="title"
								label="Award Title"
								required
								value={editData?.title || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="issuing_org"
								label="Issuing Organization"
								required
								value={editData?.issuing_org || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="date_received"
								type="date"
								label="Date Received"
								value={editData?.date_received || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="expiry_date"
								type="date"
								label="Expiry Date"
								value={editData?.expiry_date || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="certificate_url"
								type="url"
								label="Certificate URL"
								class="md:col-span-2"
								value={editData?.certificate_url || ''}
								disabled={isSubmitting}
							/>
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onclick={() => (editingAward = null)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each data.profile.awards as award}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start mb-4">
							<div class="flex-1">
								<h3 class="text-lg font-semibold">{award.title}</h3>
								<p class="text-muted-foreground">{award.issuing_org}</p>
								{#if award.date_received}
									<p class="text-sm text-muted-foreground mt-1">
										🏆 {new Date(award.date_received).toLocaleDateString()}
									</p>
								{/if}
								{#if award.certificate_url}
									<a
										href={award.certificate_url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-primary hover:underline mt-2 inline-block"
									>
										View Certificate →
									</a>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button size="sm" variant="outline" onclick={() => (editingAward = award.id)}>
									Edit
								</Button>
								<form
									method="POST"
									action="?/deleteAward"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												showToast('success', 'Award deleted successfully!');
												await update({ reset: false });
											} else {
												showToast('error', 'Failed to delete award');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={award.id} />
									<Button size="sm" variant="destructive" type="submit">Delete</Button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Products/Services Tab -->
	{#if activeTab === 'products'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-semibold">Products & Services</h2>
				<Button
					onclick={() => {
						productPhotoUrl = '';
						editingProduct = 'new';
					}}>Add Product/Service</Button
				>
			</div>

			{#if editingProduct}
				{@const editData =
					editingProduct === 'new'
						? null
						: data.profile.products_services.find((p) => p.id === editingProduct)}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingProduct === 'new' ? 'Add' : 'Edit'} Product/Service
					</h3>
					<form
						method="POST"
						action="?/saveProductService"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									editingProduct = null;
									productPhotoUrl = '';
									showToast('success', 'Product/Service saved successfully!');
									await update({ reset: false });
								} else if (result.type === 'failure') {
									showToast('error', result.data?.error || 'Failed to save product/service');
									await update({ reset: false });
								}
							};
						}}
					>
						{#if editingProduct !== 'new'}
							<input type="hidden" name="id" value={editingProduct} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								name="name"
								label="Name"
								required
								value={editData?.name || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="category"
								label="Category"
								value={editData?.category || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="website_link"
								type="url"
								label="Website Link"
								value={editData?.website_link || ''}
								disabled={isSubmitting}
							/>
						</div>
						<div class="mt-6">
							<FileUpload
								bucket="product-photos"
								bind:currentUrl={productPhotoUrl}
								maxSizeMB={2}
								label="Product Photo"
								description="Upload product photo (max 2MB)"
							/>
							<input type="hidden" name="photo_url" value={productPhotoUrl || ''} />
						</div>
						<div class="mt-6">
							<Textarea
								name="description"
								label="Description"
								rows={3}
								maxlength={500}
								value={editData?.description || ''}
								disabled={isSubmitting}
							/>
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									editingProduct = null;
									productPhotoUrl = '';
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each data.profile.products_services as product}
					<div class="bg-card rounded-lg border border-border overflow-hidden">
						{#if product.photo_url}
							<img
								src={product.photo_url}
								alt={product.name}
								class="w-full h-48 object-cover"
							/>
						{/if}
						<div class="p-6">
							<h3 class="text-lg font-semibold">{product.name}</h3>
							{#if product.category}
								<p class="text-sm text-muted-foreground">{product.category}</p>
							{/if}
							{#if product.description}
								<p class="text-sm mt-2 line-clamp-3">{product.description}</p>
							{/if}
							{#if product.website_link}
								<a
									href={product.website_link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-sm text-primary hover:underline mt-2 inline-block"
								>
									Visit Website →
								</a>
							{/if}
							<div class="flex gap-2 mt-4">
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										productPhotoUrl = product.photo_url || '';
										editingProduct = product.id;
									}}
								>
									Edit
								</Button>
								<form
									method="POST"
									action="?/deleteProductService"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												showToast('success', 'Product/Service deleted successfully!');
												await update({ reset: false });
											} else {
												showToast('error', 'Failed to delete product/service');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={product.id} />
									<Button size="sm" variant="destructive" type="submit">Delete</Button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Photo Gallery Tab -->
	{#if activeTab === 'gallery'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-semibold">Photo Gallery</h2>
				<Button
					onclick={() => {
						galleryPhotoUrl = '';
						editingPhoto = 'new';
					}}>Add Photo</Button
				>
			</div>

			{#if editingPhoto}
				{@const editData =
					editingPhoto === 'new'
						? null
						: data.profile.photo_gallery.find((p) => p.id === editingPhoto)}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">{editingPhoto === 'new' ? 'Add' : 'Edit'} Photo</h3>
					<form
						method="POST"
						action="?/savePhotoGallery"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									editingPhoto = null;
									galleryPhotoUrl = '';
									showToast('success', 'Photo saved successfully!');
									await update({ reset: false });
								} else if (result.type === 'failure') {
									showToast('error', result.data?.error || 'Failed to save photo');
									await update({ reset: false });
								}
							};
						}}
					>
						{#if editingPhoto !== 'new'}
							<input type="hidden" name="id" value={editingPhoto} />
						{/if}
						<div class="space-y-6">
							<FileUpload
								bucket="gallery-photos"
								bind:currentUrl={galleryPhotoUrl}
								maxSizeMB={5}
								label="Gallery Photo"
								description="Upload gallery photo (max 5MB)"
							/>
							<input type="hidden" name="photo_url" value={galleryPhotoUrl || ''} />
							<Input
								name="caption"
								label="Caption"
								value={editData?.caption || ''}
								disabled={isSubmitting}
							/>
							<Input
								name="display_order"
								type="number"
								label="Display Order"
								value={editData?.display_order?.toString() || ''}
								disabled={isSubmitting}
							/>
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									editingPhoto = null;
									galleryPhotoUrl = '';
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each data.profile.photo_gallery as photo}
					<div class="relative group">
						<img
							src={photo.photo_url}
							alt={photo.caption || 'Gallery photo'}
							class="w-full h-48 object-cover rounded-lg"
						/>
						<div
							class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2"
						>
							<Button
								size="sm"
								variant="outline"
								onclick={() => {
									galleryPhotoUrl = photo.photo_url || '';
									editingPhoto = photo.id;
								}}
							>
								Edit
							</Button>
							<form
								method="POST"
								action="?/deletePhotoGallery"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											showToast('success', 'Photo deleted successfully!');
											await update({ reset: false });
										} else {
											showToast('error', 'Failed to delete photo');
										}
									};
								}}
							>
								<input type="hidden" name="id" value={photo.id} />
								<Button size="sm" variant="destructive" type="submit">Delete</Button>
							</form>
						</div>
						{#if photo.caption}
							<p class="text-sm text-center mt-2 text-muted-foreground">{photo.caption}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Custom Sections Tab -->
	{#if activeTab === 'custom'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<div>
					<h2 class="text-2xl font-semibold">Custom Sections</h2>
					<p class="text-sm text-muted-foreground mt-1">
						Add rich content sections with text, images, videos, and more
					</p>
				</div>
				<Button
					onclick={() => {
						editingCustomSection = 'new';
					}}>Add Section</Button
				>
			</div>

			{#if editingCustomSection}
				{@const editData =
					editingCustomSection === 'new'
						? null
						: data.profile.custom_sections?.find((s) => s.id === editingCustomSection)}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingCustomSection === 'new' ? 'Add' : 'Edit'} Custom Section
					</h3>
					<form
						method="POST"
						action="?/saveCustomSection"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									editingCustomSection = null;
									showToast('success', 'Custom section saved successfully!');
									await update({ reset: false });
								} else if (result.type === 'failure') {
									showToast('error', result.data?.error || 'Failed to save custom section');
									await update({ reset: false });
								}
							};
						}}
					>
						{#if editingCustomSection !== 'new'}
							<input type="hidden" name="id" value={editingCustomSection} />
						{/if}
						<div class="space-y-6">
							<Input
								name="title"
								label="Section Title"
								required
								value={editData?.title || ''}
								placeholder="e.g., About Me, Services, Portfolio"
								disabled={isSubmitting}
							/>

							<RichTextEditor
								name="content"
								label="Section Content"
								required
								value={editData?.content || ''}
								placeholder="Add your content here. Use the toolbar to format text, add images, embed videos, etc."
								disabled={isSubmitting}
							/>

							<Input
								name="display_order"
								type="number"
								label="Display Order"
								value={editData?.display_order?.toString() || '0'}
								disabled={isSubmitting}
							/>

							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									id="is_active"
									name="is_active"
									checked={editData?.is_active !== false}
									class="w-4 h-4 rounded border-input"
									disabled={isSubmitting}
								/>
								<label for="is_active" class="text-sm font-medium">
									Active (show on cards)
								</label>
							</div>
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									editingCustomSection = null;
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="space-y-4">
				{#if data.profile.custom_sections && data.profile.custom_sections.length > 0}
					{#each data.profile.custom_sections as section}
						<div class="bg-card rounded-lg border border-border p-6">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										<h3 class="text-lg font-semibold">{section.title}</h3>
										{#if !section.is_active}
											<span
												class="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
											>
												Hidden
											</span>
										{/if}
									</div>
									<div class="prose prose-sm dark:prose-invert max-w-none line-clamp-3">
										{@html section.content}
									</div>
									<p class="text-xs text-muted-foreground mt-2">
										Order: {section.display_order || 0} • Created {new Date(
											section.created_at
										).toLocaleDateString()}
									</p>
								</div>
								<div class="flex gap-2 ml-4">
									<Button
										size="sm"
										variant="outline"
										onclick={() => {
											editingCustomSection = section.id;
										}}
									>
										Edit
									</Button>
									<form
										method="POST"
										action="?/deleteCustomSection"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													showToast('success', 'Custom section deleted successfully!');
													await update({ reset: false });
												} else {
													showToast('error', 'Failed to delete custom section');
												}
											};
										}}
									>
										<input type="hidden" name="id" value={section.id} />
										<Button size="sm" variant="destructive" type="submit">Delete</Button>
									</form>
								</div>
							</div>
						</div>
					{/each}
				{:else}
					<div class="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
						<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-6 h-6 text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</div>
						<h3 class="text-lg font-semibold mb-2">No custom sections yet</h3>
						<p class="text-muted-foreground mb-4 max-w-md mx-auto">
							Create custom sections to add rich content like about me, services, portfolio, or any other information to your cards.
						</p>
						<Button onclick={() => (editingCustomSection = 'new')}>Create Your First Section</Button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
