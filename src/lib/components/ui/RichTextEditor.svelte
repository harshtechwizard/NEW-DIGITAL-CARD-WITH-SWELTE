<script lang="ts">
	/**
	 * Rich Text Editor Component
	 * Simple HTML editor with formatting toolbar
	 * For production: integrate Quill.js or TipTap
	 */

	interface Props {
		name: string;
		label?: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		maxLength?: number;
	}

	let {
		name,
		label,
		value = $bindable(''),
		placeholder = 'Enter your content...',
		required = false,
		disabled = false,
		error,
		maxLength = 51200
	}: Props = $props();

	let textarea: HTMLTextAreaElement;
	let showPreview = $state(false);

	function insertTag(openTag: string, closeTag: string) {
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		const before = value.substring(0, start);
		const after = value.substring(end);

		value = before + openTag + selectedText + closeTag + after;

		// Set cursor position
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				start + openTag.length,
				start + openTag.length + selectedText.length
			);
		}, 0);
	}

	function insertHeading(level: number) {
		insertTag(`<h${level}>`, `</h${level}>`);
	}

	function insertLink() {
		const url = prompt('Enter URL:');
		if (url) {
			insertTag(`<a href="${url}">`, '</a>');
		}
	}

	function insertImage() {
		const url = prompt('Enter image URL:');
		if (url) {
			const start = textarea.selectionStart;
			const before = value.substring(0, start);
			const after = value.substring(start);
			value = before + `<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 8px;" />` + after;
		}
	}

	function insertYouTube() {
		const url = prompt('Enter YouTube URL or embed code:');
		if (!url) return;

		let embedCode = url;

		// Convert YouTube URL to embed
		const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
		const match = url.match(youtubeRegex);

		if (match) {
			const videoId = match[1];
			embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
		}

		const start = textarea.selectionStart;
		const before = value.substring(0, start);
		const after = value.substring(start);
		value = before + '\n' + embedCode + '\n' + after;
	}

	const charCount = $derived(value.length);
	const isNearLimit = $derived(charCount > maxLength * 0.9);
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

	<!-- Toolbar -->
	<div class="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800 border border-input rounded-t-md">
		<!-- Headings -->
		<button
			type="button"
			onclick={() => insertHeading(2)}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Heading 2"
			{disabled}
		>
			H2
		</button>
		<button
			type="button"
			onclick={() => insertHeading(3)}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Heading 3"
			{disabled}
		>
			H3
		</button>

		<div class="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

		<!-- Formatting -->
		<button
			type="button"
			onclick={() => insertTag('<strong>', '</strong>')}
			class="px-2 py-1 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Bold"
			{disabled}
		>
			B
		</button>
		<button
			type="button"
			onclick={() => insertTag('<em>', '</em>')}
			class="px-2 py-1 text-sm italic hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Italic"
			{disabled}
		>
			I
		</button>
		<button
			type="button"
			onclick={() => insertTag('<u>', '</u>')}
			class="px-2 py-1 text-sm underline hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Underline"
			{disabled}
		>
			U
		</button>

		<div class="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

		<!-- Lists -->
		<button
			type="button"
			onclick={() => insertTag('<ul>\n<li>', '</li>\n</ul>')}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Bullet List"
			{disabled}
		>
			• List
		</button>
		<button
			type="button"
			onclick={() => insertTag('<ol>\n<li>', '</li>\n</ol>')}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Numbered List"
			{disabled}
		>
			1. List
		</button>

		<div class="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

		<!-- Media -->
		<button
			type="button"
			onclick={insertLink}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Insert Link"
			{disabled}
		>
			🔗 Link
		</button>
		<button
			type="button"
			onclick={insertImage}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Insert Image"
			{disabled}
		>
			🖼️ Image
		</button>
		<button
			type="button"
			onclick={insertYouTube}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
			title="Embed YouTube"
			{disabled}
		>
			▶️ YouTube
		</button>

		<div class="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

		<!-- Preview Toggle -->
		<button
			type="button"
			onclick={() => (showPreview = !showPreview)}
			class="px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded {showPreview
				? 'bg-slate-200 dark:bg-slate-700'
				: ''}"
			title="Toggle Preview"
		>
			{showPreview ? '📝 Edit' : '👁️ Preview'}
		</button>
	</div>

	<!-- Editor / Preview -->
	{#if showPreview}
		<div
			class="min-h-[200px] p-3 border border-input rounded-b-md bg-background prose prose-sm dark:prose-invert max-w-none"
		>
			{@html value || '<p class="text-muted-foreground">No content yet...</p>'}
		</div>
	{:else}
		<textarea
			bind:this={textarea}
			id={name}
			{name}
			bind:value
			{placeholder}
			{required}
			{disabled}
			rows={10}
			class="w-full px-3 py-2 border border-input bg-background rounded-b-md text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y {error
				? 'border-destructive focus:ring-destructive'
				: ''}"
		></textarea>
	{/if}

	<!-- Character Count & Error -->
	<div class="flex justify-between items-center text-xs">
		<div>
			{#if error}
				<p class="text-destructive">{error}</p>
			{/if}
		</div>
		<p class="text-muted-foreground {isNearLimit ? 'text-destructive font-medium' : ''}">
			{charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
		</p>
	</div>

	<!-- Help Text -->
	<details class="text-xs text-muted-foreground">
		<summary class="cursor-pointer hover:text-foreground">💡 Tips & Examples</summary>
		<div class="mt-2 space-y-2 pl-4">
			<p><strong>Paragraph:</strong> <code>&lt;p&gt;Your text here&lt;/p&gt;</code></p>
			<p><strong>Line break:</strong> <code>&lt;br /&gt;</code></p>
			<p>
				<strong>Div container:</strong>
				<code>&lt;div style="padding: 1rem;"&gt;Content&lt;/div&gt;</code>
			</p>
			<p>
				<strong>YouTube:</strong> Paste URL or embed code (e.g.,
				https://youtube.com/watch?v=VIDEO_ID)
			</p>
			<p><strong>Styling:</strong> Use inline styles for colors, spacing, etc.</p>
		</div>
	</details>
</div>
