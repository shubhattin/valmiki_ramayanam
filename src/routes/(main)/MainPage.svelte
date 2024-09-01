<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { onDestroy, onMount } from 'svelte';
  import { delay } from '@tools/delay';
  import { writable, type Writable, type Unsubscriber } from 'svelte/store';
  import { LANG_LIST, SCRIPT_LIST } from '@tools/lang_list';
  import { load_parivartak_lang_data, lipi_parivartak } from '@tools/converter';
  import { LanguageIcon } from '@components/icons';
  import User from './User.svelte';
  import { ensure_auth_access_status, get_id_token_info } from '@tools/auth_tools';
  import { browser } from '$app/environment';
  import { main_app_bar_info } from '@state/app_bar';
  import Display from './Display.svelte';
  import { client_raw } from '@api/client';
  import { get_possibily_not_undefined } from '@tools/kry';
  import { BiEdit } from 'svelte-icons-pack/bi';
  import { scale, slide } from 'svelte/transition';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { user_info } from '@state/user';
  import { goto } from '$app/navigation';
  import Select from '@components/Select.svelte';
  import { z } from 'zod';

  const BASE_SCRIPT = 'Sanskrit';

  const unsubscribers: Unsubscriber[] = [];

  export let kANDa_selected: Writable<number>;
  export let sarga_selected: Writable<number>;

  let sarga_loading = false;
  let viewing_script = BASE_SCRIPT;

  let loaded_viewing_script: string = viewing_script;

  let trans_lang = writable('--');
  let loaded_trans_lang = writable('--');

  let sarga_data: string[] = [];
  let view_translation_status = false;

  let user_allowed_langs: string[] = [];

  let editing_status_on = writable(false);
  let loaded_user_allowed_langs = false; // info related to assigned editable langs

  const get_ramayanam_page_link = (kANDa: number, sarga: number | null = null) => {
    return `/${kANDa}${sarga ? `/${sarga}` : ''}`;
  };

  let kANDa_names: string[] = rAmAyaNa_map.map((kANDa) => kANDa.name_devanagari);
  $: browser &&
    (kANDa_names = rAmAyaNa_map.map((kANDa) =>
      lipi_parivartak(kANDa.name_devanagari, BASE_SCRIPT, loaded_viewing_script)
    ));
  let sarga_names: string[] =
    $kANDa_selected !== 0
      ? rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) => sarga.name_devanagari)
      : [];
  $: browser &&
    $kANDa_selected !== 0 &&
    (sarga_names = rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) =>
      lipi_parivartak(sarga.name_devanagari.split('\n')[0], BASE_SCRIPT, loaded_viewing_script)
    ));

  let mounted = false;
  onMount(async () => {
    if (browser) await ensure_auth_access_status();
    try {
      $user_info = get_id_token_info().user;
    } catch {}
    if (import.meta.env.DEV) {
      // view_translation_status = true;
      // $trans_lang = 'Hindi';
      // viewing_script = 'Telugu';
      // editing_status_on.set(true);
    }
    if (browser && import.meta.env.PROD) {
      window.addEventListener('beforeunload', function (e) {
        if ($editing_status_on) {
          e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
          e.returnValue = ''; // Chrome requires returnValue to be set
        }
      });
    }
    await load_parivartak_lang_data(BASE_SCRIPT);
    mounted = true;
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
  $: browser &&
    $user_info &&
    (async () => {
      loaded_user_allowed_langs = false;
      if ($user_info.user_type === 'admin') {
        loaded_user_allowed_langs = true;
        return;
      }
      // fetching user info if allowed to edit languages
      const data = (await client_raw.user_info.get_user_allowed_langs.query()).allowed_langs;
      if (!data) user_allowed_langs = [];
      else user_allowed_langs = data;
      loaded_user_allowed_langs = true;
    })();

  unsubscribers.push(
    sarga_selected.subscribe(async () => {
      if ($kANDa_selected === 0 || $sarga_selected === 0) return;
      if (!browser) return;
      sarga_loading = true;
      sarga_data = [];
      const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
      const data = (
        (await all_sargas[`/data/ramayan/data/${$kANDa_selected}/${$sarga_selected}.json`]()) as any
      ).default as string[];
      await delay(350);
      sarga_loading = false;
      sarga_data = data;
      if (browser && mounted) {
        // console.log([$kANDa_selected, $sarga_selected]);
        goto(get_ramayanam_page_link($kANDa_selected, $sarga_selected));
      }
    })
  );
  unsubscribers.push(
    kANDa_selected.subscribe(() => {
      browser && mounted && ($sarga_selected = 0);
      if (browser && mounted) {
        if ($kANDa_selected !== 0 && $sarga_selected === 0) {
          // console.log('kanda page', [$kANDa_selected, $sarga_selected]);
          goto(get_ramayanam_page_link($kANDa_selected));
        } else if (mounted && $kANDa_selected == 0 && $sarga_selected == 0) {
          // console.log('home');
          goto('/');
        }
      }
    })
  );
  onDestroy(() => {
    unsubscribers.forEach((unsub) => unsub());
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

<!-- <MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} /> -->

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
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="space-x-4">
    <span class="font-bold">Select kANDa</span>
    <Select
      class="select w-52"
      zodType={z.coerce.number().int()}
      bind:value={$kANDa_selected}
      options={[{ value: 0, text: 'Select' }].concat(
        kANDa_names.map((name, index) => ({
          value: index + 1,
          text: `${index + 1} ${name}`
        }))
      )}
      disabled={$editing_status_on}
    />
  </label>
  {#if $kANDa_selected !== 0}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="space-x-4">
      <span class="font-bold">Select Sarga</span>
      <Select
        class="select w-52"
        zodType={z.coerce.number().int()}
        bind:value={$sarga_selected}
        options={[{ value: 0, text: 'Select' }].concat(
          sarga_names.map((name, index) => ({
            value: index + 1,
            text: `${index + 1} ${name}`
          }))
        )}
        disabled={$editing_status_on}
      />
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
        loaded_viewing_script,
        sarga_data,
        editing_status_on,
        sarga_loading,
        sarga_selected,
        kANDa_selected,
        loaded_trans_lang,
        view_translation_status
      }}
    />
  {/if}
</div>
<slot />
