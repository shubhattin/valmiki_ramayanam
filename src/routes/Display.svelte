<script lang="ts">
  import { lipi_parivartak } from '@tools/converter';
  import { get_possibily_not_undefined } from '@tools/kry';

  export let sarga_data: string[];
  export let loaded_viewing_script: string;
  export let BASE_SCRIPT: string;
  export let loaded_en_trans_data: boolean;
  export let trans_en_data: Map<number, string>;
</script>

{#each sarga_data as shloka_lines, i}
  {@const line_transliterated = lipi_parivartak(shloka_lines, BASE_SCRIPT, loaded_viewing_script)}
  {@const line_split = line_transliterated.split('\n')}
  <div class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
    {#if i !== 0 && i !== sarga_data.length - 1}
      <span class="inline-block rounded-full text-center align-top text-xs text-gray-300">{i}</span>
    {/if}
    <div class="ml-1 inline-block">
      <div>
        {#each line_split as line_shlk}
          <div>{line_shlk}</div>
        {/each}
      </div>
      {#if loaded_en_trans_data}
        <div class="text-stone-500 dark:text-slate-300">
          {#if trans_en_data.has(i)}
            <!-- Usually translations are single but still... -->
            {#each get_possibily_not_undefined(trans_en_data.get(i)).split('\n') as line_trans}
              <div>{line_trans}</div>
            {/each}
          {:else if i === sarga_data.length - 1 && trans_en_data.has(-1)}
            <div>{trans_en_data.get(-1)}</div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/each}
