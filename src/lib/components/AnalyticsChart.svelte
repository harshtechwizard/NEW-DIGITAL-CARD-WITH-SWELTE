<script lang="ts">
	/**
	 * Analytics Chart Component
	 * 
	 * A simple, responsive line chart for displaying daily view data.
	 * Built with SVG for lightweight rendering without external chart libraries.
	 * 
	 * Features:
	 * - Responsive design
	 * - Hover tooltips
	 * - Smooth line rendering
	 * - Accessible with ARIA labels
	 * 
	 * Requirements: 5.1, 12.4
	 */

	interface DailyViewData {
		date: string;
		views: number;
	}

	interface Props {
		data: DailyViewData[];
		height?: number;
		className?: string;
	}

	let { data, height = 300, className = '' }: Props = $props();

	// Calculate chart dimensions and scales
	const padding = { top: 20, right: 20, bottom: 40, left: 50 };
	const width = $derived(800); // Will be responsive via viewBox
	const chartWidth = $derived(width - padding.left - padding.right);
	const chartHeight = $derived(height - padding.top - padding.bottom);

	// Find min and max values
	const maxViews = $derived(Math.max(...data.map((d) => d.views), 1));
	const minViews = $derived(0);

	// Scale functions
	const xScale = $derived((index: number) => {
		return (index / Math.max(data.length - 1, 1)) * chartWidth;
	});

	const yScale = $derived((value: number) => {
		const range = maxViews - minViews;
		return chartHeight - ((value - minViews) / range) * chartHeight;
	});

	// Generate SVG path for line chart
	const linePath = $derived(() => {
		if (data.length === 0) return '';

		const points = data.map((d, i) => {
			const x = xScale(i);
			const y = yScale(d.views);
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	});

	// Generate area path (filled area under line)
	const areaPath = $derived(() => {
		if (data.length === 0) return '';

		const points = data.map((d, i) => {
			const x = xScale(i);
			const y = yScale(d.views);
			return `${x},${y}`;
		});

		const firstX = xScale(0);
		const lastX = xScale(data.length - 1);
		const bottomY = chartHeight;

		return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
	});

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	// Generate Y-axis ticks
	const yTicks = $derived.by(() => {
		const tickCount = 5;
		const ticks: number[] = [];
		for (let i = 0; i <= tickCount; i++) {
			ticks.push(Math.round((maxViews / tickCount) * i));
		}
		return ticks.reverse();
	});

	// Hover state
	let hoveredIndex = $state<number | null>(null);
	let hoveredPoint = $derived.by(() => {
		if (hoveredIndex === null || !data[hoveredIndex]) return null;
		const point = data[hoveredIndex];
		if (!point) return null;
		return {
			x: xScale(hoveredIndex),
			y: yScale(point.views),
			data: point
		};
	});

	function handleMouseMove(event: MouseEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left - padding.left;
		
		// Find closest data point
		const index = Math.round((x / chartWidth) * (data.length - 1));
		if (index >= 0 && index < data.length) {
			hoveredIndex = index;
		}
	}

	function handleMouseLeave() {
		hoveredIndex = null;
	}
</script>

<div class={`analytics-chart ${className}`}>
	{#if data.length === 0}
		<div class="flex items-center justify-center h-full text-muted-foreground">
			<p>No data available for the selected period</p>
		</div>
	{:else}
		<svg
			viewBox={`0 0 ${width} ${height}`}
			class="w-full h-auto"
			role="img"
			aria-label="Daily views chart"
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		>
			<!-- Y-axis -->
			<g class="y-axis">
				{#each yTicks as tick}
					<g transform={`translate(0, ${padding.top + yScale(tick)})`}>
						<line
							x1={padding.left}
							x2={width - padding.right}
							stroke="currentColor"
							stroke-opacity="0.1"
							stroke-width="1"
						/>
						<text
							x={padding.left - 10}
							y="0"
							text-anchor="end"
							dominant-baseline="middle"
							class="text-xs fill-muted-foreground"
						>
							{tick}
						</text>
					</g>
				{/each}
			</g>

			<!-- X-axis labels (show every nth label to avoid crowding) -->
			<g class="x-axis" transform={`translate(${padding.left}, ${height - padding.bottom})`}>
				{#each data as point, i}
					{#if data.length <= 10 || i % Math.ceil(data.length / 10) === 0}
						<text
							x={xScale(i)}
							y="20"
							text-anchor="middle"
							class="text-xs fill-muted-foreground"
						>
							{formatDate(point.date)}
						</text>
					{/if}
				{/each}
			</g>

			<!-- Chart area -->
			<g transform={`translate(${padding.left}, ${padding.top})`}>
				<!-- Area fill -->
				<path
					d={areaPath()}
					fill="hsl(var(--primary))"
					fill-opacity="0.1"
				/>

				<!-- Line -->
				<path
					d={linePath()}
					fill="none"
					stroke="hsl(var(--primary))"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<!-- Data points -->
				{#each data as point, i}
					<circle
						cx={xScale(i)}
						cy={yScale(point.views)}
						r="3"
						fill="hsl(var(--primary))"
						class="transition-all"
						class:scale-150={hoveredIndex === i}
					/>
				{/each}

				<!-- Hover indicator -->
				{#if hoveredPoint}
					<g>
						<!-- Vertical line -->
						<line
							x1={hoveredPoint.x}
							x2={hoveredPoint.x}
							y1="0"
							y2={chartHeight}
							stroke="hsl(var(--primary))"
							stroke-width="1"
							stroke-dasharray="4 4"
							opacity="0.5"
						/>

						<!-- Tooltip -->
						<g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 40})`}>
							<rect
								x="-50"
								y="0"
								width="100"
								height="35"
								rx="4"
								fill="hsl(var(--popover))"
								stroke="hsl(var(--border))"
								stroke-width="1"
							/>
							<text
								x="0"
								y="15"
								text-anchor="middle"
								class="text-xs font-medium fill-popover-foreground"
							>
								{formatDate(hoveredPoint.data?.date || '')}
							</text>
							<text
								x="0"
								y="28"
								text-anchor="middle"
								class="text-sm font-bold fill-primary"
							>
								{hoveredPoint.data?.views || 0} views
							</text>
						</g>
					</g>
				{/if}
			</g>
		</svg>
	{/if}
</div>

<style>
	.analytics-chart {
		width: 100%;
		user-select: none;
	}

	svg {
		overflow: visible;
	}

	.scale-150 {
		transform: scale(1.5);
	}
</style>
