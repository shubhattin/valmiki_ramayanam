<script lang="ts">
	import { AppBar, popup } from '@skeletonlabs/skeleton';
	import ThemeChanger from './ThemeChanger.svelte';
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<slot name="start" />
	</svelte:fragment>
	<!-- <svelte:fragment slot="headline">
		<slot name="headline"><span></span></slot>
	</svelte:fragment> -->
	<svelte:fragment slot="trail">
		<slot name="end"></slot>
		<ThemeChanger />
	</svelte:fragment>
</AppBar>
