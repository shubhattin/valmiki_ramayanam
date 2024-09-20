<script lang="ts">
  import { rAmAyaNam_map } from '@state/main_page/data';
  import {
    image_kANDa,
    image_lang,
    image_sarga,
    image_shloka,
    image_trans_data,
    shaded_background_image_status
  } from './state';
  import { viewing_script } from '@state/main_page/main_state';
  import { LANG_LIST } from '@tools/lang_list';
  import { get_text_font } from '@tools/font_tools';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { LanguageIcon } from '@components/icons';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import ImageDownloader from './ImageDownloader.svelte';
  import type { shloka_type_config } from './settings';

  export let render_all_texts: (shloka_num: number, script: string) => Promise<shloka_type_config>;

  $: kANDa_info = rAmAyaNam_map[$image_kANDa - 1];
  $: shloka_count = kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted;
</script>

<div class="flex space-x-2 text-sm">
  <div class="inline-block space-x-1">
    <button
      class="btn m-0 p-0"
      disabled={$image_shloka === 0}
      on:click={() => {
        if ($image_shloka !== -1) $image_shloka -= 1;
        else $image_shloka = shloka_count;
      }}
    >
      <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
    </button>
    <select
      class={`${get_text_font($viewing_script)} select inline-block w-14 p-1 text-sm`}
      bind:value={$image_shloka}
    >
      <option value={0}>0</option>
      {#each Array(shloka_count) as _, index}
        <option value={index + 1}>{index + 1}</option>
      {/each}
      <option value={-1}>-1</option>
    </select>
    <button
      class="btn m-0 p-0"
      on:click={() => {
        if ($image_shloka !== shloka_count) $image_shloka += 1;
        else $image_shloka = -1;
      }}
      disabled={$image_shloka === -1}
    >
      <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
    </button>
  </div>
  <label class="inline-block space-x-1">
    <Icon src={LanguageIcon} class="text-xl" />
    <select
      class="select inline-block w-24 p-1 text-sm"
      bind:value={$image_lang}
      disabled={$image_trans_data.isFetching || !$image_trans_data.isSuccess}
    >
      <option value="English">English</option>
      {#each LANG_LIST as lang (lang)}
        <option value={lang}>{lang}</option>
      {/each}
    </select>
  </label>
  <ImageDownloader {render_all_texts} />
  <span class="inline-flex flex-col">
    <SlideToggle
      name="from_text_type"
      active="bg-primary-500"
      class="mt-1 hover:text-gray-500 dark:hover:text-gray-400"
      bind:checked={$shaded_background_image_status}
      size="sm"
    />
  </span>
</div>
