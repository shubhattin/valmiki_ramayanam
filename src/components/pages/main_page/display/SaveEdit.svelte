<script lang="ts">
  import { createMutation, useQueryClient } from '@tanstack/svelte-query';
  import {
    sarga_selected,
    kANDa_selected,
    trans_lang,
    editing_status_on,
    added_translations_indexes,
    edited_translations_indexes
  } from '~/state/main_page/main_state';
  import { trans_lang_data, trans_lang_data_query_key } from '~/state/main_page/data';
  import { delay } from '~/tools/delay';
  import { client } from '~/api/client';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import { scale, slide } from 'svelte/transition';
  import { FiSave } from 'svelte-icons-pack/fi';
  import Icon from '~/tools/Icon.svelte';
  import { AiOutlineClose } from 'svelte-icons-pack/ai';

  const query_client = useQueryClient();
  const modal_store = getModalStore();

  const save_data = createMutation({
    mutationKey: ['sarga', 'save_edited_data'],
    mutationFn: async ({
      added_indexes,
      edited_indexes
    }: {
      added_indexes: number[];
      edited_indexes: number[];
    }) => {
      if (!$trans_lang_data.isSuccess) return;
      await delay(500);
      const added_texts = added_indexes.map((index) => $trans_lang_data.data?.get(index)!);
      const edited_texts = edited_indexes.map((index) => $trans_lang_data.data?.get(index)!);
      const res = await client.translations.edit_translation.mutate({
        data: {
          add_data: added_texts,
          edit_data: edited_texts,
          to_add_indexed: added_indexes,
          to_edit_indexed: edited_indexes
        },
        sarga_num: $sarga_selected,
        kANDa_num: $kANDa_selected,
        lang: $trans_lang
      });
      if (res.success) {
        $added_translations_indexes = [];
        $edited_translations_indexes = new Set();
        $editing_status_on = false;
      }
    }
  });
  const save_data_func = () => {
    if ($edited_translations_indexes.size + $added_translations_indexes.length === 0) return;
    const added_indexes = $added_translations_indexes.map((index) => index);
    const edited_indexes = Array.from($edited_translations_indexes).map((index) => index);
    const modal_options: ModalSettings = {
      title: 'Sure to save Changes ?',
      type: 'confirm',
      body: `Edits ➔ ${edited_indexes.length} ${edited_indexes.length > 0 ? '{ ' + edited_indexes.join(', ') + ' }' : ''}
      <br/>Additions ➔ ${added_indexes.length} ${added_indexes.length > 0 ? '{ ' + added_indexes.join(', ') + ' }' : ''}`,
      response(r: boolean) {
        if (!r) return;
        $save_data.mutate({ added_indexes, edited_indexes });
      }
    };
    modal_store.trigger(modal_options);
  };

  const cancel_edit_data = createMutation({
    mutationKey: ['sarga', 'cancel_edit_data'],
    mutationFn: async () => {
      if (!$trans_lang_data.isSuccess) return;
      await delay(500);
      await query_client.invalidateQueries({ queryKey: $trans_lang_data_query_key });
      $added_translations_indexes = [];
      $edited_translations_indexes = new Set();
      $editing_status_on = false;
      // ^ reset the data
    }
  });
  const cancel_edit_func = () => {
    if ($edited_translations_indexes.size + $added_translations_indexes.length === 0) {
      $cancel_edit_data.mutate();
      return;
    }
    const added_indexes = $added_translations_indexes.map((index) => index);
    const edited_indexes = Array.from($edited_translations_indexes).map((index) => index);
    const modal_options: ModalSettings = {
      title: 'Sure to discard Changes ?',
      type: 'confirm',
      body: `Edits ➔ ${edited_indexes.length} ${edited_indexes.length > 0 ? '{ ' + edited_indexes.join(', ') + ' }' : ''}
      <br/>Additions ➔ ${added_indexes.length} ${added_indexes.length > 0 ? '{ ' + added_indexes.join(', ') + ' }' : ''}`,
      response(r: boolean) {
        if (!r) return;
        $cancel_edit_data.mutate();
      }
    };
    modal_store.trigger(modal_options);
  };
</script>

<button
  on:click={save_data_func}
  in:slide
  out:scale
  disabled={$save_data.isPending}
  class="btn rounded-lg bg-primary-700 px-1 py-1 text-white dark:bg-primary-600"
>
  <Icon src={FiSave} class="text-2xl" />
  <span>Save</span>
</button>
<button
  on:click={cancel_edit_func}
  in:slide
  out:scale
  disabled={$cancel_edit_data.isPending}
  class="btn ml-3 rounded-lg bg-error-700 px-1 py-1 text-white dark:bg-error-600"
>
  <Icon src={AiOutlineClose} class="text-2xl" />
  <span>Cancel</span>
</button>
