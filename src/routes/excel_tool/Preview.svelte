<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { RiSystemDownloadLine } from 'svelte-icons-pack/ri';
  import { CgClose } from 'svelte-icons-pack/cg';
  import { scale, slide } from 'svelte/transition';
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  import type { Writable } from 'svelte/store';
  import type { Workbook } from 'exceljs';

  export let file_link: string;
  export let workbook: Workbook;
  export let file_name: string;
  export let file_preview_opened: Writable<boolean>;

  let sheet_number = 0;
</script>

<div
  in:slide
  out:scale
  class="h-11/12 fixed left-2 top-2 z-10 block max-h-[94%] min-h-[80%] w-11/12 overflow-scroll rounded-lg border-2 border-blue-700 bg-[aliceblue] p-2 dark:border-blue-500 dark:bg-slate-800"
>
  <div class="ml-4 flex" style="justify-content: space-between;">
    <span class="text-2xl">
      <a href={file_link} class="ml-2" download={file_name}>
        <Icon
          src={RiSystemDownloadLine}
          class="text-blue-800 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
        />
      </a>
    </span>
    <button
      on:click={() => {
        $file_preview_opened = false;
      }}
    >
      <Icon
        src={CgClose}
        class="cursor-button text-4xl text-red-500 active:text-black dark:text-red-400 dark:active:text-white"
      />
    </button>
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
                {@const row_value = worksheet.getCell(row_i + 2, column_i + 1).value}
                <td><pre>{row_value ?? ''}</pre></td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </TabGroup>
</div>
