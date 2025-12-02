<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardDescription from '$lib/components/ui/CardDescription.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import BusinessCard from '$lib/components/BusinessCard.svelte';
	import QRCodeDisplay from '$lib/components/QRCodeDisplay.svelte';
	import NFCDisplay from '$lib/components/NFCDisplay.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Pre-fill form state with existing card data
	let cardName = $state(data.card.name);
	let templateType = $state<
		'personal-small' | 'personal-detailed' | 'professional-small' | 'professional-detailed' | 'custom'
	>(data.card.template_type || 'personal-small');
	let isActive = $state(data.card.is_active);
	let isSubmitting = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Pre-fill field configuration state with existing data
	let selectedFields = $state({
		full_name: data.card.fields_config?.full_name ?? true,
		primary_email: data.card.fields_config?.primary_email ?? true,
		mobile_number: data.card.fields_config?.mobile_number ?? false,
		alternate_mobile: data.card.fields_config?.alternate_mobile ?? false,
		whatsapp_number: data.card.fields_config?.whatsapp_number ?? false,
		bio: data.card.fields_config?.bio ?? false,
		profile_photo_url: data.card.fields_config?.profile_photo_url ?? false,
		social_instagram: data.card.fields_config?.social_instagram ?? false,
		social_facebook: data.card.fields_config?.social_facebook ?? false,
		social_linkedin: data.card.fields_config?.social_linkedin ?? false,
		professionalIds: data.card.fields_config?.professionalIds || [],
		linkedin_urls: data.card.fields_config?.linkedin_urls || [],
		professional_emails: data.card.fields_config?.professional_emails || [],
		professional_phones: data.card.fields_config?.professional_phones || [],
		professional_instagrams: data.card.fields_config?.professional_instagrams || [],
		professional_facebooks: data.card.fields_config?.professional_facebooks || [],
		educationIds: data.card.fields_config?.educationIds || [],
		awardIds: data.card.fields_config?.awardIds || [],
		productServiceIds: data.card.fields_config?.productServiceIds || [],
		photoIds: data.card.fields_config?.photoIds || []
	});

	// Pre-fill design configuration state with existing data
	let designConfig = $state({
		primaryColor: data.card.design_config?.primaryColor || '#3b82f6',
		fontFamily: data.card.design_config?.fontFamily || 'Inter',
		layout: (data.card.design_config?.layout || 'vertical') as 'vertical' | 'horizontal'
	});

	const isProfileComplete = $derived(
		Boolean(data.personalInfo && data.personalInfo.full_name && data.personalInfo.full_name.trim() !== '')
	);

	function toggleProfessional(profId: string) {
		const isSelected = selectedFields.professionalIds.includes(profId);
		if (isSelected) {
			selectedFields.professionalIds = selectedFields.professionalIds.filter((id) => id !== profId);
			selectedFields.linkedin_urls = selectedFields.linkedin_urls.filter((id) => id !== profId);
			selectedFields.professional_emails = selectedFields.professional_emails.filter(
				(id) => id !== profId
			);
			selectedFields.professional_phones = selectedFields.professional_phones.filter(
				(id) => id !== profId
			);
			selectedFields.professional_instagrams = selectedFields.professional_instagrams.filter(
				(id) => id !== profId
			);
			selectedFields.professional_facebooks = selectedFields.professional_facebooks.filter(
				(id) => id !== profId
			);
		} else {
			selectedFields.professionalIds = [...selectedFields.professionalIds, profId];
		}
	}

	function toggleProfessionalField(
		profId: string,
		key: 'linkedin_urls' | 'professional_emails' | 'professional_phones' | 'professional_instagrams' | 'professional_facebooks'
	) {
		const current = selectedFields[key];
		selectedFields[key] = current.includes(profId)
			? current.filter((id) => id !== profId)
			: [...current, profId];
	}

	function toggleEducation(eduId: string) {
		selectedFields.educationIds = selectedFields.educationIds.includes(eduId)
			? selectedFields.educationIds.filter((id) => id !== eduId)
			: [...selectedFields.educationIds, eduId];
	}

	function toggleAward(awardId: string) {
		selectedFields.awardIds = selectedFields.awardIds.includes(awardId)
			? selectedFields.awardIds.filter((id) => id !== awardId)
			: [...selectedFields.awardIds, awardId];
	}

	async function handleSubmit() {
		if (!cardName) {
			error = 'Card name is required';
			return;
		}

		isSubmitting = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch('/api/cards', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: data.card.id,
					name: cardName,
					template_type: templateType,
					fields_config: selectedFields,
					design_config: designConfig,
					is_active: isActive
				})
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Failed to update card';
				return;
			}

			// Success
			successMessage = 'Card updated successfully!';
			
			// Redirect to cards list after a short delay
			setTimeout(() => {
				goto('/cards');
			}, 1500);
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error('Card update error:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		goto('/cards');
	}
