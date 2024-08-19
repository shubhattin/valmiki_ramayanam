<script lang="ts">
	import { setMode } from 'mode-watcher';
	import { LuSun, LuMoon } from 'svelte-icons-pack/lu';
	import Icon from '@tools/Icon.svelte';
	import { VscSettingsGear } from 'svelte-icons-pack/vsc';
</script>

<button
	class="btn-xl -mb-1 ml-0 mr-0 inline-flex items-center p-0"
	on:click={() => setMode('system')}
>
	<Icon
		src={VscSettingsGear}
		class="h-5 w-5 rotate-0 scale-100 hover:text-blue-500 dark:hover:text-sky-500"
	/>
</button>
<button
	class="btn-xl -mb-1 ml-0 mr-0 inline-flex items-center p-0"
	on:click={() => setMode('light')}
>
	<Icon src={LuSun} class="h-5 w-5 rotate-0 scale-100 dark:hover:text-yellow-300" />
</button>
<button
	class="btn-xl -mb-1 ml-0 mr-0 inline-flex items-center p-0"
	on:click={() => setMode('dark')}
>
	<Icon
		src={LuMoon}
		class="h-5 w-5 rotate-0 scale-100 hover:text-purple-600 dark:hover:text-white"
	/>
</button>
