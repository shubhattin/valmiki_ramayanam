<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { onDestroy, onMount } from 'svelte';
  import { delay } from '@tools/delay';
  import { writable, type Writable, type Unsubscriber } from 'svelte/store';
  import { LANG_LIST, SCRIPT_LIST } from '@tools/lang_list';
  import { load_parivartak_lang_data, lipi_parivartak_async } from '@tools/converter';
  import { LanguageIcon } from '@components/icons';
  import User from './User.svelte';
  import { ensure_auth_access_status, get_id_token_info } from '@tools/auth_tools';
  import { browser } from '$app/environment';
  import Display from './Display.svelte';
  import { client, client_raw } from '@api/client';
  import { get_possibily_not_undefined } from '@tools/kry';
  import { BiEdit } from 'svelte-icons-pack/bi';
  import { scale, slide } from 'svelte/transition';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { user_info } from '@state/user';
  import { goto } from '$app/navigation';
  import Select from '@components/Select.svelte';
  import { z } from 'zod';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { BsThreeDots } from 'svelte-icons-pack/bs';
  import { popup } from '@skeletonlabs/skeleton';
  import { RiDocumentFileExcel2Line } from 'svelte-icons-pack/ri';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { transliterate_xlxs_file } from '@tools/excel/transliterate_xlsx_file';

  const BASE_SCRIPT = 'Sanskrit';
  let mounted = false;

  const unsubscribers: Unsubscriber[] = [];
  const query_client = useQueryClient();

  export let kANDa_selected: Writable<number>;
  export let sarga_selected: Writable<number>;

  const params_viewing_script_mut_schema = z.object({
    script: z.string(),
    update_viewing_script_selection: z.boolean().default(true)
  });
  let viewing_script_selection = writable(BASE_SCRIPT);
  let viewing_script = BASE_SCRIPT;
  let viewing_script_mut = createMutation({
    mutationKey: ['viewing_script'],
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
    mutationKey: ['trans_lang'],
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
      $trans_lang_selection = lang;
      $trans_lang = lang;
      query_client.invalidateQueries({ queryKey: ['sanskrit_mode_texts'] });
    }
  });
  unsubscribers.push(
    trans_lang_selection.subscribe(async (lang) => {
      $trans_lang_mut.mutate(lang);
    })
  );
  let trans_lang = writable($trans_lang_selection);

  let view_translation_status = false;

  $: user_allowed_langs = client.user_info.get_user_allowed_langs.query(undefined, {
    enabled: !!(browser && $user_info && $user_info.user_type !== 'admin'),
    placeholderData: []
  });

  let editing_status_on = writable(false);

  const get_ramayanam_page_link = (kANDa: number, sarga: number | null = null) => {
    return `/${kANDa}${sarga ? `/${sarga}` : ''}`;
  };

  let kANDa_names: string[] = rAmAyaNa_map.map((kANDa) => kANDa.name_devanagari);
  $: browser &&
    Promise.all(
      rAmAyaNa_map.map((kANDa) =>
        lipi_parivartak_async(kANDa.name_devanagari, BASE_SCRIPT, viewing_script)
      )
    ).then((_kANDa_names) => (kANDa_names = _kANDa_names));
  let sarga_names: string[] =
    $kANDa_selected !== 0
      ? rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) => sarga.name_devanagari)
      : [];
  $: browser &&
    $kANDa_selected !== 0 &&
    Promise.all(
      rAmAyaNa_map[$kANDa_selected - 1].sarga_data.map((sarga) =>
        lipi_parivartak_async(sarga.name_devanagari.split('\n')[0], BASE_SCRIPT, viewing_script)
      )
    ).then((_sarga_names) => (sarga_names = _sarga_names));

  onMount(async () => {
    if (browser) await ensure_auth_access_status();
    try {
      $user_info = get_id_token_info().user;
    } catch {}
    if (import.meta.env.DEV) {
      view_translation_status = true;
      $trans_lang_mut.mutateAsync('Hindi').then(() => editing_status_on.set(true));
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

  $: sarga_data = createQuery({
    queryKey: ['sarga', 'main_dev_text', $kANDa_selected, $sarga_selected],
    enabled: browser && $kANDa_selected !== 0 && $sarga_selected !== 0,
    placeholderData: [],
    queryFn: async () => {
      if (!browser) return [];
      const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
      const data = (
        (await all_sargas[`/data/ramayan/data/${$kANDa_selected}/${$sarga_selected}.json`]()) as any
      ).default as string[];
      await delay(350);
      return data;
    }
  });

  const QUERY_KEYS = {
    trans_lang_data: (lang: string, kANDa_num: number, sarga_num: number) => [
      'sarga',
      'trans',
      lang,
      kANDa_num,
      sarga_num
    ]
  };
  $: trans_en_data = createQuery({
    queryKey: QUERY_KEYS.trans_lang_data('English', $kANDa_selected, $sarga_selected),
    // by also adding the kanda and sarga they are auto invalidated
    // so we dont have to manually invalidate it if were only sarga,trans,English
    enabled: browser && view_translation_status && $kANDa_selected !== 0 && $sarga_selected !== 0,
    queryFn: () => load_english_translation($kANDa_selected, $sarga_selected)
  });
  $: trans_lang_data_query_key = QUERY_KEYS.trans_lang_data(
    $trans_lang,
    $kANDa_selected,
    $sarga_selected
  );

  const load_english_translation = async (kANDa_num: number, sarga_number: number) => {
    await delay(250);
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
  const download_excel_file = createMutation({
    mutationKey: ['sarga', 'download_excel_data'],
    mutationFn: async () => {
      if (!browser) return;
      // the method used below creates a url for both dev and prod
      const ExcelJS = (await import('exceljs')).default;
      const url = new URL('/data/ramayan/template/excel_file_template.xlsx', import.meta.url).href;
      const req = await fetch(url);
      const file_blob = await req.blob();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file_blob.arrayBuffer());
      const worksheet = workbook.getWorksheet(1)!;
      const COLUMN_FOR_DEV = 2;
      const TEXT_START_ROW = 2;
      const translation_texts: Map<string, Map<number, string>> = new Map();
      //load english translations
      const english_translation = await load_english_translation($kANDa_selected, $sarga_selected);
      translation_texts.set('English', english_translation);
      const shloka_count =
        rAmAyaNa_map[$kANDa_selected - 1].sarga_data[$sarga_selected - 1].shloka_count;
      // loading other language translations
      const other_translations =
        await client_raw.translations.get_all_langs_translations_per_sarga.query({
          kANDa_num: $kANDa_selected,
          sarga_num: $sarga_selected
        });
      for (let data of other_translations) {
        if (!translation_texts.has(data.lang)) translation_texts.set(data.lang, new Map());
        translation_texts.get(data.lang)!.set(data.shloka_num, data.text);
      }

      for (let i = 0; i < $sarga_data.data!.length; i++) {
        worksheet.getCell(i + COLUMN_FOR_DEV, TEXT_START_ROW).value = $sarga_data.data![i];
      }
      await transliterate_xlxs_file(
        workbook,
        'all',
        1,
        COLUMN_FOR_DEV,
        TEXT_START_ROW,
        BASE_SCRIPT,
        null,
        translation_texts,
        shloka_count
      );

      // saving file to output path
      let sarga_name =
        rAmAyaNa_map[$kANDa_selected - 1].sarga_data[$sarga_selected - 1].name_normal.split(
          '\n'
        )[0];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadLink = URL.createObjectURL(blob);
      download_file_in_browser(downloadLink, `${$sarga_selected}. ${sarga_name}.xlsx`);
    }
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
    <User editing_status={$editing_status_on} user_allowed_langs={$user_allowed_langs.data ?? []} />
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
    <div class="space-x-8">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="inline-block space-x-4">
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
      {#if $kANDa_selected !== 0 && $sarga_selected !== 0}
        <button
          title="Extra Options"
          transition:scale
          use:popup={{
            event: 'click',
            target: 'sarga_options',
            placement: 'bottom'
          }}
          class="btn m-0 rounded-full p-[0.05rem] ring-2 ring-zinc-400 dark:ring-zinc-300"
        >
          <Icon class="text-2xl" src={BsThreeDots} />
        </button>
        <div class="card z-50 space-y-1 rounded-lg px-1 py-1 shadow-xl" data-popup="sarga_options">
          <button
            on:click={() => $download_excel_file.mutate()}
            class="btn block w-full rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Icon
              class="-mt-1 mr-1 text-2xl text-green-600 dark:text-green-400"
              src={RiDocumentFileExcel2Line}
            />
            Download Excel File
          </button>
          <!-- <button
            class="btn block w-full rounded-md px-2 py-1 text-start hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Icon src={TrOutlineFileTypeTxt} class=" mr-1 text-2xl" />
            Download Text File
          </button> -->
        </div>
      {/if}
    </div>
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
        {#if !$editing_status_on && $trans_lang !== '--' && $user_allowed_langs.isSuccess && $user_info && (get_possibily_not_undefined($user_info).user_type === 'admin' || $user_allowed_langs.data.indexOf($trans_lang) !== -1)}
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
        sarga_data,
        trans_en_data,
        trans_lang_data_query_key
      }}
    />
  {/if}
</div>
<slot />
