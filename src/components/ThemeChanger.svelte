<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
</script>

<button class="btn-xl -mb-1 ml-0 mr-0 inline-flex items-center p-0" on:click={toggleMode}>
	<Sun
		size={322}
		class="h-5 w-5 rotate-0 scale-100 transition-all hover:text-amber-700 dark:-rotate-90 dark:scale-0"
	/>
	<Moon
		size={322}
		class="absolute h-5 w-5 rotate-90 scale-0 transition-all hover:text-slate-400 dark:rotate-0 dark:scale-100"
	/>
	<span class="sr-only">Toggle theme</span>
</button>
