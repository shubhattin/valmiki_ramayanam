<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource/roboto/latin.css';
	import '../app.pcss';
	import { initializeStores, Modal, storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<svelte:head>
	<title>Lipi Parivartak</title>
</svelte:head>
<ModeWatcher />
<Modal />
<div class="contaiiner mx-auto mb-1 max-w-screen-lg">
	<slot />
</div>