</script>

<svelte:head>
	<title>Edit Card - {data.card.name} - Digital Card Studio</title>
	<meta name="description" content="Edit your digital business card" />
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 py-8 max-w-7xl">
		<Button variant="ghost" onclick={handleCancel} class="mb-6">
			{#snippet children()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-4 h-4 mr-2"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
						clip-rule="evenodd"
					/>
				</svg>
				Back to My Cards
			{/snippet}
		</Button>

		<h1 class="text-3xl font-bold text-foreground mb-2">Edit Card</h1>
		<p class="text-muted-foreground mb-8">
			Editing: <span class="font-mono text-foreground">{data.card.name}</span>
		</p>

		{#if !isProfileComplete}
			<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
				<div class="flex items-start">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					<div>
						<h3 class="font-semibold text-yellow-800 dark:text-yellow-200">
							Complete Your Profile
						</h3>
						<p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
							Please complete your profile information before editing this card.
							<a href="/profile" class="underline font-medium">Go to Profile</a>
						</p>
					</div>
				</div>
			</div>
		{/if}

		{#if error}
			<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
				<p class="font-medium">Error</p>
				<p class="text-sm">{error}</p>
			</div>
		{/if}

		{#if successMessage}
			<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded mb-6">
				<p class="font-medium">Success</p>
				<p class="text-sm">{successMessage}</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Left Column - Configuration -->
			<div class="space-y-6">
				<!-- Card Details -->
				<Card>
					<CardHeader>
						<CardTitle>
							{#snippet children()}Card Details{/snippet}
						</CardTitle>
						<CardDescription>
							{#snippet children()}Basic information about your card{/snippet}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<Input
								name="cardName"
								label="Card Name"
								bind:value={cardName}
								placeholder="e.g., Personal, Work, Freelance"
								required
							/>

							<div class="space-y-2">
								<Label for="templateType">
									{#snippet children()}Template Type{/snippet}
								</Label>
								<Select
									name="templateType"
									bind:value={templateType}
									options={[
										{ value: 'personal-small', label: 'Personal - Small' },
										{ value: 'personal-detailed', label: 'Personal - Detailed' },
										{ value: 'professional-small', label: 'Professional - Small' },
										{ value: 'professional-detailed', label: 'Professional - Detailed' },
										{ value: 'custom', label: 'Custom' }
									]}
								/>
							</div>

							<div class="flex items-center space-x-2">
								<Checkbox
									name="isActive"
									bind:checked={isActive}
								/>
								<Label for="isActive">
									{#snippet children()}
										<span class="font-medium">Card is Active</span>
										<span class="text-sm text-muted-foreground block">
											Inactive cards cannot be viewed publicly
										</span>
									{/snippet}
								</Label>
							</div>

							<div class="pt-2 border-t border-border">
								<p class="text-sm text-muted-foreground">
									<span class="font-medium">Card URL:</span>
									<a
										href="/card/{data.card.slug}"
										target="_blank"
										class="text-primary hover:underline ml-1"
									>
										/card/{data.card.slug}
									</a>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Field Selection -->
				<Card>
					<CardHeader>
						<CardTitle>
							{#snippet children()}Select Information{/snippet}
						</CardTitle>
						<CardDescription>
							{#snippet children()}Choose which information to display on this card{/snippet}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-6">
							<!-- Personal Information -->
							<div>
								<h3 class="font-semibold mb-3">Personal Information</h3>
								<div class="space-y-2">
									<div class="flex items-center space-x-2">
										<Checkbox
											name="full_name"
											bind:checked={selectedFields.full_name}
										/>
										<Label for="full_name">
											{#snippet children()}
												Full Name
												{#if data.personalInfo?.full_name}
													<span class="text-muted-foreground">({data.personalInfo.full_name})</span>
												{/if}
											{/snippet}
										</Label>
									</div>

									<div class="flex items-center space-x-2">
										<Checkbox
											name="primary_email"
											bind:checked={selectedFields.primary_email}
										/>
										<Label for="primary_email">
											{#snippet children()}
												Primary Email
												{#if data.personalInfo?.primary_email}
													<span class="text-muted-foreground">({data.personalInfo.primary_email})</span>
												{/if}
											{/snippet}
										</Label>
									</div>

									<div class="flex items-center space-x-2">
										<Checkbox
											name="mobile_number"
											bind:checked={selectedFields.mobile_number}
										/>
										<Label for="mobile_number">
											{#snippet children()}
												Mobile Number
												{#if data.personalInfo?.mobile_number}
													<span class="text-muted-foreground">({data.personalInfo.mobile_number})</span>
												{/if}
											{/snippet}
										</Label>
									</div>

									<div class="flex items-center space-x-2">
										<Checkbox
											name="whatsapp_number"
											bind:checked={selectedFields.whatsapp_number}
											disabled={!data.personalInfo?.whatsapp_number}
										/>
										<Label for="whatsapp_number">
											{#snippet children()}
												WhatsApp
												{#if data.personalInfo?.whatsapp_number}
													<span class="text-muted-foreground">({data.personalInfo.whatsapp_number})</span>
												{/if}
											{/snippet}
										</Label>
									</div>

									<div class="flex items-center space-x-2">
										<Checkbox
											name="bio"
											bind:checked={selectedFields.bio}
										/>
										<Label for="bio">
											{#snippet children()}Bio{/snippet}
										</Label>
									</div>

									<div class="flex items-center space-x-2">
										<Checkbox
											name="profile_photo_url"
											bind:checked={selectedFields.profile_photo_url}
										/>
										<Label for="profile_photo_url">
											{#snippet children()}Profile Photo{/snippet}
										</Label>
									</div>
								</div>
							</div>

							<!-- Professional Information -->
							<div>
								<h3 class="font-semibold mb-3">Professional Information</h3>
								{#if data.professionalInfo.length === 0}
									<p class="text-sm text-muted-foreground">
										No professional entries yet. Add them in your profile.
									</p>
								{:else}
									<div class="space-y-4">
										{#each data.professionalInfo as entry (entry.id)}
											<div class="border border-border rounded-lg p-3 space-y-2">
												<div class="flex items-center space-x-2">
													<Checkbox
														name={entry.id}
														checked={selectedFields.professionalIds.includes(entry.id)}
														onchange={() => toggleProfessional(entry.id)}
													/>
													<Label for={entry.id}>
														{#snippet children()}
															<span class="font-medium">
																{entry.designation} at {entry.company_name}
															</span>
														{/snippet}
													</Label>
												</div>

												{#if selectedFields.professionalIds.includes(entry.id)}
													<div class="space-y-2 ml-6">
														{#if entry.office_email}
															<div class="flex items-center space-x-2">
																<Checkbox
																	name={`email-${entry.id}`}
																	checked={selectedFields.professional_emails.includes(entry.id)}
																	onchange={() => toggleProfessionalField(entry.id, 'professional_emails')}
																/>
																<Label for={`email-${entry.id}`}>
																	{#snippet children()}
																		<span class="text-sm">Show Office Email</span>
																	{/snippet}
																</Label>
															</div>
														{/if}

														{#if entry.office_phone}
															<div class="flex items-center space-x-2">
																<Checkbox
																	name={`phone-${entry.id}`}
																	checked={selectedFields.professional_phones.includes(entry.id)}
																	onchange={() => toggleProfessionalField(entry.id, 'professional_phones')}
																/>
																<Label for={`phone-${entry.id}`}>
																	{#snippet children()}
																		<span class="text-sm">Show Office Phone</span>
																	{/snippet}
																</Label>
															</div>
														{/if}
													</div>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Education -->
							<div>
								<h3 class="font-semibold mb-3">Education</h3>
								{#if data.education.length === 0}
									<p class="text-sm text-muted-foreground">
										No education entries yet. Add them in your profile.
									</p>
								{:else}
									<div class="space-y-2">
										{#each data.education as entry (entry.id)}
											<div class="flex items-center space-x-2">
												<Checkbox
													name={`edu-${entry.id}`}
													checked={selectedFields.educationIds.includes(entry.id)}
													onchange={() => toggleEducation(entry.id)}
												/>
												<Label for={`edu-${entry.id}`}>
													{#snippet children()}
														<span class="text-sm">{entry.degree_name} - {entry.institution}</span>
													{/snippet}
												</Label>
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Awards -->
							<div>
								<h3 class="font-semibold mb-3">Awards & Certifications</h3>
								{#if data.awards.length === 0}
									<p class="text-sm text-muted-foreground">
										No awards yet. Add them in your profile.
									</p>
								{:else}
									<div class="space-y-2">
										{#each data.awards as entry (entry.id)}
											<div class="flex items-center space-x-2">
												<Checkbox
													name={`award-${entry.id}`}
													checked={selectedFields.awardIds.includes(entry.id)}
													onchange={() => toggleAward(entry.id)}
												/>
												<Label for={`award-${entry.id}`}>
													{#snippet children()}
														<span class="text-sm">{entry.title} - {entry.issuing_org}</span>
													{/snippet}
												</Label>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Design Customization -->
				<Card>
					<CardHeader>
						<CardTitle>
							{#snippet children()}Design Customization{/snippet}
						</CardTitle>
						<CardDescription>
							{#snippet children()}Customize the look and feel of your card{/snippet}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="primaryColor">
									{#snippet children()}Primary Color{/snippet}
								</Label>
								<input
									type="color"
									id="primaryColor"
									bind:value={designConfig.primaryColor}
									class="h-10 w-full rounded-md border border-input"
								/>
							</div>

							<div class="space-y-2">
								<Label for="layout">
									{#snippet children()}Layout{/snippet}
								</Label>
								<Select
									name="layout"
									bind:value={designConfig.layout}
									options={[
										{ value: 'vertical', label: 'Vertical' },
										{ value: 'horizontal', label: 'Horizontal' }
									]}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Action Buttons -->
				<div class="flex gap-4">
					<Button
						onclick={handleSubmit}
						disabled={isSubmitting || !isProfileComplete}
						class="flex-1"
					>
						{#snippet children()}
							{#if isSubmitting}
								<svg
									class="animate-spin -ml-1 mr-3 h-5 w-5"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Saving Changes...
							{:else}
								Save Changes
							{/if}
						{/snippet}
					</Button>
					<Button
						onclick={handleCancel}
						variant="outline"
						disabled={isSubmitting}
						class="flex-1"
					>
						{#snippet children()}Cancel{/snippet}
					</Button>
				</div>
			</div>

			<!-- Right Column - Live Preview & QR Code -->
			<div class="lg:sticky lg:top-8 lg:self-start space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>
							{#snippet children()}Live Preview{/snippet}
						</CardTitle>
						<CardDescription>
							{#snippet children()}See how your card will look{/snippet}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<BusinessCard
							personalInfo={data.personalInfo}
							professionalInfo={data.professionalInfo}
							education={data.education.filter(e => selectedFields.educationIds.includes(e.id))}
							awards={data.awards.filter(a => selectedFields.awardIds.includes(a.id))}
							fieldsConfig={selectedFields}
							designConfig={designConfig}
							templateType={templateType}
						/>
					</CardContent>
				</Card>

				<!-- QR Code Display -->
				<QRCodeDisplay slug={data.card.slug} cardName={data.card.name} />

				<!-- NFC Display -->
				<NFCDisplay slug={data.card.slug} cardName={data.card.name} />
			</div>
		</div>
	</div>
</div>
