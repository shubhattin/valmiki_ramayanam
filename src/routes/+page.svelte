<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { slide } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  import { delay } from '@tools/delay';
  import { writable } from 'svelte/store';
  import { LANG_LIST, SCRIPT_LIST } from '@tools/lang_list';
  import { load_parivartak_lang_data, lipi_parivartak } from '@tools/converter';
  import { LanguageIcon } from '@components/icons';
  import MetaTags from '@components/MetaTags.svelte';
  import User from './User.svelte';
  import {
    ensure_auth_access_status,
    get_id_token_info,
    ID_TOKEN_INFO_SCHEMA
  } from '@tools/auth_tools';
  import { browser } from '$app/environment';
  import { main_app_bar_info } from '@state/state';
  import Display from './Display.svelte';
  import { z } from 'zod';
  import { client } from '@api/client';
  import { get_possibily_not_undefined } from '@tools/kry';

  const BASE_SCRIPT = 'Sanskrit';

  let kANDa_selected = writable(0);
  let sarga_selected = writable(0);
  let sarga_loading = false;
  let viewing_script = BASE_SCRIPT;
  let loaded_viewing_script: string = viewing_script;
  let trans_lang = writable('--');

  let sarga_data: string[] = [];
  let trans_en_data: Map<number, string> = new Map();
  let loaded_en_trans_data = false;
  let view_translation_status = false;

  let loaded_lang_trans_data = false;
  let user_allowed_langs: string[] = [];
  let trans_lang_data: Map<number, string> = new Map();

  let editing_status_on = false;
  let loaded_user_info = false; // info related to assigned editable langs

  let user_info: z.infer<typeof ID_TOKEN_INFO_SCHEMA> | null = null;
  onMount(() => {
    try {
      user_info = get_id_token_info().user;
    } catch {}
    if (import.meta.env.DEV) {
      // the options set here are for development purposes
      // can be disabled or modified based on need
      $kANDa_selected = 1;
      $sarga_selected = 1;
      view_translation_status = true;
      $trans_lang = 'Hindi';
    }
    load_parivartak_lang_data(BASE_SCRIPT);
    if (browser) ensure_auth_access_status();
    if (browser && import.meta.env.PROD) {
      window.addEventListener('beforeunload', function (e) {
        if (editing_status_on) {
          e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
          e.returnValue = ''; // Chrome requires returnValue to be set
        }
      });
    }
  });

  $: (async () => {
    await load_parivartak_lang_data(viewing_script);
    loaded_viewing_script = viewing_script;
  })();
  $: view_translation_status &&
    browser &&
    (async () => {
      loaded_en_trans_data = false;
      const en_trans_data = await load_english_translation($kANDa_selected, $sarga_selected);
      trans_en_data = en_trans_data;
      loaded_en_trans_data = true;
    })();
  $: view_translation_status &&
    browser &&
    user_info &&
    (async () => {
      loaded_user_info = false;
      if (user_info.user_type === 'admin') {
        loaded_user_info = true;
        return;
      }
      // fetching user info if allowed to edit languages
      const data = (await client.user_info.get_user_allowed_langs.query()).allowed_langs;
      if (!data) user_allowed_langs = [];
      else user_allowed_langs = data;
      loaded_user_info = true;
    })();
  const trans_lang_unsub = trans_lang.subscribe(async () => {
    if (!browser || $trans_lang === '--') return;
    loaded_lang_trans_data = false;
    const data = await client.translations.get_translations_per_sarga.query({
      lang: $trans_lang,
      kANDa_num: $kANDa_selected,
      sarga_num: $sarga_selected
    });
    const data_map = new Map<number, string>();
    for (let val of data) {
      // we dont need to manually care abouy 0 or -1, it will be handled while making changes
      data_map.set(val.shloka_num, val.text);
    }
    trans_lang_data = data_map;
    loaded_lang_trans_data = true;
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
    trans_lang_unsub();
  });

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
      <select
        class="select inline-block w-40"
        disabled={editing_status_on}
        bind:value={viewing_script}
      >
        {#each SCRIPT_LIST as lang (lang)}
          <option value={lang}>{lang === 'Sanskrit' ? 'Devanagari' : lang}</option>
        {/each}
      </select>
    </label>
    <User editing_status={editing_status_on} />
  </div>
  <label class="space-x-4">
    <span class="font-bold">Select kANDa</span>
    <select bind:value={$kANDa_selected} class="select w-52" disabled={editing_status_on}>
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
      <select bind:value={$sarga_selected} class="select w-52" disabled={editing_status_on}>
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
    {:else}
      <label class="mr-3 inline-block space-x-4">
        Translation
        <Icon src={LanguageIcon} class="text-2xl" />
        <select
          disabled={editing_status_on}
          class="select inline-block w-32 px-2 py-1"
          bind:value={$trans_lang}
        >
          <option value="--">-- Select --</option>
          {#each LANG_LIST as lang (lang)}
            <option value={lang}>{lang}</option>
          {/each}
        </select>
      </label>
      {#if !editing_status_on && $trans_lang !== '--' && loaded_user_info && (get_possibily_not_undefined(user_info).user_type === 'admin' || user_allowed_langs.indexOf($trans_lang) !== -1)}
        <button
          on:click={() => (editing_status_on = true)}
          class="btn my-1 rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white dark:bg-tertiary-600"
          >Edit</button
        >
      {/if}
    {/if}
    <Display
      {...{
        BASE_SCRIPT,
        loaded_en_trans_data,
        loaded_viewing_script,
        sarga_data,
        trans_en_data,
        editing_status_on,
        trans_lang_data,
        loaded_lang_trans_data,
        kANDa,
        sarga_loading,
        sarga_selected
      }}
    />
  {/if}
</div>
