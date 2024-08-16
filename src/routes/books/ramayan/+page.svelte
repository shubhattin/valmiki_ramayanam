<script lang="ts">
	import MainAppBar from '@components/MainAppBar.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import { BiArrowBack } from 'svelte-icons-pack/bi';
	import Icon from '@tools/Icon.svelte';
	import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';

	let kANDa_selected = 0;
	let sarga_selected = 0;
	// let kANDa_selected = 1; // @warn
	// let sarga_selected = 1; // @warn
	let sarga_data: string[] = [];
	let sarga_loading = false;

	$: {
		(async () => {
			if (kANDa_selected === 0 || sarga_selected === 0) return;
			const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
			sarga_loading = true;
			const data = (
				(await all_sargas[`/data/ramayan/data/${kANDa_selected}/${sarga_selected}.json`]()) as any
			).default as string[];
			sarga_data = data;
			sarga_loading = false;
		})();
	}
	$: kANDa_selected && (sarga_selected = 0);

	const PAGE_INFO = {
		title: 'श्रीमद्रामायणम्',
		desciption: 'श्रीमद्रामायणस्य पठनम्'
	};
</script>

<svelte:head>
	<title>{PAGE_INFO.title}</title>
	<meta property="og:title" content={PAGE_INFO.title} />
	<meta name="description" content={PAGE_INFO.desciption} />
	<meta property="og:description" content={PAGE_INFO.desciption} />
	<meta property="og:site_name" content={PAGE_INFO.title} />
</svelte:head>

<MainAppBar>
	<span slot="start">
		<a
			class="text-xl"
			href="/"
			use:popup={{
				event: 'hover',
				target: 'home_popup',
				placement: 'bottom'
			}}
		>
			<Icon
				src={BiArrowBack}
				class="-mt-1 mr-1 text-2xl hover:fill-red-700 dark:hover:fill-sky-500"
			/>
			<div data-popup="home_popup" class="variant-ghost-tertiary px-1 text-base">
				Home Page
				<div class="bg-surface-100-800-token arrow" />
			</div>
		</a>
		<span class="ml-2 text-xl font-bold">{PAGE_INFO.title}</span>
	</span>
</MainAppBar>

<div class="mt-4 space-y-4">
	<label class="space-x-4">
		<span class="font-bold">Select kANDa</span>
		<select bind:value={kANDa_selected} class="select w-52">
			<option value={0}>Select</option>
			{#each rAmAyaNa_map as kANDa}
				<option value={kANDa.index}>{kANDa.index}. {kANDa.name_devanagari}</option>
			{/each}
		</select>
	</label>
	{#if kANDa_selected !== 0}
		{@const kANDa = rAmAyaNa_map[kANDa_selected - 1]}
		<label class="space-x-4">
			<span class="font-bold">Select Sarga</span>
			<select bind:value={sarga_selected} class="select w-52">
				<option value={0}>Select</option>
				{#each kANDa.sarga_data as sarga}
					<option value={sarga.index}>{sarga.index}. {sarga.name_devanagari}</option>
				{/each}
			</select>
		</label>
	{/if}
	{#if kANDa_selected !== 0 && sarga_selected !== 0}
		<!-- Make a scrollable contaainer with a border or 2 -->
		{#if !sarga_loading}
			<div
				class="space-y-3 overflow-scroll rounded-xl border-2 border-red-600 px-4 py-3 dark:border-yellow-300"
			>
				{#each sarga_data as line}
					<div><pre>{line}</pre></div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
