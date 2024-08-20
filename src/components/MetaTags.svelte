<script lang="ts">
	export let title: string;
	export let description: string | null = null;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta property="og:site_name" content={title} />
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
</svelte:head>
