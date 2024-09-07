<script lang="ts">
  import { useQueryClient, type CreateQueryResult } from '@tanstack/svelte-query';
  import LipiLekhikA from '@tools/converter';
  import Icon from '@tools/Icon.svelte';
  import { copy_text_to_clipboard, get_possibily_not_undefined } from '@tools/kry';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';
  import { RiSystemAddLargeLine } from 'svelte-icons-pack/ri';
  import { slide } from 'svelte/transition';
  import { editing_status_on, trans_lang, sanskrit_mode } from '@state/main_page/main_state';
  import { trans_lang_data_query_key } from '@state/main_page/data';

  const query_client = useQueryClient();

  export let shloka_lines: string;
  export let trans_index: number;
  export let trans_en_data: CreateQueryResult<Map<number, string>, Error>;
  export let trans_lang_data: CreateQueryResult<Map<number, string>, Error>;
  export let added_translations_indexes: number[];
  export let edited_translations_indexes: Set<number>;
  export let edit_language_typer_status: boolean;

  $: line_split = shloka_lines.split('\n');

  // clipboard related
  let enable_copy_to_clipbaord = true;
  let copied_text_status = false;
  $: copied_text_status && setTimeout(() => (copied_text_status = false), 1400);

  async function update_trans_data(index: number, text: string) {
    const new_data = new Map($trans_lang_data.data);
    new_data.set(index, text);
    await query_client.setQueryData($trans_lang_data_query_key, new_data);
  }
</script>

{#if copied_text_status}
  <span
    class="fixed bottom-2 right-2 z-50 cursor-default select-none font-bold text-green-700 dark:text-green-300"
  >
    <Icon src={BsClipboard2Check} />
    Copied to Clipboard
  </span>
{/if}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:dblclick={() => {
    if (!enable_copy_to_clipbaord) return;
    copy_text_to_clipboard(shloka_lines);
    copied_text_status = true;
  }}
>
  {#each line_split as line_shlk}
    <!-- if needed add 'whitespace-pre-wrap'2 -->
    <div class="font">{line_shlk}</div>
  {/each}
</div>
{#if $trans_en_data.isSuccess && $trans_en_data.data.size !== 0}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:dblclick={() => {
      if (!enable_copy_to_clipbaord) return;
      copy_text_to_clipboard(get_possibily_not_undefined($trans_en_data.data.get(trans_index)));
      copied_text_status = true;
    }}
    class="text-stone-500 dark:text-slate-400"
  >
    {#if $trans_en_data.data.has(trans_index)}
      <!-- Usually translations are single but still... -->
      {#each get_possibily_not_undefined($trans_en_data.data.get(trans_index)).split('\n') as line_trans}
        <div>{line_trans}</div>
      {/each}
    {/if}
  </div>
{/if}
{#if $editing_status_on && $trans_lang_data.isSuccess}
  <div transition:slide>
    {#if !$trans_lang_data.data?.has(trans_index)}
      <button
        on:click={async () => {
          await update_trans_data(trans_index, '');
          added_translations_indexes.push(trans_index);
        }}
        class="btn m-0 rounded-md bg-surface-500 p-0 px-1 font-bold text-white dark:bg-surface-500"
      >
        <Icon src={RiSystemAddLargeLine} />
      </button>
    {:else}
      <textarea
        on:input={(e) => {
          if (!added_translations_indexes.includes(trans_index))
            edited_translations_indexes.add(trans_index);
          if (edit_language_typer_status)
            LipiLekhikA.mukhya(
              e.target,
              // @ts-ignore
              e.data,
              $trans_lang,
              true,
              // @ts-ignore
              (val) => {
                update_trans_data(trans_index, val);
              },
              $sanskrit_mode
            );
          else {
            update_trans_data(trans_index, e.currentTarget.value);
          }
        }}
        class="font textarea h-16 w-full"
        value={$trans_lang_data.data?.get(trans_index)}
      ></textarea>
    {/if}
  </div>
{:else if $trans_lang_data.isSuccess && $trans_lang_data.data.size !== 0}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:dblclick={() => {
      if (!enable_copy_to_clipbaord) return;
      copy_text_to_clipboard(get_possibily_not_undefined($trans_lang_data.data?.get(trans_index)));
      copied_text_status = true;
    }}
    class="text-yellow-700 dark:text-yellow-500"
  >
    {#if $trans_lang_data.data?.has(trans_index)}
      <!-- Usually translations are single but still... -->
      {#each get_possibily_not_undefined($trans_lang_data.data?.get(trans_index)).split('\n') as line_trans}
        <div class="font">{line_trans}</div>
      {/each}
    {/if}
  </div>
{/if}
