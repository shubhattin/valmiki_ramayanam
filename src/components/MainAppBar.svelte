<script lang="ts">
	import { AppBar, popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import ThemeChanger from './ThemeChanger.svelte';
	import { BiArrowBack } from 'svelte-icons-pack/bi';
	import Icon from '@tools/Icon.svelte';
	import { SiGithub } from 'svelte-icons-pack/si';
	import { SiConvertio } from './icons';
	import { AiOutlineMenu } from 'svelte-icons-pack/ai';
	import { RiDocumentFileExcel2Line } from 'svelte-icons-pack/ri';

	export let page: 'home' | 'convert' | 'excel_tool';

	const app_menu_popup: PopupSettings = {
		event: 'click',
		target: 'app_bar_menu',
		placement: 'left-end',
		closeQuery: '.will-close'
	};
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<slot name="start" />
		{#if page !== 'home'}
			<a class="mr-2 text-xl" href="/" title="श्रीरामायणम्">
				<Icon
					src={BiArrowBack}
					class="-mt-1 mr-1 text-2xl hover:fill-blue-600 dark:hover:fill-sky-500"
				/>
			</a>
		{/if}
		<slot name="headline"><span></span></slot>
	</svelte:fragment>
	<!-- <svelte:fragment slot="headline">
		<slot name="headline"><span></span></slot>
	</svelte:fragment> -->
	<svelte:fragment slot="trail">
		<slot name="end"></slot>
		<div class="space-x-2">
			{#if page !== 'convert'}
				<a class="text-xl" href="/convert" title="Lipi Parivartak">
					<Icon
						src={SiConvertio}
						class="text-2xl hover:fill-emerald-600 dark:hover:fill-zinc-400"
					/>
				</a>
			{/if}
		</div>
		<button class="btn m-0 p-0" use:popup={app_menu_popup} title="App Menu">
			<Icon
				src={AiOutlineMenu}
				class="text-3xl hover:text-gray-500 active:text-blue-600 dark:hover:text-gray-400 dark:active:text-blue-400"
			/>
		</button>
		<div class="card z-50 rounded-lg px-3 py-2 shadow-xl" data-popup="app_bar_menu">
			<div class="space-y-2">
				<a
					href="/convert"
					class="will-close text-md flex space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<Icon
						src={SiConvertio}
						class="text-2xl hover:fill-emerald-600 dark:hover:fill-zinc-400"
					/>
					<span>Lipi Parivartak</span>
				</a>
				<a
					href="/excel_tool"
					class="will-close text-md flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<Icon
						src={RiDocumentFileExcel2Line}
						class="-mt-1 text-xl text-green-600 dark:text-green-400"
					/>
					<span>Excel File Transliterator</span>
				</a>
				<a
					href="https://github.com/shubhattin/valmiki_ramayanam"
					target="_blank"
					rel="noopener noreferrer"
					class="will-close text-md flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<Icon
						src={SiGithub}
						class="-mt-1 mr-1 text-2xl hover:fill-indigo-700 dark:hover:fill-zinc-400"
					/>
					<span>Project's Github Page</span>
				</a>
				<div class="wont-close text-md flex space-x-3 rounded-md px-2 py-1">
					<span class="mt-1">Set Theme</span>
					<ThemeChanger />
				</div>
			</div>
		</div>
	</svelte:fragment>
</AppBar>
