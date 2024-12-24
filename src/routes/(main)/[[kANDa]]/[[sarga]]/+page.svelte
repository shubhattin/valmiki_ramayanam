<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { z } from 'zod';
  import MainPage from '~/components/pages/main_page/MainPage.svelte';
  import { kANDa_selected, sarga_selected } from '~/state/main_page/main_state';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const params_schema = z.object({
    kANDa: z.coerce.number().int().optional().default(0),
    sarga: z.coerce.number().int().optional().default(0)
  });

  const params = $derived(params_schema.parse(page.params));
  function set_kanda_sarga() {
    $kANDa_selected = params.kANDa;
    $sarga_selected = params.sarga;
  }
  set_kanda_sarga();
  $effect(() => {
    if (browser) set_kanda_sarga();
  });
</script>

<MainPage />
