<script>
  import MainPage from './MainPage.svelte';
  import MetaTags from '@components/tags/MetaTags.svelte';
  import { page } from '$app/stores';
  import { main_app_bar_info } from '@state/app_bar';

  const PAGE_INFO = {
    title: 'श्रीमद्रामायणम्',
    description: 'श्रीमद्रामायणस्य पठनम्'
  };

  main_app_bar_info.set({
    className: 'text-2xl font-bold',
    title: PAGE_INFO.title
  });
</script>

<MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} />
{#if !$page.error}
  <MainPage />
{/if}
<slot />
