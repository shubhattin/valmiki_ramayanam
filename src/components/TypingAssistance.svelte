<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { load_parivartak_lang_data } from '@tools/converter';
  import { delay } from '@tools/delay';
  import { ALL_LANG_SCRIPT_LIST } from '@tools/lang_list';
  import Modal from '@components/Modal.svelte';
  import type { Writable } from 'svelte/store';

  export let sync_lang_script: Writable<string>;
  export let modal_opended: Writable<boolean>;
  $: typing_assistance_lang = $sync_lang_script;

  $: usage_table = createQuery({
    queryKey: ['usage_table', typing_assistance_lang],
    queryFn: async () => {
      await delay(700);
      await load_parivartak_lang_data(typing_assistance_lang);
      const IMAGE_URLS = import.meta.glob('/src/tools/converter/resources/images/*.png', {
        eager: true,
        query: '?url'
      });
      const url = (
        IMAGE_URLS[`/src/tools/converter/resources/images/${typing_assistance_lang}.png`] as any
      ).default as string;
      const get_image_dimensiona = async (url: string) => {
        return new Promise<{ width: number; height: number }>((resolve, reject) => {
          let img = new Image();
          img.onload = function () {
            const ONE_PX = 1;
            const IMAGE_SCALING = 0.85;
            resolve({
              // @ts-ignore
              width: this.width * ONE_PX * IMAGE_SCALING,
              // @ts-ignore
              height: this.height * ONE_PX * IMAGE_SCALING
            });
          };
          img.src = url;
        });
      };
      const { height, width } = await get_image_dimensiona(url);
      console.log({ url, height, width });
      return { url, height, width };
    }
  });
</script>

<Modal class="max-h-[96%] max-w-[90%]" modal_open={modal_opended}>
  <select class="select w-40" bind:value={typing_assistance_lang}>
    {#each ALL_LANG_SCRIPT_LIST as lang_script}
      <option value={lang_script}>{lang_script}</option>
    {/each}
  </select>
  <div class="mt-4 h-[580px] w-[506px]">
    {#if $usage_table.isFetching}
      <div class="h-full w-full space-y-1">
        <div class="placeholder animate-pulse"></div>
        <!-- <div class="placeholder animate-pulse"></div> -->
        <div class="placeholder h-full w-full animate-pulse rounded-lg"></div>
      </div>
    {:else if $usage_table.isSuccess}
      {@const { url, height, width } = $usage_table.data}
      <img
        class="max-h-[70-vh]"
        height={`${height}px`}
        width={`${width}px`}
        alt={typing_assistance_lang}
        src={url}
      />
    {/if}
  </div>
</Modal>
