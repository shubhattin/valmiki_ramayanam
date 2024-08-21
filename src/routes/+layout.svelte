<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import '@fontsource/roboto/latin.css';
  import '../app.pcss';
  import { initializeStores, Modal, storePopup } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { onMount } from 'svelte';
  import { ensure_auth_access_status } from '@tools/auth_tools';
  import { browser } from '$app/environment';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  onMount(async () => {
    if (browser) await ensure_auth_access_status();
  });
</script>

<svelte:head>
  <meta property="og:type" content="app" />
</svelte:head>

<ModeWatcher />
<Modal />
<div class="contaiiner mx-auto mb-1 max-w-screen-lg">
  <slot />
</div>
