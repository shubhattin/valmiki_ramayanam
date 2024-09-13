<script lang="ts">
  import { onMount } from 'svelte';
  import { image_kANDa, image_lang, image_sarga } from './state';
  import { sarga_selected, kANDa_selected, trans_lang } from '@state/main_page/main_state';

  onMount(() => {
    $image_kANDa = $kANDa_selected;
    $image_sarga = $sarga_selected;
    $image_lang = $trans_lang;
  });
</script>
