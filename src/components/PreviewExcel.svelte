<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { RiSystemDownloadLine } from 'svelte-icons-pack/ri';
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  import type { Writable } from 'svelte/store';
  import type { Workbook, Worksheet } from 'exceljs';
  import Modal from '@components/Modal.svelte';
  import { normalize_lang_code } from '@tools/converter';
  import { get_text_font } from '@tools/font_tools';

  export let file_link: string;
  export let workbook: Workbook;
  export let file_name: string;
  export let file_preview_opened: Writable<boolean>;

  let sheet_number = 0;

  const get_lang_code_of_columnn = (worksheet: Worksheet, column_i: number) => {
    const lang = normalize_lang_code(
      (worksheet.getCell(1, column_i + 1).value?.toLocaleString() ?? '').split(' ')[0]
    );
    return lang || '';
  };

  let overflow_behavior = 'hidden';
</script>

<div>
  <Modal
    modal_open={file_preview_opened}
    close_on_click_outside={false}
    class="rounded-lg border-2 border-blue-700 bg-[aliceblue] dark:border-blue-500 dark:bg-slate-800"
  >
    <div class="ml-4 flex select-none space-x-4">
      <span class="text-2xl">
        <a href={file_link} class="ml-2" download={file_name}>
          <Icon
            src={RiSystemDownloadLine}
            class="text-blue-800 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
          />
        </a>
      </span>
      <label class="space-x-1">
        <span>Overflow</span>
        <select class="select w-24 p-1" bind:value={overflow_behavior}>
          <option value="hidden">Hidden</option>
          <option value="scroll">Scroll</option>
        </select>
      </label>
    </div>
    <TabGroup>
      {#each workbook.worksheets as worksheet, i}
        <Tab bind:group={sheet_number} name={worksheet.name} value={i}>
          <span class="font-bold">{worksheet.name}</span>
        </Tab>
      {/each}
      <div slot="panel" class="overflow-scroll">
        {@const worksheet = workbook.worksheets[sheet_number]}
        <table class="table table-hover table-compact table-cell-fit">
          <thead>
            <tr>
              {#each Array(worksheet.columnCount) as _, i}
                {@const row_value = worksheet.getCell(1, i + 1).value}
                <th class="text-center">{row_value ?? ''}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each Array(worksheet.rowCount) as _, row_i}
              <tr>
                {#each Array(worksheet.columnCount) as _, column_i}
                  {@const row_value =
                    worksheet.getCell(row_i + 2, column_i + 1).value?.toLocaleString() ?? ''}
                  {@const lang = get_lang_code_of_columnn(worksheet, column_i)}
                  <td>
                    <pre
                      class={`${get_text_font(lang)} hide-scrollbar max-w-72 scroll-m-0 ${overflow_behavior === 'scroll' ? 'overflow-scroll' : 'overflow-hidden'} text-sm`}>{row_value}</pre>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </TabGroup>
  </Modal>
</div>
