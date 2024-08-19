<script lang="ts">
	import { AppBar, popup } from '@skeletonlabs/skeleton';
	import ThemeChanger from './ThemeChanger.svelte';
	import { BiArrowBack, BiBookOpen, BiLogoGithub } from 'svelte-icons-pack/bi';
	import Icon from '@tools/Icon.svelte';
	import { SiGithub } from 'svelte-icons-pack/si';
	import { SiConvertio } from './icons';

	export let page: 'home' | 'convert' | 'excel_tool';
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<slot name="start" />
		{#if page !== 'home'}
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
					श्रीमद्रामायणम्
					<div class="bg-surface-100-800-token arrow" />
				</div>
			</a>
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="headline">
		<slot name="headline"><span></span></slot>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<slot name="end"></slot>
		<div class="space-x-2">
			<a
				class="text-xl"
				href="https://github.com/shubhattin/valmiki_ramayanam"
				target="_blank"
				rel="noopener noreferrer"
				use:popup={{
					event: 'hover',
					target: 'github_popup',
					placement: 'bottom'
				}}
			>
				<Icon
					src={SiGithub}
					class="-mt-1 mr-1 text-2xl hover:fill-indigo-700 dark:hover:fill-zinc-400"
				/>
				<div data-popup="github_popup" class="variant-ghost-tertiary px-1 text-base">
					Project's Github Page
					<div class="bg-surface-100-800-token arrow" />
				</div>
			</a>
			{#if page !== 'convert'}
				<a
					class="text-xl"
					href="/convert"
					use:popup={{
						event: 'hover',
						target: 'convert_popup',
						placement: 'bottom'
					}}
				>
					<Icon
						src={SiConvertio}
						class="text-2xl hover:fill-emerald-600 dark:hover:fill-zinc-400"
					/>
					<div data-popup="convert_popup" class="variant-ghost-tertiary px-1 text-base">
						Lipi Parivartak
						<div class="bg-surface-100-800-token arrow" />
					</div>
				</a>
			{/if}
		</div>
		<ThemeChanger />
	</svelte:fragment>
</AppBar>
