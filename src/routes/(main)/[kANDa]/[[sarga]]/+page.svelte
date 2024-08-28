<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { z } from 'zod';
  import { kANDa_selected, sarga_selected } from '@state/ramayanam_page';

  onMount(() => {
    const params_schema = z.object({
      kANDa: z.coerce.number().int(),
      sarga: z.coerce.number().int().optional()
    });
    const params = params_schema.parse($page.params);
    $kANDa_selected = params.kANDa;
    if (params.sarga) $sarga_selected = params.sarga;
  });
</script>
