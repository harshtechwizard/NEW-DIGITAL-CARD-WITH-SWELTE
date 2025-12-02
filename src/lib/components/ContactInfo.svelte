<script lang="ts">
	/**
	 * ContactInfo Component
	 * Displays contact information with clear labels and proper formatting
	 */

	interface Props {
		type: 'personal' | 'professional';
		email?: string | null;
		phone?: string | null;
		whatsapp?: string | null;
		website?: string | null;
		linkedin?: string | null;
		instagram?: string | null;
		facebook?: string | null;
	}

	let {
		type,
		email,
		phone,
		whatsapp,
		website,
		linkedin,
		instagram,
		facebook
	}: Props = $props();

	const isProfessional = $derived(type === 'professional');

	function handleWhatsAppClick(number: string) {
		const cleanNumber = number.replace(/[^0-9]/g, '');
		window.open(`https://wa.me/${cleanNumber}`, '_blank');
	}
</script>

<div class="space-y-3">
	<!-- Section Header -->
	<div class="flex items-center gap-2 mb-4">
		{#if isProfessional}
			<div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
					<path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
				</svg>
			</div>
			<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Contact</h3>
		{:else}
			<div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
				</svg>
			</div>
			<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Personal Contact</h3>
		{/if}
	</div>

	<!-- Email -->
	{#if email}
		<a
			href="mailto:{email}"
			class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
		>
			<div class="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor">
					<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
					<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
					{isProfessional ? 'Office Email' : 'Personal Email'}
				</p>
				<p class="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
					{email}
				</p>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</a>
	{/if}

	<!-- Phone -->
	{#if phone}
		<a
			href="tel:{phone}"
			class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
		>
			<div class="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor">
					<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
					{isProfessional ? 'Office Phone' : 'Mobile Number'}
				</p>
				<p class="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
					{phone}
				</p>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</a>
	{/if}

	<!-- WhatsApp -->
	{#if whatsapp}
		<button
			onclick={() => handleWhatsAppClick(whatsapp)}
			class="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
		>
			<div class="w-10 h-10 rounded-lg bg-white dark:bg-green-800 flex items-center justify-center shadow-sm">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
					<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
				</svg>
			</div>
			<div class="flex-1 min-w-0 text-left">
				<p class="text-xs font-medium text-green-700 dark:text-green-400">
					WhatsApp
				</p>
				<p class="text-sm font-medium text-green-900 dark:text-green-300 group-hover:text-green-700 dark:group-hover:text-green-200 transition-colors">
					{whatsapp}
				</p>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</button>
	{/if}

	<!-- Website -->
	{#if website}
		<a
			href={website}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
		>
			<div class="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
					{isProfessional ? 'Company Website' : 'Website'}
				</p>
				<p class="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
					{website.replace(/^https?:\/\//, '')}
				</p>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
				<path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
				<path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
			</svg>
		</a>
	{/if}

	<!-- Social Media -->
	{#if linkedin || instagram || facebook}
		<div class="pt-2">
			<p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
				{isProfessional ? 'Professional Social' : 'Personal Social'}
			</p>
			<div class="flex gap-2">
				{#if linkedin}
					<a
						href={linkedin}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
						</svg>
						<span class="text-xs font-medium text-blue-700 dark:text-blue-300">LinkedIn</span>
					</a>
				{/if}
				{#if instagram}
					<a
						href={instagram}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors group"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
						</svg>
						<span class="text-xs font-medium text-pink-700 dark:text-pink-300">Instagram</span>
					</a>
				{/if}
				{#if facebook}
					<a
						href={facebook}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
							<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
						</svg>
						<span class="text-xs font-medium text-blue-700 dark:text-blue-300">Facebook</span>
					</a>
				{/if}
			</div>
		</div>
	{/if}
</div>
