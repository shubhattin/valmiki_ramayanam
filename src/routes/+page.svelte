<script lang="ts">
	import MainAppBar from '@components/MainAppBar.svelte';
	import App from './App.svelte';
</script>

<MainAppBar>
	<div slot="start" class="font-bold">Lipi Parivartak</div>
</MainAppBar>
<div class="mt-3">
	<App />
</div>
