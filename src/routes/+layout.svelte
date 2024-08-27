<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import '@fontsource/roboto/latin.css';
  import '../app.pcss';
  import MainAppBar from '@components/MainAppBar.svelte';
  import { initializeStores, Modal, storePopup } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import PartyTown from '@components/tags/PartyTown.svelte';
  import GA from '@components/tags/GA.svelte';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<svelte:head>
  <meta property="og:type" content="app" />
</svelte:head>

<ModeWatcher />
<Modal />
<div class="contaiiner mx-auto mb-1 max-w-screen-lg">
  <MainAppBar />
  <slot />
</div>
<PartyTown />
<GA />
