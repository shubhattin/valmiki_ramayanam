<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource/roboto/latin.css';
	import '../app.pcss';
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';

	initializeStores();
</script>

<ModeWatcher />
<Modal />
<div class="contaiiner mx-auto mb-1 max-w-screen-lg">
	<slot />
</div>
