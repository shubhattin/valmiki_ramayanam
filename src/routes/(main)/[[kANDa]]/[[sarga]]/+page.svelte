<script lang="ts">
  import { page } from '$app/stores';
  import { z } from 'zod';
  import MainPage from '@components/pages/main_page/MainPage.svelte';
  import { kANDa_selected, sarga_selected } from '@state/main_page/main_state';
  import { main_app_bar_info } from '@state/app_bar';

  const params_schema = z.object({
    kANDa: z.coerce.number().int().optional().default(0),
    sarga: z.coerce.number().int().optional().default(0)
  });

  const params = params_schema.parse($page.params);
  $kANDa_selected = params.kANDa;
  $sarga_selected = params.sarga;

  main_app_bar_info.set({
    className: 'text-2xl font-bold',
    title: 'श्रीमद्रामायणम्'
  });
</script>

<MainPage />
