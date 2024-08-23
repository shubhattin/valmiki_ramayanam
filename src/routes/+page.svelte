<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { fade, scale, slide } from 'svelte/transition';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';
  import { onDestroy, onMount } from 'svelte';
  import { delay } from '@tools/delay';
  import { writable } from 'svelte/store';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { SCRIPT_LIST } from '@tools/lang_list';
  import { load_parivartak_lang_data, lipi_parivartak } from '@tools/converter';
  import { LanguageIcon } from '@components/icons';
  import MetaTags from '@components/MetaTags.svelte';
  import User from './User.svelte';
  import { ensure_auth_access_status } from '@tools/auth_tools';
  import { browser } from '$app/environment';
  import { main_app_bar_info } from '@state/state';

  const BASE_SCRIPT = 'Sanskrit';

  let kANDa_selected = writable(0);
  let sarga_selected = writable(0);
  let sarga_loading = false;
  let enable_copy_to_clipbaord = true;
  let copied_shloka_number: number | null = null;
  let viewing_script = BASE_SCRIPT;
  let loaded_viewing_script: string = viewing_script;

  let sarga_data: string[] = [];
  let trans_en_data: Map<number, string> = new Map();
  let loaded_en_trans_data = false;
  let view_translation_status = false;

  $: (async () => {
    await load_parivartak_lang_data(viewing_script);
    loaded_viewing_script = viewing_script;
  })();
  $: view_translation_status &&
    (async () => {
      loaded_en_trans_data = false;
      const en_trans_data = await load_english_translation($kANDa_selected, $sarga_selected);
      trans_en_data = en_trans_data;
      loaded_en_trans_data = true;
    })();
  $: copied_shloka_number !== null && setTimeout(() => (copied_shloka_number = null), 1400);

  onMount(async () => {
    if (import.meta.env.DEV) {
      $kANDa_selected = 1;
      $sarga_selected = 1;
      view_translation_status = true;
    }
    await load_parivartak_lang_data(BASE_SCRIPT);
    if (browser) await ensure_auth_access_status();
  });

  const sarga_unsub = sarga_selected.subscribe(async () => {
    if ($kANDa_selected === 0 || $sarga_selected === 0) return;
    sarga_loading = true;
    sarga_data = [];
    const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
    const data = (
      (await all_sargas[`/data/ramayan/data/${$kANDa_selected}/${$sarga_selected}.json`]()) as any
    ).default as string[];
    await delay(400);
    sarga_loading = false;
    sarga_data = data;
  });
  const kANDa_selected_unsub = kANDa_selected.subscribe(() => {
    $sarga_selected = 0;
    loaded_en_trans_data = false;
  });

  const load_english_translation = async (kANDa_num: number, sarga_number: number) => {
    let data: Record<number, string> = {};
    const data_map = new Map<number, string>();
    if (import.meta.env.DEV) {
      const yaml = (await import('js-yaml')).default;
      const glob_yaml = import.meta.glob('/data/ramayan/trans_en/*/*.yaml', {
        query: '?raw'
      });
      if (!(`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml` in glob_yaml))
        return data_map;
      const text = (
        (await glob_yaml[`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml`]()) as any
      ).default as string;
      data = yaml.load(text) as Record<number, string>;
    }

    for (const [key, value] of Object.entries(data)) {
      data_map.set(Number(key), value.replaceAll(/\n$/g, '')); // replace the ending newline
    }
    return data_map;
  };

  onDestroy(() => {
    kANDa_selected_unsub();
    sarga_unsub();
  });

  const copy_text_to_clipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const PAGE_INFO = {
    title: 'श्रीमद्रामायणम्',
    description: 'श्रीमद्रामायणस्य पठनम्'
  };

  main_app_bar_info.set({
    className: 'text-2xl font-bold',
    title: PAGE_INFO.title
  });
</script>

<MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} />

