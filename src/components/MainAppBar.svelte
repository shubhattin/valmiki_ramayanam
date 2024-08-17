<script lang="ts">
	import { AppBar, popup } from '@skeletonlabs/skeleton';
	import ThemeChanger from './ThemeChanger.svelte';
	import { BiArrowBack, BiBookOpen } from 'svelte-icons-pack/bi';
	import Icon from '@tools/Icon.svelte';
	import { SiConvertio } from './icons';

	export let page: 'home' | 'convert' | 'ramayan';
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
					Home Page
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
		{#if page !== 'ramayan'}
			<a
				class="text-xl"
				href="/ramayan"
				use:popup={{
					event: 'hover',
					target: 'ramayan_popup',
					placement: 'bottom'
				}}
			>
				<span class="text-sm">रामायणम्</span>
				<Icon src={BiBookOpen} class="text-2xl hover:fill-red-700 dark:hover:fill-sky-500" />
				<div data-popup="ramayan_popup" class="variant-ghost-tertiary px-1 text-base">
					श्रीमद्रामायणम्
					<div class="bg-surface-100-800-token arrow" />
				</div>
			</a>
		{/if}
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
				<Icon src={SiConvertio} class="text-2xl hover:fill-red-700 dark:hover:fill-sky-500" />
				<div data-popup="convert_popup" class="variant-ghost-tertiary px-1 text-base">
					Lipi Parivartak
					<div class="bg-surface-100-800-token arrow" />
				</div>
			</a>
		{/if}
		<ThemeChanger />
	</svelte:fragment>
</AppBar>
