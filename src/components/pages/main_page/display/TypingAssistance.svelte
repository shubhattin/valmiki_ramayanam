<script lang="ts">
  import { typing_assistance_modal_opened, trans_lang } from '@state/main_page/main_state';
  import Icon from '@tools/Icon.svelte';
  import { ALL_LANG_SCRIPT_LIST } from '@tools/lang_list';
  import { CgClose } from 'svelte-icons-pack/cg';
  import { fade, scale } from 'svelte/transition';

  $: typing_assistance_lang = $trans_lang;

  // const URLS = import.meta.glob('/src/tools/converter/resources/images/*.png', {
  //   eager: true,
  //   query: '?url'
  // });
</script>

<div
  in:fade
  out:scale
  class="h-11/12 fixed left-2 top-2 z-10 block max-h-[94%] min-h-[87%] w-11/12 overflow-scroll rounded-lg border-2 border-blue-700 bg-[aliceblue] pl-2 pt-2 dark:border-blue-500 dark:bg-slate-800"
>
  <div class="flex justify-between">
    <select class="select w-40" bind:value={typing_assistance_lang}>
      {#each ALL_LANG_SCRIPT_LIST as lang_script}
        <option value={lang_script}>{lang_script}</option>
      {/each}
    </select>
    <button
      on:click={() => {
        $typing_assistance_modal_opened = false;
      }}
    >
      <Icon
        src={CgClose}
        class="cursor-button text-4xl text-red-500 active:text-black dark:text-red-400 dark:active:text-white"
      />
    </button>
  </div>
  <div class="mt-4 space-y-4">
    <!-- <img
        class="h-3/4 max-h-[70-vh]"
        alt={typing_assistance_lang}
        src={URLS[`/src/tools/converter/resources/images/${typing_assistance_lang}.png`].default}
      /> -->
  </div>
</div>
