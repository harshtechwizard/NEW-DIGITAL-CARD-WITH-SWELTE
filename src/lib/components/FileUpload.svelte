<script lang="ts">
	import { Upload, X, Loader2 } from 'lucide-svelte';

	interface Props {
		bucket: 'profile-photos' | 'company-logos' | 'product-photos' | 'gallery-photos';
		currentUrl?: string;
		onUploadComplete?: (url: string) => void;
		multiple?: boolean;
		accept?: string;
		maxSizeMB?: number;
		label?: string;
		description?: string;
	}

	let {
		bucket,
		currentUrl = $bindable(),
		onUploadComplete,
		multiple = false,
		accept = 'image/jpeg,image/png,image/webp',
		maxSizeMB = 5,
		label = 'Upload Image',
		description = 'Drag and drop or click to select'
	}: Props = $props();

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let previewUrl = $state<string | null>(currentUrl || null);
	let errorMessage = $state<string | null>(null);
	let uploadedUrls = $state<string[]>([]);

	// Update preview when currentUrl changes
	$effect(() => {
		if (currentUrl && !previewUrl) {
			previewUrl = currentUrl;
		}
	});

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			await handleFiles(files);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFiles(files);
		}
	}

	async function handleFiles(files: FileList) {
		errorMessage = null;

		// Validate file count
		if (!multiple && files.length > 1) {
			errorMessage = 'Please select only one file';
			return;
		}

		// Process files
		const filesToUpload = Array.from(files);

		for (const file of filesToUpload) {
			// Validate file type
			if (!accept.split(',').some((type) => file.type === type.trim())) {
				errorMessage = `Invalid file type. Accepted types: ${accept}`;
				continue;
			}

			// Validate file size
			const maxSizeBytes = maxSizeMB * 1024 * 1024;
			if (file.size > maxSizeBytes) {
				errorMessage = `File too large. Maximum size is ${maxSizeMB}MB`;
				continue;
			}

			// Show preview
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);

			// Upload file
			await uploadFile(file);
		}
	}

	async function uploadFile(file: File) {
		isUploading = true;
		uploadProgress = 0;
		errorMessage = null;

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('bucket', bucket);

			// Simulate progress (since we can't track actual upload progress easily)
			const progressInterval = setInterval(() => {
				if (uploadProgress < 90) {
					uploadProgress += 10;
				}
			}, 200);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			clearInterval(progressInterval);
			uploadProgress = 100;

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
				throw new Error(errorData.message || 'Upload failed');
			}

			const data = await response.json();

			if (data.success && data.url) {
				if (multiple) {
					uploadedUrls = [...uploadedUrls, data.url];
				} else {
					currentUrl = data.url;
					previewUrl = data.url;
				}

				// Call callback if provided
				if (onUploadComplete) {
					onUploadComplete(data.url);
				}
			}
		} catch (err) {
			console.error('Upload error:', err);
			errorMessage = err instanceof Error ? err.message : 'Upload failed';
			previewUrl = null;
		} finally {
			isUploading = false;
			uploadProgress = 0;
		}
	}

	function clearPreview() {
		previewUrl = null;
		currentUrl = undefined;
		errorMessage = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function removeUploadedImage(url: string) {
		uploadedUrls = uploadedUrls.filter((u) => u !== url);
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div class="w-full">
	{#if label}
		<label class="block text-sm font-medium mb-2">
			{label}
		</label>
	{/if}

	<!-- File Input (hidden) -->
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		onchange={handleFileSelect}
		class="hidden"
	/>

	<!-- Drop Zone -->
	<div
		class="relative border-2 border-dashed rounded-lg transition-colors {isDragging
			? 'border-primary bg-primary/5'
			: 'border-gray-300 dark:border-gray-700'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		{#if previewUrl && !multiple}
			<!-- Image Preview -->
			<div class="relative p-4">
				<img src={previewUrl} alt="Preview" class="w-full h-48 object-cover rounded-lg" />
				<button
					type="button"
					onclick={clearPreview}
					class="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
					disabled={isUploading}
				>
					<X class="w-4 h-4" />
				</button>
			</div>
		{:else}
			<!-- Upload Area -->
			<button
				type="button"
				onclick={triggerFileInput}
				disabled={isUploading}
				class="w-full p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isUploading}
					<Loader2 class="w-12 h-12 text-primary animate-spin" />
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Uploading... {uploadProgress}%
					</p>
				{:else}
					<Upload class="w-12 h-12 text-gray-400" />
					<div class="text-center">
						<p class="text-sm font-medium text-gray-700 dark:text-gray-300">
							{description}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
							{accept.split(',').join(', ')} (max {maxSizeMB}MB)
						</p>
					</div>
				{/if}
			</button>
		{/if}

		<!-- Progress Bar -->
		{#if isUploading && uploadProgress > 0}
			<div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
				<div
					class="h-full bg-primary transition-all duration-300"
					style="width: {uploadProgress}%"
				></div>
			</div>
		{/if}
	</div>

	<!-- Multiple Upload Preview -->
	{#if multiple && uploadedUrls.length > 0}
		<div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
			{#each uploadedUrls as url}
				<div class="relative group">
					<img src={url} alt="Uploaded" class="w-full h-32 object-cover rounded-lg" />
					<button
						type="button"
						onclick={() => removeUploadedImage(url)}
						class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<X class="w-3 h-3" />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Error Message -->
	{#if errorMessage}
		<p class="mt-2 text-sm text-red-600 dark:text-red-400">
			{errorMessage}
		</p>
	{/if}
</div>
