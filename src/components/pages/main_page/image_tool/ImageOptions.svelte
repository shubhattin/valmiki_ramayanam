<script lang="ts">
  import { rAmAyaNam_map } from '~/state/main_page/data';
  import {
    DEFAULT_MAIN_TEXT_FONT_CONFIGS,
    DEFAULT_TRANS_TEXT_FONT_CONFIGS,
    image_kANDa,
    image_lang,
    image_rendering_state,
    image_sarga,
    image_script,
    image_shloka,
    image_trans_data,
    main_text_font_configs,
    normal_text_font_config,
    shaded_background_image_status,
    trans_text_font_configs
  } from './state';
  import { LANG_LIST, LANG_LIST_IDS, type lang_list_type } from '~/tools/lang_list';
  import Icon from '~/tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { LanguageIcon } from '~/components/icons';
  import { Tabs, Accordion, Switch } from '@skeletonlabs/skeleton-svelte';
  import ImageDownloader from './ImageDownloader.svelte';
  import { DEFAULT_SHLOKA_CONFIG_SHARED, get_image_font_info } from './settings';
  import { IoOptions } from 'svelte-icons-pack/io';
  import {
    current_shloka_type,
    shloka_configs,
    SPACE_ABOVE_REFERENCE_LINE,
    DEFAULT_SHLOKA_CONFIG
  } from './settings';
  import { copy_plain_object } from '~/tools/kry';

  let kANDa_info = $derived(rAmAyaNam_map[$image_kANDa - 1]);
  let shloka_count = $derived(kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted);

  let settings_tab: 'depend' | 'non-depend' = $state('non-depend');

  const reset_func = () => {
    $shloka_configs[$current_shloka_type] = copy_plain_object(
      DEFAULT_SHLOKA_CONFIG[$current_shloka_type]
    );
    $SPACE_ABOVE_REFERENCE_LINE = DEFAULT_SHLOKA_CONFIG_SHARED.SPACE_ABOVE_REFERENCE_LINE;
    $normal_text_font_config = copy_plain_object(get_image_font_info('Normal'));
    $main_text_font_configs = copy_plain_object(DEFAULT_MAIN_TEXT_FONT_CONFIGS);
    $trans_text_font_configs = copy_plain_object(DEFAULT_TRANS_TEXT_FONT_CONFIGS);
  };
</script>

