<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import '@fontsource/roboto/latin.css';
  import '../app.pcss';
  import TopAppBar from '@components/TopAppBar.svelte';
  import { initializeStores, Modal, storePopup } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import PartyTown from '@components/tags/PartyTown.svelte';
  import GA from '@components/tags/GA.svelte';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        staleTime: 1000 * 60 * 8 // by default data will stay fresh for 8 minutes
      }
    }
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
    <slot />
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
<PartyTown />
<GA />
