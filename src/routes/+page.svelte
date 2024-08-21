<script lang="ts">
  import MainAppBar from '@components/MainAppBar.svelte';
  import Icon from '@tools/Icon.svelte';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { fade, scale, slide } from 'svelte/transition';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { RiDocumentFileExcel2Line } from 'svelte-icons-pack/ri';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';
  import { transliterate_xlxs_file } from '@tools/excel/transliterate_xlsx_file';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { onDestroy, onMount } from 'svelte';
  import { delay } from '@tools/delay';
  import { writable } from 'svelte/store';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { SCRIPT_LIST } from '@tools/lang_list';
  import { load_parivartak_lang_data, lipi_parivartak } from '@tools/converter';
  import { LanguageIcon } from '@components/icons';
  import MetaTags from '@components/MetaTags.svelte';
  import User from './User.svelte';
  import Authenticate from '@components/Authenticate.svelte';

  const BASE_SCRIPT = 'Sanskrit';

  let kANDa_selected = writable(0);
  let sarga_selected = writable(0);
  let sarga_data: string[] = [];
  let sarga_loading = false;
  let enable_copy_to_clipbaord = true;
  let copied_shloka_number: number | null = null;
  let viewing_script = BASE_SCRIPT;
  let loaded_viewing_script: string = viewing_script;

  $: (async () => {
    await load_parivartak_lang_data(viewing_script);
    loaded_viewing_script = viewing_script;
  })();
  $: copied_shloka_number !== null && setTimeout(() => (copied_shloka_number = null), 1400);

  onMount(async () => {
    if (import.meta.env.DEV) {
      $kANDa_selected = 1;
      $sarga_selected = 1;
    }
    await load_parivartak_lang_data(BASE_SCRIPT);
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
  });

  onDestroy(() => {
    kANDa_selected_unsub();
    sarga_unsub();
  });

  const download_excel_file = async () => {
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
    for (let i = 0; i < sarga_data.length; i++) {
      worksheet.getCell(i + COLUMN_FOR_DEV, TEXT_START_ROW).value = sarga_data[i];
    }
    await transliterate_xlxs_file(workbook, 'all', 1, COLUMN_FOR_DEV, TEXT_START_ROW, 'Sanskrit');

    // saving file to output path
    let sarga_name =
      rAmAyaNa_map[$kANDa_selected - 1].sarga_data[$sarga_selected - 1].name_normal.split('\n')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const downloadLink = URL.createObjectURL(blob);
    download_file_in_browser(downloadLink, `${$sarga_selected}. ${sarga_name}.xlsx`);
  };

  const copy_text_to_clipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const PAGE_INFO = {
    title: 'श्रीमद्रामायणम्',
    description: 'श्रीमद्रामायणस्य पठनम्'
  };
</script>

<MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} />

<MainAppBar page="home">
  <span slot="headline">
    <span class="text-2xl font-bold">{PAGE_INFO.title}</span>
  </span>
</MainAppBar>
<Authenticate is_verified={writable(false)} />
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
      <!-- <button
				on:click={download_excel_file}
				class="variant-outline-success btn rounded-lg border-2 border-emerald-600 px-2 py-2 font-bold dark:border-emerald-400"
			>
				<Icon
					class="-mt-1 mr-2 text-2xl text-green-600 dark:text-green-400"
					src={RiDocumentFileExcel2Line}
				/>
				Download Excel File
			</button> -->
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
      class="h-[65vh] overflow-scroll rounded-xl border-2 border-red-600 px-2 py-3 dark:border-yellow-300"
    >
      {#if !sarga_loading}
        <div transition:fade={{ duration: 250 }} class="">
          {#each sarga_data as line, i}
            {@const line_transliterated = lipi_parivartak(line, BASE_SCRIPT, loaded_viewing_script)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
              on:dblclick={() => {
                if (enable_copy_to_clipbaord) {
                  copied_shloka_number = i;
                  copy_text_to_clipboard(line_transliterated);
                }
              }}
            >
              <pre>{line_transliterated}</pre>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