<div class="mt-4 space-y-4">
  <div class="flex justify-between">
    <label class="space-x-4">
      <Icon src={LanguageIcon} class="text-4xl" />
      <select class="select inline-block w-40" bind:value={viewing_script}>
        {#each SCRIPT_LIST as lang (lang)}
          <option value={lang}>{lang === 'Sanskrit' ? 'Devanagari' : lang}</option>
        {/each}
      </select>
    </label>
    <User />
  </div>
  <label class="space-x-4">
    <span class="font-bold">Select kANDa</span>
    <select bind:value={$kANDa_selected} class="select w-52">
      <option value={0}>Select</option>
      {#each rAmAyaNa_map as kANDa}
        {@const kANDa_name = lipi_parivartak(
          kANDa.name_devanagari,
          BASE_SCRIPT,
          loaded_viewing_script
        )}
        <option value={kANDa.index}>{kANDa.index}. {kANDa_name}</option>
      {/each}
    </select>
  </label>
  {#if $kANDa_selected !== 0}
    {@const kANDa = rAmAyaNa_map[$kANDa_selected - 1]}
    <label class="space-x-4">
      <span class="font-bold">Select Sarga</span>
      <select bind:value={$sarga_selected} class="select w-52">
        <option value={0}>Select</option>
        {#each kANDa.sarga_data as sarga}
          {@const sarga_name = lipi_parivartak(
            sarga.name_devanagari.split('\n')[0],
            BASE_SCRIPT,
            loaded_viewing_script
          )}
          <option value={sarga.index}>{sarga.index}. {sarga_name}</option>
        {/each}
      </select>
    </label>
  {/if}
  {#if $kANDa_selected !== 0 && $sarga_selected !== 0}
    {@const kANDa = rAmAyaNa_map[$kANDa_selected - 1]}
    {#if !view_translation_status}
      <button
        out:slide
        on:click={() => {
          view_translation_status = true;
        }}
        class="btn bg-primary-800 px-2 py-1 font-bold text-white dark:bg-primary-700"
        >View Translations</button
      >
    {/if}
    <div class="space-x-3">
      {#if $sarga_selected !== 1}
        <button
          on:click={() => ($sarga_selected -= 1)}
          in:scale
          out:slide
          class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
        >
          <Icon class="-mt-1 mr-1 text-xl" src={TiArrowBackOutline} />
          Previous
        </button>
      {/if}
      {#if $sarga_selected !== kANDa.sarga_data.length}
        <button
          on:click={() => ($sarga_selected += 1)}
          in:scale
          out:slide
          class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
        >
          Next
          <Icon class="-mt-1 ml-1 text-xl" src={TiArrowForwardOutline} />
        </button>
      {/if}
    </div>
    <div class="flex space-x-4">
      <SlideToggle
        name="Copy to Clipboard"
        bind:checked={enable_copy_to_clipbaord}
        active="bg-primary-500"
        size="sm"
      >
        Doudle Click on Shloka to Copy
      </SlideToggle>
      {#if copied_shloka_number !== null}
        <span class="cursor-default select-none font-bold text-green-700 dark:text-green-300">
          <Icon src={BsClipboard2Check} />
          Copied Shloka {copied_shloka_number} to Clipboard
        </span>
      {/if}
    </div>
    <div
      class="h-[65vh] overflow-scroll rounded-xl border-2 border-gray-400 p-0 dark:border-gray-600"
    >
      {#if !sarga_loading}
        <div transition:fade={{ duration: 250 }}>
          {#each sarga_data as shloka_lines, i}
            {@const line_transliterated = lipi_parivartak(
              shloka_lines,
              BASE_SCRIPT,
              loaded_viewing_script
            )}
            {@const line_split = line_transliterated.split('\n')}

            <div class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
              {#if i !== 0 && i !== sarga_data.length - 1}
                <span class="inline-block rounded-full text-center align-top text-xs text-gray-300"
                  >{i}</span
                >
              {/if}
              <div class="ml-1 inline-block">
                <div>
                  {#each line_split as line_shlk}
                    <div>{line_shlk}</div>
                  {/each}
                </div>
                {#if loaded_en_trans_data}
                  <div class="text-stone-500 dark:text-slate-300">
                    {#if trans_en_data.has(i)}
                      <!-- Usually translations are single but still... -->
                      {#each trans_en_data.get(i).split('\n') as line_trans}
                        <div>{line_trans}</div>
                      {/each}
                    {:else if i === sarga_data.length - 1 && trans_en_data.has(-1)}
                      <div>{trans_en_data.get(-1)}</div>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
