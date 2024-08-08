<script lang="ts">
	import MainAppBar from '@components/MainAppBar.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import { BiArrowBack } from 'svelte-icons-pack/bi';
	import Icon from '@tools/Icon.svelte';
	import { LANG_LIST } from '@tools/lang_list';
	import LipiLekhikA from '@tools/converter';
	import { FaCircleUp, FaCircleDown } from 'svelte-icons-pack/fa';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';

	let from_lang = 'Sanskrit';
	let to_lang = 'Telugu';

	let from_text = writable('');
	let to_text = writable('');

	$: {
		LipiLekhikA.k.load_lang(from_lang);
		LipiLekhikA.k.load_lang(to_lang);
	}

	function convert_text(
		source_text: string,
		target: Writable<string>,
		source_lang: string,
		target_lang: string
	) {
		target.set(LipiLekhikA.convert(source_text, source_lang, target_lang));
	}
</script>

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
		<span class="ml-2 text-xl font-bold">Lipi Parivartak</span>
	</span>
</MainAppBar>

<div class="mt-4">
	<div class="space-y-2">
		<select class="select" bind:value={from_lang}>
			{#each LANG_LIST as lang (lang)}
				<option value={lang}>{lang}</option>
			{/each}
		</select>
		<textarea
			class="textarea h-56"
			placeholder={`Enter text in ${from_lang}`}
			bind:value={$from_text}
		></textarea>
	</div>
	<div class="my-3 flex justify-center space-x-3">
		<button
			class="btn m-0 p-0"
			on:click={() => convert_text($to_text, from_text, to_lang, from_lang)}
			><Icon
				src={FaCircleUp}
				class="text-3xl hover:text-gray-500 dark:hover:text-gray-400"
			/></button
		>
		<button
			class="btn m-0 p-0"
			on:click={() => convert_text($from_text, to_text, from_lang, to_lang)}
			><Icon
				src={FaCircleDown}
				class="text-3xl hover:text-gray-500 dark:hover:text-gray-400"
			/></button
		>
	</div>
	<div class="space-y-2">
		<select class="select" bind:value={to_lang}>
			{#each LANG_LIST as lang (lang)}
				<option value={lang}>{lang}</option>
			{/each}
		</select>
		<textarea class="textarea h-56" placeholder={`Enter text in ${to_lang}`} bind:value={$to_text}
		></textarea>
	</div>
</div>
