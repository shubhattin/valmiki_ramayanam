<script lang="ts">
	import { cl_join } from '@tools/cl_join';

	let className: string = '';
	export { className as class };
	export let show: boolean;
	export let remove_when_hidden = false; // this is to determine that wheter the spnner will be DOM or not
</script>

{#if !remove_when_hidden || show}
	<span
		class={cl_join(
			'-my-1.5 mx-1 box-border inline-block h-6 w-6 rounded-full border-[3.5px] border-solid border-white border-b-transparent',
			'animate-spin transition-opacity duration-100 ease-in',
			'text-white',
			show ? 'opacity-100' : 'opacity-0',
			className
		)}
	/>
{/if}
