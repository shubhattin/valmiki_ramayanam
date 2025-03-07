<script lang="ts">
  import { Accordion, FileUpload } from '@skeletonlabs/skeleton-svelte';
  import { slide, scale, fly } from 'svelte/transition';
  import { SCRIPT_LIST } from '~/tools/lang_list';
  import Icon from '~/tools/Icon.svelte';
  import { IoOptions } from 'svelte-icons-pack/io';
  import { AiOutlineDelete } from 'svelte-icons-pack/ai';
  import { VscDebugStart, VscPreview } from 'svelte-icons-pack/vsc';
  import { OiGear16 } from 'svelte-icons-pack/oi';
  import { FiCircle } from 'svelte-icons-pack/fi';
  import { TiTick } from 'svelte-icons-pack/ti';
  import { BiSolidDownload } from 'svelte-icons-pack/bi';
  import type { Workbook } from 'exceljs';
  import { delay } from '~/tools/delay';
  import { transliterate_xlxs_file } from '~/tools/excel/transliterate_xlsx_file';
  import { download_file_in_browser } from '~/tools/download_file_browser';
  import PreviewExcel from '~/components/PreviewExcel.svelte';
  import MetaTags from '~/components/tags/MetaTags.svelte';
  import { createMutation } from '@tanstack/svelte-query';
  import { PAGE_TITLES } from '~/state/page_titles';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';

  let file_download_links: string[] = $state([]);
  let file_workbooks: Workbook[] = $state([]);
  let file_list: FileList = $state(null!);
  // let file_list = [{ name: 'vAlamIki.xlsx' }, { name: 'nArada.xlxs' }]; // @warn

  // default options
  let lang_row_index = $state(1);
  let text_col_index = $state(2);
  let text_row_start_index = $state(2);
  let base_lang_code = $state('Sanskrit');
  let file_name_prefix = $state('');
  let file_name_postfix = $state('_transliterated');

  let file_preview_opened = $state(false);
  let current_workbook: Workbook = $state(null!);
  let current_file_preview_link = $state('');
  let current_file_name = $state('');

  const excel_transliteration = createMutation({
    mutationKey: ['excel', 'start_transliteration'],
    mutationFn: start_transliteration_func
  });

  function clear_file_list() {
    file_list = null!;
    file_preview_opened = false;
    current_workbook = null!;
    current_file_name = null!;
    current_file_preview_link = null!;
    $excel_transliteration.reset();

    // resetting the defaults as well
    lang_row_index = 1;
    text_col_index = 2;
    text_row_start_index = 2;
    base_lang_code = 'Sanskrit';
    file_name_prefix = '';
    file_name_postfix = '_transliterated';
    // const modal: ModalSettings = {
    //   type: 'confirm',
    //   title: 'Please Confirm',
    //   body: 'Are you sure to clear all loaded files ?',
    //   response: (resp: boolean) => {
    //     if (!resp) return;
    //   }
    // };
    // modalStore.trigger(modal);
  }

  async function start_transliteration_func() {
    const ExcelJS = (await import('exceljs')).default;
    const get_workbook_obj_from_file = (file: File) => {
      return new Promise<Workbook>(async (resolve) => {
        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();
        reader.onload = async (event) => {
          const data = event.target?.result;
          if (data instanceof ArrayBuffer) {
            await workbook.xlsx.load(data);
            resolve(workbook);
            return;
          }
        };
        reader.readAsArrayBuffer(file);
      });
    };
    file_download_links = [];
    file_workbooks = [];
    for (let file of file_list) {
      if (!file) continue;
      const workbook = await get_workbook_obj_from_file(file);
      await transliterate_xlxs_file(
        workbook,
        'all',
        lang_row_index,
        text_col_index,
        text_row_start_index,
        base_lang_code
      );
      file_workbooks.push(workbook);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadLink = URL.createObjectURL(blob);
      file_download_links.push(downloadLink);
    }
    await delay(400);
  }

  const download_file = (file_index: number) => {
    const file = file_list[file_index];
    const download_link = file_download_links[file_index];

    download_file_in_browser(download_link, get_file_name_with_prefix_postfix(file.name));
  };

  const get_file_name_with_prefix_postfix = (name: string) => {
    const base_name = `${name.substring(0, name.length - 5)}`;
    return `${file_name_prefix}${base_name}${file_name_postfix}.xlsx`;
  };

  const [TITLE] = PAGE_TITLES['/excel_tool'];
  const PAGE_INFO = {
    title: TITLE,
    description: 'A Utility to transliterate text in Excel files for Indian Scripts'
  };
