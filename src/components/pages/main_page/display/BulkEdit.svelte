<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import { TrOutlineHelpSquare } from 'svelte-icons-pack/tr';
  import Icon from '~/tools/Icon.svelte';
  import { sarga_selected, kANDa_selected, trans_lang } from '~/state/main_page/main_state';
  import {
    trans_en_data,
    trans_lang_data,
    english_edit_status,
    rAmAyaNam_map
  } from '~/state/main_page/data';
  import { trans_map_to_text } from './trans_bulk_funcs';
  import { get_font_family_and_size } from '~/tools/font_tools';
  import type { lang_list_type } from '~/tools/lang_list';

  let kANDa_info = $derived(rAmAyaNam_map[$kANDa_selected - 1]);
  let sarga_info = $derived(kANDa_info.sarga_data[$sarga_selected - 1]);
  let shloka_count = $derived(sarga_info.shloka_count_extracted);

  let trans_text_font_info = $derived(
    $english_edit_status
      ? get_font_family_and_size('English')
      : get_font_family_and_size($trans_lang as lang_list_type)
  );
  let text_data = $state('');
  $effect(() => {
    text_data = trans_map_to_text(
      $english_edit_status ? $trans_en_data.data! : $trans_lang_data.data!,
      shloka_count
    );
  });
</script>

<Accordion>
  <AccordionItem open={false}>
    <svelte:fragment slot="lead">
      <Icon src={TrOutlineHelpSquare} class="-m-1.5  -mt-2 text-2xl" />
    </svelte:fragment>
    <span slot="summary" class="text-lg font-bold">Help</span>
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
      </ul>
    </svelte:fragment>
  </AccordionItem>
</Accordion>

<textarea
  style:font-size={`${trans_text_font_info.size}rem`}
  style:font-family={trans_text_font_info.family}
  class="textarea mt-3 h-[60vh] p-2"
  bind:value={text_data}
></textarea>

<style lang="scss">
  code {
    @apply text-xs;
  }
</style>
