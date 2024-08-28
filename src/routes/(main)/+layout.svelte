<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { onDestroy, onMount } from 'svelte';
  import { delay } from '@tools/delay';
  import { writable } from 'svelte/store';
  import { LANG_LIST, SCRIPT_LIST } from '@tools/lang_list';
  import { load_parivartak_lang_data, lipi_parivartak } from '@tools/converter';
  import { LanguageIcon } from '@components/icons';
  import MetaTags from '@components/tags/MetaTags.svelte';
  import User from './User.svelte';
  import { ensure_auth_access_status, get_id_token_info } from '@tools/auth_tools';
  import { browser } from '$app/environment';
  import { main_app_bar_info } from '@state/app_bar';
  import Display from './Display.svelte';
  import { client } from '@api/client';
  import { get_possibily_not_undefined } from '@tools/kry';
  import { BiEdit } from 'svelte-icons-pack/bi';
  import { scale, slide } from 'svelte/transition';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { user_info } from '@state/user';
  import { get_ramayanam_page_link, kANDa_selected, sarga_selected } from '@state/ramayanam_page';
  import { goto } from '$app/navigation';

  const BASE_SCRIPT = 'Sanskrit';

  let sarga_loading = false;
  let viewing_script = BASE_SCRIPT;
  let loaded_viewing_script: string = viewing_script;

  let trans_lang = writable('--');
  let loaded_trans_lang = writable('--');

  let sarga_data: string[] = [];
  let trans_en_data: Map<number, string> = new Map();
  let loaded_en_trans_data = false;
  let view_translation_status = false;

  let loaded_lang_trans_data = false;
  let user_allowed_langs: string[] = [];
  let trans_lang_data = writable(new Map<number, string>());

  let editing_status_on = writable(false);
  let loaded_user_allowed_langs = false; // info related to assigned editable langs

  let kANDa_names: string[] = [];
  $: browser &&
    (kANDa_names = rAmAyaNa_map.map((kANDa) =>
      lipi_parivartak(kANDa.name_devanagari, BASE_SCRIPT, loaded_viewing_script)
    ));
  let sarga_names: string[] = [];
  $: browser &&
    $kANDa_selected !== 0 &&
    (sarga_names = rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) =>
      lipi_parivartak(sarga.name_devanagari.split('\n')[0], BASE_SCRIPT, loaded_viewing_script)
    ));

  onMount(async () => {
    if (browser) await ensure_auth_access_status();
    try {
      $user_info = get_id_token_info().user;
    } catch {}
    if (import.meta.env.DEV) {
      // the options set here are for development purposes
      // can be disabled or modified based on need
      // view_translation_status = true;
      // $trans_lang = 'Hindi';
      // viewing_script = 'Telugu';
      // editing_status_on.set(true);
    }
    load_parivartak_lang_data(BASE_SCRIPT);
    if (browser && import.meta.env.PROD) {
      window.addEventListener('beforeunload', function (e) {
        if ($editing_status_on) {
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
  $: browser &&
    $trans_lang !== '--' &&
    (async () => {
      // loading trnaslation lang data for typing support
      await load_parivartak_lang_data($trans_lang);
      $loaded_trans_lang = $trans_lang;
      let script = $loaded_trans_lang;
      if ($loaded_trans_lang === 'Hindi') script = 'Sanskrit';
      else if ($loaded_trans_lang === 'Tamil') script = 'Tamil-Extended';
      viewing_script = script;
    })();
  $: view_translation_status &&
    browser &&
    (async () => {
      loaded_en_trans_data = false;
      trans_en_data = new Map();
      const en_trans_data = await load_english_translation($kANDa_selected, $sarga_selected);
      trans_en_data = en_trans_data;
      loaded_en_trans_data = true;
    })();
  $: browser &&
    $user_info &&
    (async () => {
      loaded_user_allowed_langs = false;
      if ($user_info.user_type === 'admin') {
        loaded_user_allowed_langs = true;
        return;
      }
      // fetching user info if allowed to edit languages
      const data = (await client.user_info.get_user_allowed_langs.query()).allowed_langs;
      if (!data) user_allowed_langs = [];
      else user_allowed_langs = data;
      loaded_user_allowed_langs = true;
    })();
  $: browser &&
    $loaded_trans_lang !== '--' &&
    (async () => {
      if (!($kANDa_selected !== 0 && $sarga_selected !== 0)) return;
      loaded_lang_trans_data = false;
      $trans_lang_data = new Map();
      const data = await client.translations.get_translations_per_sarga.query({
        lang: $loaded_trans_lang,
        kANDa_num: $kANDa_selected,
        sarga_num: $sarga_selected
      });
      const data_map = new Map<number, string>();
      for (let val of data) {
        // we dont need to manually care abouy 0 or -1, it will be handled while making changes
        data_map.set(val.shloka_num, val.text);
      }
      $trans_lang_data = data_map;
      loaded_lang_trans_data = true;
    })();

  const sarga_unsub = sarga_selected.subscribe(async () => {
    if (!browser) return;
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
    browser && goto(get_ramayanam_page_link($kANDa_selected, $sarga_selected));
  });
  const kANDa_selected_unsub = kANDa_selected.subscribe(() => {
    if (!browser) return;
    if (browser)
      if ($kANDa_selected === 0) goto('/');
      else goto(get_ramayanam_page_link($kANDa_selected, null));
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
    } else {
      const glob_json = import.meta.glob('/data/ramayan/trans_en/json/*/*.json');
      if (!(`/data/ramayan/trans_en/json/${kANDa_num}/${sarga_number}.json` in glob_json))
        return data_map;
      data = (
        (await glob_json[`/data/ramayan/trans_en/json/${kANDa_num}/${sarga_number}.json`]()) as any
      ).default as Record<number, string>;
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
      Script
      <Icon src={LanguageIcon} class="text-4xl" />
      <select class="select inline-block w-40" bind:value={viewing_script}>
        {#each SCRIPT_LIST as lang (lang)}
          <option value={lang}>{lang === 'Sanskrit' ? 'Devanagari' : lang}</option>
        {/each}
      </select>
    </label>
    <User editing_status={$editing_status_on} {user_allowed_langs} />
  </div>
  <label class="space-x-4">
    <span class="font-bold">Select kANDa</span>
    <select bind:value={$kANDa_selected} class="select w-52" disabled={$editing_status_on}>
      <option value={0}>Select</option>
      {#each kANDa_names as kANDa_name, kANDa_index (kANDa_name)}
        <option value={kANDa_index + 1}>{kANDa_index + 1}. {kANDa_name}</option>
      {/each}
    </select>
  </label>
  {#if $kANDa_selected !== 0}
    <label class="space-x-4">
      <span class="font-bold">Select Sarga</span>
      <select bind:value={$sarga_selected} class="select w-52" disabled={$editing_status_on}>
        <option value={0}>Select</option>
        {#each sarga_names as sarga_name, sarga_index (sarga_index)}
          <option value={sarga_index + 1}>{sarga_index + 1}. {sarga_name}</option>
        {/each}
      </select>
    </label>
  {/if}
  {#if $kANDa_selected !== 0 && $sarga_selected !== 0}
    {@const kANDa = rAmAyaNa_map[$kANDa_selected - 1]}
    <div class="space-x-3">
      {#if $sarga_selected !== 1}
        <button
          on:click={() => ($sarga_selected -= 1)}
          in:scale
          out:slide
          disabled={$editing_status_on}
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
          disabled={$editing_status_on}
          class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
        >
          Next
          <Icon class="-mt-1 ml-1 text-xl" src={TiArrowForwardOutline} />
        </button>
      {/if}
      {#if !view_translation_status}
        <button
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
            disabled={$editing_status_on}
            class="select inline-block w-32 px-2 py-1"
            bind:value={$trans_lang}
          >
            <option value="--">-- Select --</option>
            {#each LANG_LIST as lang (lang)}
              <option value={lang}>{lang}</option>
            {/each}
          </select>
        </label>
        {#if !$editing_status_on && $loaded_trans_lang !== '--' && loaded_user_allowed_langs && (get_possibily_not_undefined($user_info).user_type === 'admin' || user_allowed_langs.indexOf($loaded_trans_lang) !== -1)}
          <button
            on:click={() => ($editing_status_on = true)}
            class="btn my-1 rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white dark:bg-tertiary-600"
          >
            <Icon src={BiEdit} class="mr-1 text-2xl" />
            Edit
          </button>
        {/if}
      {/if}
    </div>
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
        sarga_loading,
        sarga_selected,
        kANDa_selected,
        loaded_trans_lang
      }}
    />
  {/if}
</div>
<slot />