<div class="flex space-x-2 text-sm">
  <div class="inline-block space-x-1">
    <button
      class="btn m-0 p-0"
      disabled={$image_shloka === 0 || $image_rendering_state}
      onclick={() => {
        if ($image_shloka !== -1) $image_shloka--;
        else $image_shloka = shloka_count;
      }}
    >
      <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
    </button>
    <select class="select inline-block w-14 p-1 text-sm" bind:value={$image_shloka}>
      <option value={0}>0</option>
      {#each Array(shloka_count) as _, index}
        <option value={index + 1}>{index + 1}</option>
      {/each}
      <option value={-1}>-1</option>
    </select>
    <button
      class="btn m-0 p-0"
      onclick={() => {
        if ($image_shloka !== shloka_count) $image_shloka++;
        else $image_shloka = -1;
      }}
      disabled={$image_shloka === -1 || $image_rendering_state}
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
      {#each LANG_LIST as lang, i (lang)}
        <option value={LANG_LIST_IDS[i]}>{lang}</option>
      {/each}
    </select>
  </label>
  <ImageDownloader />
  <span class="inline-flex flex-col">
    <Switch
      name="from_text_type"
      checked={$shaded_background_image_status}
      onCheckedChange={(e) => ($shaded_background_image_status = e.checked)}
    />
    <!-- class="mt-1 hover:text-gray-500 dark:hover:text-gray-400" -->
  </span>
  <span class="flex flex-col items-center justify-center">
    <button
      onclick={reset_func}
      class="btn bg-surface-700 dark:bg-surface-500 m-0 rounded-md px-1 py-1 text-xs font-bold text-white"
      >Reset</button
    >
  </span>
</div>
<Accordion value={[]}>
  <Accordion.Item value="options">
    {#snippet lead()}
      <Icon src={IoOptions} class="text-2xl" />
    {/snippet}
    {#snippet control()}
      <span class="text-sm font-bold">Change Default Options</span>
    {/snippet}
    {#snippet panel()}
      <div class="space-y-2">
        <Tabs
          value={settings_tab}
          onValueChange={(e) => (settings_tab = e.value as typeof settings_tab)}
        >
          {#snippet list()}
            <Tabs.Control value={'non-depend'}>Shloka Type Independent</Tabs.Control>
            <Tabs.Control value={'depend'}>Shloka Type Dependent</Tabs.Control>
          {/snippet}
          {#snippet content()}
            {#if settings_tab === 'non-depend'}
              <div class="flex justify-center space-x-16">
                <div class=" flex flex-col justify-center space-y-1">
                  <div class="text-center text-sm font-semibold">Spaces</div>
                  <div class="space-y-1 text-center">
                    <label>
                      <span class="text-sm">Above Reference Line</span>
                      <input
                        type="number"
                        class="input w-12 rounded-md px-1 py-0 text-sm"
                        bind:value={$SPACE_ABOVE_REFERENCE_LINE}
                        min={0}
                        max={40}
                      />
                    </label>
                    <label>
                      <span class="text-sm">Between Main and Normal</span>
                      <input
                        type="number"
                        class="input w-12 rounded-md px-1 py-0 text-sm"
                        bind:value={
                          $main_text_font_configs[$image_script].space_between_main_and_normal
                        }
                        min={0}
                        max={20}
                      />
                    </label>
                  </div>
                </div>
                <div class="flex flex-col justify-center space-y-1">
                  <div class="text-center text-sm font-semibold">Text Scaling factors</div>
                  <div class="flex justify-center space-x-3 text-center">
                    <div class="flex flex-col justify-center space-y-1">
                      <label class="space-x-1">
                        <span class="text-sm">Main</span>
                        <input
                          type="number"
                          class="input w-16 rounded-md px-1 py-0 text-sm"
                          bind:value={$main_text_font_configs[$image_script].size}
                          min={0}
                          max={10}
                          step={0.05}
                        />
                      </label>
                      <label class="space-x-1">
                        <span class="text-sm">Normal</span>
                        <input
                          type="number"
                          class="input w-16 rounded-md px-1 py-0 text-sm"
                          bind:value={$normal_text_font_config.size}
                          min={0}
                          max={10}
                          step={0.05}
                        />
                      </label>
                    </div>
                    <div class="flex flex-col justify-center space-y-1">
                      <label class="space-x-1">
                        <span class="text-sm">Translation</span>
                        <input
                          type="number"
                          class="input w-16 rounded-md px-1 py-0 text-sm"
                          bind:value={
                            $trans_text_font_configs[
                              LANG_LIST[LANG_LIST_IDS.indexOf($image_lang)] as lang_list_type
                            ].size
                          }
                          min={0}
                          max={10}
                          step={0.05}
                        />
                      </label>
                      <label class="space-x-1">
                        <span class="text-sm">Line Spacing</span>
                        <input
                          type="number"
                          class="input w-16 rounded-md px-1 py-0 text-sm"
                          bind:value={
                            $trans_text_font_configs[
                              LANG_LIST[LANG_LIST_IDS.indexOf($image_lang)] as lang_list_type
                            ].new_line_spacing
                          }
                          min={0}
                          max={10}
                          step={0.05}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            {:else if settings_tab === 'depend'}
              <div class="flex items-center justify-center space-x-4 text-sm">
                <span class="text-base font-bold">
                  Current Shloka Type : {$current_shloka_type}
                </span>
              </div>
              <div class="flex justify-center space-x-16">
                <div class="flex flex-col justify-center space-y-1">
                  <label class="space-x-1">
                    <span class="text-sm">Main Text</span>
                    <input
                      type="number"
                      class="input w-16 rounded-md px-1 py-0 text-sm"
                      bind:value={$shloka_configs[$current_shloka_type].main_text_font_size}
                      min={10}
                    />
                  </label>
                  <label class="space-x-1">
                    <span class="text-sm">Normal Text</span>
                    <input
                      type="number"
                      class="input w-16 rounded-md px-1 py-0 text-sm"
                      bind:value={$shloka_configs[$current_shloka_type].norm_text_font_size}
                      min={10}
                    />
                  </label>
                  <label class="space-x-1">
                    <span class="text-sm">Translation Text</span>
                    <input
                      type="number"
                      class="input w-16 rounded-md px-1 py-0 text-sm"
                      bind:value={$shloka_configs[$current_shloka_type].trans_text_font_size}
                      min={10}
                    />
                  </label>
                </div>
                <div class="flex flex-col items-center justify-center space-y-2">
                  <div class="text-sm font-semibold">Boundaries</div>
                  <input
                    type="number"
                    class="input block w-14 rounded-xs px-1 py-0 text-sm"
                    bind:value={$shloka_configs[$current_shloka_type].bounding_coords.top}
                    min={0}
                    max={1080}
                  />
                  <div class="space-x-6">
                    <input
                      type="number"
                      class="input w-16 rounded-xs px-1 py-0 text-sm"
                      bind:value={$shloka_configs[$current_shloka_type].bounding_coords.left}
                      min={0}
                      max={1920}
                    />
                    <input
                      type="number"
                      class="input w-16 rounded-xs px-1 py-0 text-sm"
                      bind:value={$shloka_configs[$current_shloka_type].bounding_coords.right}
                      min={0}
                      max={1920}
                    />
                  </div>
                  <input
                    type="number"
                    class="input w-16 rounded-xs px-1 py-0 text-sm"
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
            {/if}
          {/snippet}
        </Tabs>
      </div>
    {/snippet}
  </Accordion.Item>
</Accordion>