</script>

<MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} />

<div class="mt-3 space-y-4">
  {#if !file_list}
    <div in:scale out:slide>
      <FileUpload name="files" accept=".xlsx">Select Excel files</FileUpload>
    </div>
  {/if}
  {#if file_list && file_list.length !== 0}
    <Accordion value={[]}>
      <!-- @warn -->
      <Accordion.Item value="options">
        {#snippet lead()}
          <Icon src={IoOptions} class="text-3xl" />
        {/snippet}
        {#snippet control()}
          <span class="font-bold">Change Default Options</span>
        {/snippet}
        {#snippet panel()}
          <label class="block space-x-2">
            <span>Language Row Number</span>
            <input type="number" bind:value={lang_row_index} class="input w-16 rounded-lg" />
          </label>
          <label class="block space-x-2">
            <span>Text Column Number</span>
            <input type="number" bind:value={text_col_index} class="input w-16 rounded-lg" />
          </label>
          <label class="block space-x-2">
            <span>Text Row Start Number</span>
            <input type="number" bind:value={text_row_start_index} class="input w-16 rounded-lg" />
          </label>
          <label class="block">
            <span class="mr-2">Transliterated file name template</span>
            <input type="text" bind:value={file_name_prefix} class="input w-28 rounded-lg p-1" />
            <input
              type="text"
              value="file_name"
              disabled={true}
              class="input w-20 rounded-lg p-1"
            />
            <input type="text" bind:value={file_name_postfix} class="input w-36 rounded-lg p-1" />
          </label>
          <label class="block space-y-1">
            <span>Base Language</span>
            <select class="select" bind:value={base_lang_code}>
              {#each SCRIPT_LIST as lang (lang)}
                <option value={lang}>{lang}</option>
              {/each}
            </select>
          </label>
        {/snippet}
      </Accordion.Item>
    </Accordion>
    <ConfirmModal
      popup_state={false}
      close_on_confirm={true}
      confirm_func={clear_file_list}
      description="Are you sure to clear all loaded files ?"
    >
      <button class="preset-filled-error-500 btn flex">
        <Icon src={AiOutlineDelete} class="mr-1 text-2xl" />
        Clear File List
      </button>
    </ConfirmModal>
    <ul
      transition:slide
      class="list rounded-lg border-2 border-amber-800 p-2 dark:border-yellow-600"
    >
      {#each file_list as file, file_index (file.name)}
        <li class="font-bold">
          <span class="mr-2.5">
            {#if $excel_transliteration.isPending}
              <Icon src={OiGear16} class="animate-spin text-xl" />
            {:else if !$excel_transliteration.isSuccess}
              <Icon src={FiCircle} class="text-xl text-zinc-500" />
            {:else}
              <Icon src={TiTick} class="text-xl text-green-600 dark:text-green-500" />
            {/if}
            {#if $excel_transliteration.isSuccess}
              <span in:fly>
                <button
                  class="btn m-0 p-0"
                  disabled={$excel_transliteration.isPending}
                  onclick={() => download_file(file_index)}
                  ><Icon
                    src={BiSolidDownload}
                    class="text-xl hover:text-gray-500 active:text-green-600 dark:hover:text-gray-400"
                  /></button
                >
                <button
                  class="btn m-0 p-0"
                  disabled={$excel_transliteration.isPending}
                  onclick={() => {
                    current_workbook = file_workbooks[file_index];
                    current_file_preview_link = file_download_links[file_index];
                    current_file_name = get_file_name_with_prefix_postfix(file.name);
                    file_preview_opened = true;
                  }}
                  ><Icon
                    src={VscPreview}
                    class="text-xl hover:text-slate-500 active:text-blue-600 dark:hover:text-slate-400"
                  /></button
                >
              </span>
            {/if}
          </span>
          {file.name}
        </li>
      {/each}
    </ul>

    <button
      onclick={() => $excel_transliteration.mutate()}
      disabled={$excel_transliteration.isPending}
      class="variant-outline-success btn flex font-bold text-green-700 dark:text-white"
    >
      <Icon src={VscDebugStart} class="mr-1 text-2xl" />
      Start Transliteration
    </button>
    {#if file_preview_opened}
      <PreviewExcel
        workbook={current_workbook}
        bind:file_preview_opened
        file_name={current_file_name}
        file_link={current_file_preview_link}
      />
    {/if}
  {/if}
</div>
