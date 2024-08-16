<script lang="ts">
	import MainAppBar from '@components/MainAppBar.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import { BiArrowBack } from 'svelte-icons-pack/bi';
	import Icon from '@tools/Icon.svelte';
	import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
	import { fly, scale, slide } from 'svelte/transition';
	import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';

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

	// const download_excel_file = async () => {
	// 	const file_list = import.meta.glob('/data/ramayan/template/excel_file_template.xlsx', {
	// 		query: 'raw'
	// 	});
	// 	const file_binary_str = (
	// 		(await file_list['/data/ramayan/template/excel_file_template.xlsx']()) as any
	// 	).default;
	// };
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
		{@const kANDa = rAmAyaNa_map[kANDa_selected - 1]}
		<div class="space-x-3">
			{#if sarga_selected !== 1}
				<button
					on:click={() => (sarga_selected -= 1)}
					in:scale
					out:slide
					class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
				>
					<Icon class="-mt-1 mr-1 text-xl" src={TiArrowBackOutline} />
					Previous
				</button>
			{/if}
			{#if sarga_selected !== kANDa.sarga_data.length}
				<button
					on:click={() => (sarga_selected += 1)}
					in:scale
					out:slide
					class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
				>
					Next
					<Icon class="-mt-1 ml-1 text-xl" src={TiArrowForwardOutline} />
				</button>
			{/if}
			<!-- <button
				on:click={download_excel_file}
				class="variant-outline-success btn rounded-lg border-2 border-emerald-600 px-2 py-2 font-bold dark:border-emerald-400"
			>
				<Icon
					class="-mt-1 mr-2 text-2xl text-green-600 dark:text-green-400"
					src={RiDocumentFileExcel2Line}
				/>
				Download Excel File
			</button> -->
		</div>
		{#if !sarga_loading}
			<div
				transition:fly
				class="h-[65vh] space-y-3 overflow-scroll rounded-xl border-2 border-red-600 px-4 py-3 dark:border-yellow-300"
			>
				{#each sarga_data as line}
					<div><pre>{line}</pre></div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
