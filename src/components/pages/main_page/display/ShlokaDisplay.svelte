<script lang="ts">
  import { get_text_font } from '@tools/font_tools';
  import { get_possibily_not_undefined } from '@tools/kry';
  import {
    viewing_script,
    editing_status_on,
    added_translations_indexes,
    edited_translations_indexes,
    sanskrit_mode,
    edit_language_typer_status,
    trans_lang
  } from '@state/main_page/main_state';
  import { trans_en_data, trans_lang_data } from '@state/main_page/data';
  import { slide } from 'svelte/transition';
  import Icon from '@tools/Icon.svelte';
  import { RiSystemAddLargeLine } from 'svelte-icons-pack/ri';
  import LipiLekhikA from '@tools/converter';

  export let trans_index: number;
  export let shloka_lines: string;
  export let update_trans_lang_data: (index: number, text: string) => Promise<void>;
  export let copy_text: (text: string) => void;

  $: line_split = shloka_lines.split('\n');
</script>

<div class="mt-0 w-full space-y-1">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:dblclick={() => copy_text(shloka_lines)}>
    {#each line_split as line_shlk}
      <!-- if needed add 'whitespace-pre-wrap'2 -->
      <div class={`${get_text_font($viewing_script)}`}>{line_shlk}</div>
    {/each}
  </div>
  {#if $trans_en_data.isSuccess && $trans_en_data.data.size !== 0}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:dblclick={() =>
        copy_text(get_possibily_not_undefined($trans_en_data.data.get(trans_index)))}
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
            await update_trans_lang_data(trans_index, '');
            $added_translations_indexes.push(trans_index);
          }}
          class="btn m-0 rounded-md bg-surface-500 px-1 py-0 font-bold text-white dark:bg-surface-500"
        >
          <Icon src={RiSystemAddLargeLine} />
        </button>
      {:else}
        <textarea
          on:input={(e) => {
            if (!$added_translations_indexes.includes(trans_index))
              $edited_translations_indexes.add(trans_index);
            let callback_function_called_from_lipi_lekhika = false;
            if ($edit_language_typer_status)
              LipiLekhikA.mukhya(
                e.target,
                // @ts-ignore
                e.data,
                $trans_lang,
                true,
                // @ts-ignore
                (val) => {
                  update_trans_lang_data(trans_index, val);
                  callback_function_called_from_lipi_lekhika = true;
                },
                $sanskrit_mode
              );
            if (!callback_function_called_from_lipi_lekhika) {
              update_trans_lang_data(trans_index, e.currentTarget.value);
            }
          }}
          class={`${get_text_font($viewing_script)} textarea h-16 w-full`}
          value={$trans_lang_data.data?.get(trans_index)}
        ></textarea>
      {/if}
    </div>
  {:else if $trans_lang_data.isSuccess && $trans_lang_data.data.size !== 0}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:dblclick={() =>
        copy_text(get_possibily_not_undefined($trans_lang_data.data?.get(trans_index)))}
      class="text-yellow-700 dark:text-yellow-500"
    >
      {#if $trans_lang_data.data?.has(trans_index)}
        <!-- Usually translations are single but still... -->
        {#each get_possibily_not_undefined($trans_lang_data.data?.get(trans_index)).split('\n') as line_trans}
          <div class={`${get_text_font($viewing_script)}`}>{line_trans}</div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
