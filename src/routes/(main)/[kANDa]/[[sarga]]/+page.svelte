<script lang="ts">
  import { page } from '$app/stores';
  import { z } from 'zod';
  import { kANDa_selected, sarga_selected, still_setting_kanda_sarga } from '@state/ramayanam_page';

  const params_schema = z.object({
    kANDa: z.coerce.number().int(),
    sarga: z.coerce.number().int().optional()
  });

  // $still_setting_kanda_sarga = true;
  // const params = params_schema.parse($page.params);

  // $kANDa_selected = params.kANDa;
  // if (params.sarga) $sarga_selected = params.sarga;
  // $still_setting_kanda_sarga = false;
</script>
