<script lang="ts">
  import { browser } from '$app/environment';
  import { load_english_translation, sarga_data } from '@state/main_page/data';
  import {
    sarga_selected,
    kANDa_selected,
    BASE_SCRIPT,
    image_tool_opened
  } from '@state/main_page/main_state';
  import { createMutation } from '@tanstack/svelte-query';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { BsThreeDots } from 'svelte-icons-pack/bs';
  import { popup } from '@skeletonlabs/skeleton';
  import { RiDocumentFileExcel2Line } from 'svelte-icons-pack/ri';
  import { transliterate_xlxs_file } from '@tools/excel/transliterate_xlsx_file';
  import { client_raw } from '@api/client';
  import rAmAyaNa_map from '@data/ramayan/ramayan_map.json';
  import { scale } from 'svelte/transition';
  import Icon from '@tools/Icon.svelte';
  import Modal from '@components/Modal.svelte';

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

<button
  title="Extra Options"
  transition:scale
  use:popup={{
    event: 'click',
    target: 'sarga_options',
    placement: 'left-end'
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
  <button
    on:click={() => image_tool_opened.set(true)}
    class="btn block w-full rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
  >
    Image Tool
  </button>
  <!-- <button
            class="btn block w-full rounded-md px-2 py-1 text-start hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Icon src={TrOutlineFileTypeTxt} class=" mr-1 text-2xl" />
            Download Text File
          </button> -->
</div>
<div>
  <Modal modal_open={image_tool_opened} close_on_click_outside={false}>
    {#await import('../image_tool/ImageTool.svelte') then ImageTool}
      <ImageTool.default />
    {/await}
  </Modal>
</div>
