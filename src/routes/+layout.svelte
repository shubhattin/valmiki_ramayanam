<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import '@fontsource/roboto/latin.css';
  import '../app.scss';
  import TopAppBar from '~/components/TopAppBar.svelte';
  import { initializeStores, Modal, storePopup } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import PartyTown from '~/components/tags/PartyTown.svelte';
  import GA from '~/components/tags/GA.svelte';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
  import { queryClient } from '~/state/query';
  import { pwa_event_triggerer, pwa_install_event_fired } from '~/state/main';
  import { onMount } from 'svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  onMount(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      $pwa_event_triggerer = event;
      $pwa_install_event_fired = true;
    });
  });
</script>

<svelte:head>
  <meta property="og:type" content="app" />
</svelte:head>

<QueryClientProvider client={queryClient}>
  <ModeWatcher />
  <Modal />
  <div class="contaiiner mx-auto mb-1 max-w-screen-lg">
    <TopAppBar />
    <div class="mx-2">
      {@render children?.()}
    </div>
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
<PartyTown />
<GA />
