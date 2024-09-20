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
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import { IoOptions } from 'svelte-icons-pack/io';
  import {
    current_shloka_type,
    shloka_configs,
    SPACE_ABOVE_REFERENCE_LINE,
    SPACE_BETWEEN_MAIN_AND_NORM,
    DEFAULT_SHLOKA_CONFIG
  } from './settings';
  import { copy_plain_object } from '@tools/kry';

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
<Accordion>
  <AccordionItem open={false}>
    <svelte:fragment slot="lead"><Icon src={IoOptions} class="text-2xl" /></svelte:fragment>
    <svelte:fragment slot="summary"
      ><span class="text-sm font-bold">Change Default Options</span>
    </svelte:fragment>
    <div slot="content" class="space-y-2">
      <div class="flex items-center justify-center space-x-4 text-sm">
        <span>
          Current Shloka Type : {$current_shloka_type}
        </span>
        <button
          on:click={() =>
            ($shloka_configs[$current_shloka_type] = copy_plain_object(
              DEFAULT_SHLOKA_CONFIG[$current_shloka_type]
            ))}
          class="btn rounded-md bg-primary-700 px-1.5 py-1 text-sm font-bold text-white dark:bg-primary-500"
          >Reset</button
        >
      </div>
      <div class="flex justify-center space-x-3">
        <label class="inline-block">
          <span class="text-sm">Main Text</span>
          <input
            type="number"
            class="input w-16 rounded-md px-1 py-0 text-sm"
            bind:value={$shloka_configs[$current_shloka_type].main_text_font_size}
            min={10}
          />
        </label>
        <label class="inline-block">
          <span class="text-sm">Normal Text</span>
          <input
            type="number"
            class="input w-16 rounded-md px-1 py-0 text-sm"
            bind:value={$shloka_configs[$current_shloka_type].norm_text_font_size}
            min={10}
          />
        </label>
        <label class="inline-block">
          <span class="text-sm">Translation Text</span>
          <input
            type="number"
            class="input w-16 rounded-md px-1 py-0 text-sm"
            bind:value={$shloka_configs[$current_shloka_type].trans_text_font_size}
            min={10}
          />
        </label>
      </div>

      <div class="flex justify-center space-x-16">
        <div class="flex flex-col justify-center space-y-1">
          <label>
            <span class="text-sm">Space Above Reference Line</span>
            <input
              type="number"
              class="input w-12 rounded-md px-1 py-0 text-sm"
              bind:value={$SPACE_ABOVE_REFERENCE_LINE}
              min={0}
              max={40}
            />
          </label>
          <label>
            <span class="text-sm">Space Between Main and Normal</span>
            <input
              type="number"
              class="input w-12 rounded-md px-1 py-0 text-sm"
              bind:value={$SPACE_BETWEEN_MAIN_AND_NORM}
              min={0}
              max={20}
            />
          </label>
        </div>
        <div class="flex flex-col items-center justify-center space-y-2">
          <div class="text-sm font-semibold">Boundaries</div>
          <input
            type="number"
            class="input block w-14 rounded-sm px-1 py-0 text-sm"
            bind:value={$shloka_configs[$current_shloka_type].bounding_coords.top}
            min={0}
            max={1080}
          />
          <div class="space-x-6">
            <input
              type="number"
              class="input w-16 rounded-sm px-1 py-0 text-sm"
              bind:value={$shloka_configs[$current_shloka_type].bounding_coords.left}
              min={0}
              max={1920}
            />
            <input
              type="number"
              class="input w-16 rounded-sm px-1 py-0 text-sm"
              bind:value={$shloka_configs[$current_shloka_type].bounding_coords.right}
              min={0}
              max={1920}
            />
          </div>
          <input
            type="number"
            class="input w-16 rounded-sm px-1 py-0 text-sm"
            bind:value={$shloka_configs[$current_shloka_type].bounding_coords.bottom}
            min={0}
            max={1080}
          />
        </div>
        <div class="flex flex-col items-center justify-center space-y-1">
          <div class="font-semibold">Reference Lines</div>
          <label class="inline-block space-x-1">
            <span class="text-sm">Top Start</span>
            <input
              type="number"
              class="input w-16 rounded-md px-1 py-0 text-sm"
              bind:value={$shloka_configs[$current_shloka_type].reference_lines.top}
              min={10}
            />
          </label>
          <label class="inline-block space-x-1">
            <span class="text-sm">Spacing</span>
            <input
              type="number"
              class="input w-16 rounded-md px-1 py-0 text-sm"
              bind:value={$shloka_configs[$current_shloka_type].reference_lines.spacing}
              min={10}
            />
          </label>
        </div>
      </div>
    </div>
  </AccordionItem>
</Accordion>
