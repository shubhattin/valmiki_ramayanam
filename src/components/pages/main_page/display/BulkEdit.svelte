<script lang="ts">
  import { Accordion, AccordionItem, getModalStore } from '@skeletonlabs/skeleton';
  import { TrOutlineHelpSquare } from 'svelte-icons-pack/tr';
  import Icon from '~/tools/Icon.svelte';
  import {
    sarga_selected,
    kANDa_selected,
    trans_lang,
    sanskrit_mode,
    edit_language_typer_status,
    added_translations_indexes,
    edited_translations_indexes
  } from '~/state/main_page/main_state';
  import {
    trans_en_data,
    trans_lang_data,
    english_edit_status,
    rAmAyaNam_map,
    bulk_text_edit_status,
    bulk_text_data,
    trans_lang_data_query_key,
    QUERY_KEYS
  } from '~/state/main_page/data';
  import { trans_map_to_text, text_to_trans_map } from './trans_bulk_funcs';
  import { get_font_family_and_size } from '~/tools/font_tools';
  import type { lang_list_type } from '~/tools/lang_list';
  import { lekhika_typing_tool } from '~/tools/converter';
  import { OiSync16 } from 'svelte-icons-pack/oi';
  import { useQueryClient } from '@tanstack/svelte-query';

  const query_client = useQueryClient();
  const modal_store = getModalStore();

  let { tab_edit_name = $bindable() }: { tab_edit_name: 'main' | 'bulk' } = $props();

  let kANDa_info = $derived(rAmAyaNam_map[$kANDa_selected - 1]);
  let sarga_info = $derived(kANDa_info.sarga_data[$sarga_selected - 1]);
  let shloka_count = $derived(sarga_info.shloka_count_extracted);

  let trans_text_font_info = $derived(
    $english_edit_status
      ? get_font_family_and_size('English')
      : get_font_family_and_size($trans_lang as lang_list_type)
  );
  $effect(() => {
    if (!$bulk_text_edit_status) {
      $bulk_text_data = trans_map_to_text(
        $english_edit_status ? $trans_en_data.data! : $trans_lang_data.data!,
        shloka_count
      );
    }
  });

  const input_func = async (e: any) => {
    let callback_function_called_from_lipi_lekhika = false;
    if ($edit_language_typer_status && !$english_edit_status)
      await lekhika_typing_tool(
        e.target,
        // @ts-ignore
        e.data,
        $trans_lang,
        true,
        // @ts-ignore
        (val) => {
          $bulk_text_data = val;
          // update_trans_lang_data(trans_index, val);
          callback_function_called_from_lipi_lekhika = true;
        },
        $sanskrit_mode as 0 | 1
      );
    if (!callback_function_called_from_lipi_lekhika) {
      $bulk_text_data = e.target.value;
    }
  };

  const sync_text_data_to_main = () => {
    const on_confirm = async () => {
      const trans_text_map = text_to_trans_map($bulk_text_data, shloka_count);
      const trans_data = new Map(
        $english_edit_status ? $trans_en_data.data! : $trans_lang_data.data!
      );
      trans_text_map.forEach((text, index) => {
        const prev_text = trans_data.get(index)!;
        if (!trans_data.has(index)) $added_translations_indexes.push(index);
        else if (
          prev_text != text &&
          !(
            prev_text.substring(0, prev_text.length - 1) === text &&
            prev_text[prev_text.length - 1] === '\n'
          ) // if the text is the same but ends with a new line, then ignore
        ) {
          $edited_translations_indexes.add(index);
          // console.log([index, prev_text, text]);
        }
        trans_data.set(index, text);
      });
      $added_translations_indexes = $added_translations_indexes;
      $edited_translations_indexes = $edited_translations_indexes;
      // updating query data
      if (!$english_edit_status) {
        await query_client.setQueryData($trans_lang_data_query_key, trans_data);
      } else {
        await query_client.setQueryData(
          QUERY_KEYS.trans_lang_data('English', $kANDa_selected, $sarga_selected),
          trans_data
        );
      }
      $bulk_text_edit_status = false;
      tab_edit_name = 'main';
    };
    modal_store.trigger({
      type: 'confirm',
      title: 'Sure to sync the text to Main Tab ?',
      body:
        'This will write the shloka contents to the main tab text which can then be verified and saved from there' +
        '\nAlso be sure to verify if there was distortion of any sorts, it sometimes adds spaces or new lines on its own. ' +
        'If you are adding to an empty non translated shloka it should be fine.',
      response: (r: boolean) => {
        if (r) on_confirm();
      }
    });
  };
</script>

<Accordion>
  <AccordionItem open={false}>
    <svelte:fragment slot="lead">
      <Icon src={TrOutlineHelpSquare} class="-m-1.5  -mt-2 text-2xl" />
    </svelte:fragment>
    <span slot="summary" class="text-base font-bold">Instructions</span>
    <svelte:fragment slot="content">
      <ul class="list-disc">
        <li>Each shloka should be separated by two or more blank lines</li>
        <li>
          <strong>Format 1</strong>
          <ul class="list-option rounded-lg">
            <li>
              Shloka number can be indicated in either <code>{`{num}. {text}`}</code> or
              <code>{`{num}: {text}`}</code> format.
            </li>
            <li>
              Three or more <code>-(dashes)</code> will make the shloka being ignored or marked as non
              existent.
            </li>
            <li>You are free to place shlokas in any order in this format.</li>
          </ul>
        </li>
        <li>
          <strong>Format 2</strong>
          <ul class="list-option rounded-lg">
            <li>
              If shlokas have missing index markers then they will be interpreted in the usual
              order, i.e. 0, 1, 2 to last and -1.
            </li>
            <li>Shlokas have to be strictly in the same order and number.</li>
          </ul>
        </li>
        <li>Avoid using it for single or minor changes.</li>
      </ul>
    </svelte:fragment>
  </AccordionItem>
</Accordion>

<div class="mt-3 p-1">
  {#if !$bulk_text_edit_status}
    <div class="text-xs italic">Start Editing Text here...</div>
  {:else}
    {@const trans_map = text_to_trans_map($bulk_text_data, shloka_count)}
    <div class="space-x-2">
      <button
        class="btn rounded-lg bg-tertiary-700 px-1 py-1 font-bold text-white dark:bg-tertiary-600"
        onclick={sync_text_data_to_main}
      >
        <Icon src={OiSync16} class="-my-1 mr-1 text-lg" />
        Sync to Main
      </button>
      <span class="text-xs font-bold">Shlokas Found: {trans_map.size}</span>
      <span class="text-xs font-semibold">Total Shlokas: {shloka_count + 2}</span>
    </div>
  {/if}
</div>

<textarea
  style:font-size={`${trans_text_font_info.size}rem`}
  style:font-family={trans_text_font_info.family}
  class="textarea mt-2.5 h-[60vh]"
  value={$bulk_text_data}
  oninput={(e) => ($bulk_text_edit_status = true) && input_func(e)}
></textarea>

<style lang="postcss">
  code {
    @apply text-xs;
  }
</style>
