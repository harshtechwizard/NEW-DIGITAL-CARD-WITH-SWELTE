<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		name: string;
		accept?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		label?: string;
		preview?: string;
		maxSize?: number; // in MB
		class?: string;
		onFileSelect?: (file: File | null) => void;
	}

	let {
		name,
		accept = 'image/jpeg,image/png,image/webp',
		required = false,
		disabled = false,
		error,
		label,
		preview = $bindable(''),
		maxSize = 5,
		class: className,
		onFileSelect
	}: Props = $props();

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);
	let localError = $state('');

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		processFile(file);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files[0];
		processFile(file);
	}

	function processFile(file: File | undefined) {
		localError = '';
		
		if (!file) {
			preview = '';
			onFileSelect?.(null);
			return;
		}

		// Validate file size
		if (file.size > maxSize * 1024 * 1024) {
			localError = `File size must be less than ${maxSize}MB`;
			preview = '';
			onFileSelect?.(null);
			return;
		}

		// Validate file type
		const acceptedTypes = accept.split(',').map(t => t.trim());
		if (!acceptedTypes.includes(file.type)) {
			localError = 'Invalid file type';
			preview = '';
			onFileSelect?.(null);
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			preview = e.target?.result as string;
		};
		reader.readAsDataURL(file);

		onFileSelect?.(file);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}
</script>

<div class="space-y-2">
	{#if label}
		<label for={name} class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</label>
	{/if}
	
	<div
		class={cn(
			'relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50 transition-colors',
			isDragging && 'border-primary bg-accent',
			(error || localError) && 'border-destructive',
			disabled && 'opacity-50 cursor-not-allowed',
			className
		)}
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		onclick={() => !disabled && fileInput.click()}
		role="button"
		tabindex="0"
	>
		{#if preview}
			<img src={preview} alt="Preview" class="h-full w-auto object-contain rounded-lg" />
		{:else}
			<div class="flex flex-col items-center justify-center pt-5 pb-6">
				<svg class="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
				</svg>
				<p class="mb-2 text-sm text-muted-foreground">
					<span class="font-semibold">Click to upload</span> or drag and drop
				</p>
				<p class="text-xs text-muted-foreground">Max {maxSize}MB</p>
			</div>
		{/if}
		
		<input
			bind:this={fileInput}
			type="file"
			{name}
			id={name}
			{accept}
			{required}
			{disabled}
			onchange={handleFileChange}
			class="hidden"
		/>
	</div>
	
	{#if error || localError}
		<p class="text-sm text-destructive">{error || localError}</p>
	{/if}
</div>
