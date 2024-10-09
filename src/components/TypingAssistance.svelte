<script lang="ts">
  import { createQuery, useIsFetching } from '@tanstack/svelte-query';
  import { load_parivartak_lang_data } from '~/tools/converter';
  import { delay } from '~/tools/delay';
  import { ALL_LANG_SCRIPT_LIST } from '~/tools/lang_list';
  import Modal from '~/components/Modal.svelte';
  import type { Writable } from 'svelte/store';
  import { cl_join } from '~/tools/cl_join';
  import { onDestroy } from 'svelte';

  export let sync_lang_script: Writable<string>;
  export let modal_opended: Writable<boolean>;
  $: typing_assistance_lang = $sync_lang_script;

  const IMAGE_SCALING = 0.85;
  const ONE_PX = 1;
  const HEIGHT = 682 * IMAGE_SCALING;
  const WIDTH = 658 * IMAGE_SCALING;

  $: usage_table = createQuery({
    queryKey: ['usage_table', typing_assistance_lang],
    enabled: $modal_opended,
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
      return { url, height, width };
    }
  });
  onDestroy(() => {
    $modal_opended = false;
  });
</script>

<div>
  <Modal modal_open={modal_opended} outterClass="mt-0">
    <select class="select w-40" bind:value={typing_assistance_lang}>
      {#each ALL_LANG_SCRIPT_LIST as lang_script}
        <option value={lang_script}>{lang_script}</option>
      {/each}
    </select>
    <div
      class={cl_join(
        'mt-4 max-w-full',
        !$usage_table.isFetching ? 'min-h-[580px] min-w-[560px]' : 'h-[580px] w-[560px]'
      )}
      style="
    min-height: {!$usage_table.isFetching ? `${HEIGHT}px` : 'auto'};
    min-width: {!$usage_table.isFetching ? `${WIDTH}px` : 'auto'};
    height: {$usage_table.isFetching ? `${HEIGHT}px` : 'auto'};
    width: {$usage_table.isFetching ? `${WIDTH}px` : 'auto'};
    "
    >
      {#if $usage_table.isFetching}
        <div class="h-full w-full space-y-2">
          <div class="placeholder animate-pulse rounded-md"></div>
          <!-- <div class="placeholder animate-pulse"></div> -->
          <div class="placeholder h-full w-full animate-pulse rounded-lg"></div>
        </div>
      {:else if $usage_table.isSuccess}
        {@const { url, height, width } = $usage_table.data}
        <img
          style:height={`${height}px`}
          style:width={`${width}px`}
          alt={typing_assistance_lang}
          src={url}
        />
      {/if}
    </div>
  </Modal>
</div>
