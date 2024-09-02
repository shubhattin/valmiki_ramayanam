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
  import { createMutation } from '@tanstack/svelte-query';

  const BASE_SCRIPT = 'Sanskrit';
  let mounted = false;

  const unsubscribers: Unsubscriber[] = [];

  export let kANDa_selected: Writable<number>;
  export let sarga_selected: Writable<number>;

  const params_viewing_script_mut_schema = z.object({
    script: z.string(),
    update_viewing_script_selection: z.boolean().default(true)
  });
  let viewing_script_selection = writable(BASE_SCRIPT);
  let viewing_script = BASE_SCRIPT;
  let viewing_script_mut = createMutation({
    mutationFn: async (params: z.infer<typeof params_viewing_script_mut_schema>) => {
      const { script } = params_viewing_script_mut_schema.parse(params);
      if (!mounted) return script;
      await delay(500);
      await load_parivartak_lang_data(script);
      return script;
    },
    onSuccess(script, { update_viewing_script_selection }) {
      viewing_script = script;
      if (update_viewing_script_selection) $viewing_script_selection = script;
    }
  });
  unsubscribers.push(
    viewing_script_selection.subscribe(async (script) => {
      $viewing_script_mut.mutate({
        script,
        update_viewing_script_selection: false
      });
    })
  );

  let trans_lang_selection = writable('--');
  const trans_lang_mut = createMutation({
    mutationFn: async (lang: string) => {
      if (!mounted || !browser || lang === '--') return lang;
      // loading trnaslation lang data for typing support
      await delay(300);
      let script = lang;
      if (lang === 'Hindi') script = 'Sanskrit';
      else if (lang === 'Tamil') script = 'Tamil-Extended';
      await Promise.all([
        $viewing_script_mut.mutateAsync({ script, update_viewing_script_selection: true }),
        load_parivartak_lang_data(lang)
      ]);
      return lang;
    },
    onSuccess(lang) {
      $trans_lang = lang;
    }
  });
  unsubscribers.push(
    trans_lang_selection.subscribe(async (lang) => {
      $trans_lang_mut.mutate(lang);
    })
  );
  let trans_lang = writable($trans_lang_selection);

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
      lipi_parivartak(kANDa.name_devanagari, BASE_SCRIPT, viewing_script)
    ));
  let sarga_names: string[] =
    $kANDa_selected !== 0
      ? rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) => sarga.name_devanagari)
      : [];
  $: browser &&
    $kANDa_selected !== 0 &&
    (sarga_names = rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) =>
      lipi_parivartak(sarga.name_devanagari.split('\n')[0], BASE_SCRIPT, viewing_script)
    ));

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
</script>

<div class="mt-4 space-y-4">
  <div class="flex justify-between">
    <label class="space-x-4">
      Script
      <Icon src={LanguageIcon} class="text-4xl" />
      <select
        class="select inline-block w-40"
        disabled={$viewing_script_mut.isPending}
        bind:value={$viewing_script_selection}
      >
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
            disabled={$editing_status_on ||
              $trans_lang_mut.isPending ||
              $viewing_script_mut.isPending}
            class="select inline-block w-32 px-2 py-1"
            bind:value={$trans_lang_selection}
          >
            <option value="--">-- Select --</option>
            {#each LANG_LIST as lang (lang)}
              <option value={lang}>{lang}</option>
            {/each}
          </select>
        </label>
        {#if !$editing_status_on && $trans_lang !== '--' && loaded_user_allowed_langs && (get_possibily_not_undefined($user_info).user_type === 'admin' || user_allowed_langs.indexOf($trans_lang) !== -1)}
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
        viewing_script,
        editing_status_on,
        sarga_selected,
        kANDa_selected,
        trans_lang,
        view_translation_status
      }}
    />
  {/if}
</div>
<slot />
