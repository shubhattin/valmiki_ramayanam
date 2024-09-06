<script lang="ts">
  import { page } from '$app/stores';
  import { z } from 'zod';
  import MainPage from '@components/pages/main_page/MainPage.svelte';
  import MetaTags from '@components/tags/MetaTags.svelte';
  import { main_app_bar_info } from '@state/app_bar';
  import { kANDa_selected, sarga_selected } from '@state/main_page/main_page_state';

  const PAGE_INFO = {
    title: 'श्रीमद्रामायणम्',
    description: 'श्रीमद्रामायणस्य पठनम्'
  };

  main_app_bar_info.set({
    className: 'text-2xl font-bold',
    title: PAGE_INFO.title
  });

  const params_schema = z.object({
    kANDa: z.coerce.number().int().optional().default(0),
    sarga: z.coerce.number().int().optional().default(0)
  });

  const params = params_schema.parse($page.params);
  $kANDa_selected = params.kANDa;
  $sarga_selected = params.sarga;
</script>

<MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} />

<MainPage />
