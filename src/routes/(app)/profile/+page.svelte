<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let activeTab = $state('personal');
	let editingProfessional = $state<string | null>(null);
	let editingEducation = $state<string | null>(null);
	let editingAward = $state<string | null>(null);
	let editingProduct = $state<string | null>(null);
	let editingPhoto = $state<string | null>(null);

	let companyLogoUrl = $state('');
	let productPhotoUrl = $state('');
	let galleryPhotoUrl = $state('');

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

	const tabs = [
		{ id: 'personal', label: 'Personal Info' },
		{ id: 'professional', label: 'Professional Info' },
		{ id: 'education', label: 'Education' },
		{ id: 'awards', label: 'Awards' },
		{ id: 'products', label: 'Products/Services' },
		{ id: 'gallery', label: 'Photo Gallery' }
	];
</script>

<div class="container mx-auto py-8 px-4 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">Profile Management</h1>

	{#if form?.success}
		<div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
			{form.message}
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
			<h2 class="text-2xl font-semibold mb-6">Personal Information</h2>
			<form method="POST" action="?/savePersonalInfo" use:enhance>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						name="full_name"
						label="Full Name"
						bind:value={personalData.full_name}
						required
						error={form?.error}
					/>
					<Input
						name="date_of_birth"
						type="date"
						label="Date of Birth"
						bind:value={personalData.date_of_birth}
					/>
					<Input
						name="primary_email"
						type="email"
						label="Primary Email"
						bind:value={personalData.primary_email}
					/>
					<Input
						name="secondary_email"
						type="email"
						label="Secondary Email"
						bind:value={personalData.secondary_email}
					/>
					<Input
						name="mobile_number"
						type="tel"
						label="Mobile Number"
						bind:value={personalData.mobile_number}
						placeholder="+1234567890"
					/>
					<Input
						name="phone_number"
						type="tel"
						label="Phone Number"
						bind:value={personalData.phone_number}
						placeholder="+1234567890"
					/>
					<Input
						name="whatsapp_number"
						type="tel"
						label="WhatsApp Number"
						bind:value={personalData.whatsapp_number}
						placeholder="+1234567890"
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
					<input type="hidden" name="profile_photo_url" value={personalData.profile_photo_url} />
				</div>

				<div class="mt-6">
					<Textarea
						name="bio"
						label="Bio"
						bind:value={personalData.bio}
						rows={4}
						maxlength={500}
						placeholder="Tell us about yourself..."
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
						/>
						<Input
							name="facebook_url"
							type="url"
							label="Facebook"
							bind:value={personalData.facebook_url}
							placeholder="https://facebook.com/username"
						/>
						<Input
							name="linkedin_url"
							type="url"
							label="LinkedIn"
							bind:value={personalData.linkedin_url}
							placeholder="https://linkedin.com/in/username"
						/>
					</div>
				</div>

				<div class="mt-8 flex justify-end">
					<Button type="submit">Save Personal Info</Button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Professional Info Tab -->
	{#if activeTab === 'professional'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-semibold">Professional Information</h2>
				<Button onclick={() => (editingProfessional = 'new')}>Add Professional Info</Button>
			</div>

			{#if editingProfessional}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingProfessional === 'new' ? 'Add' : 'Edit'} Professional Info
					</h3>
					<form method="POST" action="?/saveProfessionalInfo" use:enhance>
						{#if editingProfessional !== 'new'}
							<input type="hidden" name="id" value={editingProfessional} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input name="designation" label="Designation" />
							<Input name="company_name" label="Company Name" />
							<Input name="company_website" type="url" label="Company Website" />
							<Input name="office_email" type="email" label="Office Email" />
							<Input name="office_phone" type="tel" label="Office Phone" />
							<Input name="whatsapp_number" type="tel" label="WhatsApp Number" />
							<Input name="department" label="Department" />
							<Input name="office_opening_time" label="Opening Time" placeholder="09:00 AM" />
							<Input name="office_closing_time" label="Closing Time" placeholder="05:00 PM" />
							<Input name="office_days" label="Office Days" placeholder="Mon-Fri" />
						</div>

						<div class="mt-6">
							<FileUpload
								bucket="company-logos"
								bind:currentUrl={companyLogoUrl}
								maxSizeMB={10}
								label="Company Logo"
								description="Upload company logo (max 10MB)"
							/>
							<input type="hidden" name="company_logo_url" value={companyLogoUrl} />
						</div>

						<div class="mt-6">
							<h4 class="text-lg font-medium mb-4">Social Media</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Input name="instagram_url" type="url" label="Instagram" />
								<Input name="facebook_url" type="url" label="Facebook" />
								<Input name="linkedin_url" type="url" label="LinkedIn" />
							</div>
						</div>

						<div class="mt-8 flex justify-end gap-4">
							<Button type="button" variant="outline" onclick={() => (editingProfessional = null)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each data.profile.professional_info as prof}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start mb-4">
							<div>
								<h3 class="text-lg font-semibold">{prof.designation || 'No Designation'}</h3>
								<p class="text-muted-foreground">{prof.company_name || 'No Company'}</p>
							</div>
							<div class="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onclick={() => (editingProfessional = prof.id)}
								>
									Edit
								</Button>
								<form method="POST" action="?/deleteProfessionalInfo" use:enhance>
									<input type="hidden" name="id" value={prof.id} />
									<Button size="sm" variant="destructive" type="submit">Delete</Button>
								</form>
							</div>
						</div>
						{#if prof.office_email}
							<p class="text-sm">Email: {prof.office_email}</p>
						{/if}
						{#if prof.office_phone}
							<p class="text-sm">Phone: {prof.office_phone}</p>
						{/if}
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
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingEducation === 'new' ? 'Add' : 'Edit'} Education
					</h3>
					<form method="POST" action="?/saveEducation" use:enhance>
						{#if editingEducation !== 'new'}
							<input type="hidden" name="id" value={editingEducation} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input name="degree_name" label="Degree Name" required />
							<Input name="institution" label="Institution" required />
							<Input name="year_completed" type="number" label="Year Completed" />
						</div>
						<div class="mt-6">
							<Textarea name="description" label="Description" rows={3} />
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button type="button" variant="outline" onclick={() => (editingEducation = null)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="space-y-4">
				{#each data.profile.education as edu}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-lg font-semibold">{edu.degree_name}</h3>
								<p class="text-muted-foreground">{edu.institution}</p>
								{#if edu.year_completed}
									<p class="text-sm text-muted-foreground mt-1">{edu.year_completed}</p>
								{/if}
								{#if edu.description}
									<p class="text-sm mt-2">{edu.description}</p>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button size="sm" variant="outline" onclick={() => (editingEducation = edu.id)}>
									Edit
								</Button>
								<form method="POST" action="?/deleteEducation" use:enhance>
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
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">{editingAward === 'new' ? 'Add' : 'Edit'} Award</h3>
					<form method="POST" action="?/saveAward" use:enhance>
						{#if editingAward !== 'new'}
							<input type="hidden" name="id" value={editingAward} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input name="title" label="Award Title" required />
							<Input name="issuing_org" label="Issuing Organization" required />
							<Input name="date_received" type="date" label="Date Received" />
							<Input name="expiry_date" type="date" label="Expiry Date" />
							<Input name="certificate_url" type="url" label="Certificate URL" class="md:col-span-2" />
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button type="button" variant="outline" onclick={() => (editingAward = null)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each data.profile.awards as award}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start mb-4">
							<div>
								<h3 class="text-lg font-semibold">{award.title}</h3>
								<p class="text-muted-foreground">{award.issuing_org}</p>
								{#if award.date_received}
									<p class="text-sm text-muted-foreground mt-1">
										{new Date(award.date_received).toLocaleDateString()}
									</p>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button size="sm" variant="outline" onclick={() => (editingAward = award.id)}>
									Edit
								</Button>
								<form method="POST" action="?/deleteAward" use:enhance>
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
				<Button onclick={() => (editingProduct = 'new')}>Add Product/Service</Button>
			</div>

			{#if editingProduct}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">
						{editingProduct === 'new' ? 'Add' : 'Edit'} Product/Service
					</h3>
					<form method="POST" action="?/saveProductService" use:enhance>
						{#if editingProduct !== 'new'}
							<input type="hidden" name="id" value={editingProduct} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input name="name" label="Name" required />
							<Input name="category" label="Category" />
							<Input name="website_link" type="url" label="Website Link" />
						</div>
						<div class="mt-6">
							<FileUpload
								bucket="product-photos"
								bind:currentUrl={productPhotoUrl}
								maxSizeMB={2}
								label="Product Photo"
								description="Upload product photo (max 2MB)"
							/>
							<input type="hidden" name="photo_url" value={productPhotoUrl} />
						</div>
						<div class="mt-6">
							<Textarea name="description" label="Description" rows={3} maxlength={500} />
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button type="button" variant="outline" onclick={() => (editingProduct = null)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each data.profile.products_services as product}
					<div class="bg-card rounded-lg border border-border p-6">
						<div class="flex justify-between items-start mb-4">
							<div>
								<h3 class="text-lg font-semibold">{product.name}</h3>
								{#if product.category}
									<p class="text-sm text-muted-foreground">{product.category}</p>
								{/if}
								{#if product.description}
									<p class="text-sm mt-2">{product.description}</p>
								{/if}
							</div>
						</div>
						<div class="flex gap-2 mt-4">
							<Button size="sm" variant="outline" onclick={() => (editingProduct = product.id)}>
								Edit
							</Button>
							<form method="POST" action="?/deleteProductService" use:enhance>
								<input type="hidden" name="id" value={product.id} />
								<Button size="sm" variant="destructive" type="submit">Delete</Button>
							</form>
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
				<Button onclick={() => (editingPhoto = 'new')}>Add Photo</Button>
			</div>

			{#if editingPhoto}
				<div class="bg-card rounded-lg border border-border p-6">
					<h3 class="text-xl font-medium mb-6">{editingPhoto === 'new' ? 'Add' : 'Edit'} Photo</h3>
					<form method="POST" action="?/savePhotoGallery" use:enhance>
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
							<input type="hidden" name="photo_url" value={galleryPhotoUrl} />
							<Input name="caption" label="Caption" />
							<Input name="display_order" type="number" label="Display Order" />
						</div>
						<div class="mt-8 flex justify-end gap-4">
							<Button type="button" variant="outline" onclick={() => (editingPhoto = null)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
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
							<Button size="sm" variant="outline" onclick={() => (editingPhoto = photo.id)}>
								Edit
							</Button>
							<form method="POST" action="?/deletePhotoGallery" use:enhance>
								<input type="hidden" name="id" value={photo.id} />
								<Button size="sm" variant="destructive" type="submit">Delete</Button>
							</form>
						</div>
						{#if photo.caption}
							<p class="text-sm text-center mt-2">{photo.caption}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
