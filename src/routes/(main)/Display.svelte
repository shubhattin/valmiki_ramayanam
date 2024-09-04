<script lang="ts">
  import { lipi_parivartak_async } from '@tools/converter';
  import Icon from '@tools/Icon.svelte';
  import { get_possibily_not_undefined, copy_text_to_clipboard } from '@tools/kry';
  import { RiSystemAddLargeLine } from 'svelte-icons-pack/ri';
  import { type Writable } from 'svelte/store';
  import { fade, scale, slide } from 'svelte/transition';
  import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { FiSave } from 'svelte-icons-pack/fi';
  import { BsClipboard2Check, BsKeyboard } from 'svelte-icons-pack/bs';
  import { cl_join } from '@tools/cl_join';
  import LipiLekhikA from '@tools/converter';
  import { client_raw } from '@api/client';
  import { browser } from '$app/environment';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { delay } from '@tools/delay';
  import { AiOutlineClose } from 'svelte-icons-pack/ai';

  const query_client = useQueryClient();
  const modal_store = getModalStore();

  const QUERY_KEYS = {
    trans_lang_data: (lang: string, kANDa_num: number, sarga_num: number) => [
      'sarga',
      'trans',
      lang,
      kANDa_num,
      sarga_num
    ]
  };

  export let viewing_script: string;
  export let BASE_SCRIPT: string;
  export let view_translation_status: boolean;
  export let editing_status_on: Writable<boolean>;
  export let sarga_selected: Writable<number>;
  export let kANDa_selected: Writable<number>;
  export let trans_lang: Writable<string>;

  $: sarga_data = createQuery({
    queryKey: ['sarga', 'main_dev_text', $kANDa_selected, $sarga_selected],
    enabled: browser && $kANDa_selected !== 0 && $sarga_selected !== 0,
    placeholderData: [],
    queryFn: async () => {
      if (!browser) return [];
      const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
      const data = (
        (await all_sargas[`/data/ramayan/data/${$kANDa_selected}/${$sarga_selected}.json`]()) as any
      ).default as string[];
      await delay(350);
      return data;
    }
  });
  let transliterated_sarga_data: string[] = [];
  $: Promise.all(
    ($sarga_data.data ?? []).map((shloka_lines) =>
      lipi_parivartak_async(shloka_lines, BASE_SCRIPT, viewing_script)
    )
  ).then((data) => {
    transliterated_sarga_data = data;
  });

  $: trans_en_data = createQuery({
    queryKey: QUERY_KEYS.trans_lang_data('English', $kANDa_selected, $sarga_selected),
    // by also adding the kanda and sarga they are auto invalidated
    // so we dont have to manually invalidate it if were only sarga,trans,English
    enabled: browser && view_translation_status && $kANDa_selected !== 0 && $sarga_selected !== 0,
    queryFn: () => load_english_translation($kANDa_selected, $sarga_selected)
  });

  $: trans_en_data_query_key = QUERY_KEYS.trans_lang_data(
    $trans_lang,
    $kANDa_selected,
    $sarga_selected
  );
  $: trans_lang_data = createQuery({
    queryKey: trans_en_data_query_key,
    enabled: browser && $trans_lang !== '--' && $kANDa_selected !== 0 && $sarga_selected !== 0,
    ...($editing_status_on
      ? {
          staleTime: Infinity
          // while editing the data should not go stale, else it would refetch lead to data loss
        }
      : {}),
    queryFn: async () => {
      const data = await client_raw.translations.get_translations_per_sarga.query({
        lang: $trans_lang,
        kANDa_num: $kANDa_selected,
        sarga_num: $sarga_selected
      });
      const data_map = new Map<number, string>();
      for (let val of data) {
        // we dont need to manually care abouy 0 or -1, it will be handled while making changes
        data_map.set(val.shloka_num, val.text);
      }
      return data_map;
    }
  });
  async function update_trans_data(index: number, text: string) {
    const new_data = new Map($trans_lang_data.data);
    new_data.set(index, text);
    await query_client.setQueryData(trans_en_data_query_key, new_data);
  }

  let edit_language_typer_status = true;
  let enable_copy_to_clipbaord = true;
  let copied_text_status = false;

  let added_translations_indexes: number[] = [];
  let edited_translations_indexes = new Set<number>();

  let sanskrit_mode_texts: string[];
  let sanskrit_mode: number;

  const load_english_translation = async (kANDa_num: number, sarga_number: number) => {
    await delay(250);
    let data: Record<number, string> = {};
    const data_map = new Map<number, string>();
    if (import.meta.env.DEV) {
      const yaml = (await import('js-yaml')).default;
      const glob_yaml = import.meta.glob('/data/ramayan/trans_en/*/*.yaml', {
        query: '?raw'
      });
      if (!(`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml` in glob_yaml))
        return data_map;
      const text = (
        (await glob_yaml[`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml`]()) as any
      ).default as string;
      data = yaml.load(text) as Record<number, string>;
    } else {
      const glob_json = import.meta.glob('/data/ramayan/trans_en/json/*/*.json');
      if (!(`/data/ramayan/trans_en/json/${kANDa_num}/${sarga_number}.json` in glob_json))
        return data_map;
      data = (
        (await glob_json[`/data/ramayan/trans_en/json/${kANDa_num}/${sarga_number}.json`]()) as any
      ).default as Record<number, string>;
    }

    for (const [key, value] of Object.entries(data)) {
      data_map.set(Number(key), value.replaceAll(/\n$/g, '')); // replace the ending newline
    }
    return data_map;
  };

  $: browser &&
    $trans_lang !== '--' &&
    (async () => {
      sanskrit_mode_texts = await Promise.all(
        ['राम्', 'राम'].map((text) => lipi_parivartak_async(text, BASE_SCRIPT, $trans_lang))
      );
      const lng = LipiLekhikA.k.normalize($trans_lang);
      sanskrit_mode = (LipiLekhikA.k.akSharAH as any)[lng].sa;
    })();

  $: copied_text_status && setTimeout(() => (copied_text_status = false), 1400);

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
      const res = await client_raw.translations.edit_translation.mutate({
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
        added_translations_indexes = [];
        edited_translations_indexes = new Set();
        $editing_status_on = false;
      }
    }
  });
  const save_data_func = () => {
    if (edited_translations_indexes.size + added_translations_indexes.length === 0) return;
    const added_indexes = added_translations_indexes.map((index) => index);
    const edited_indexes = Array.from(edited_translations_indexes).map((index) => index);
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

  $: cancel_edit_data = createMutation({
    mutationKey: ['sarga', 'cancel_edit_data'],
    mutationFn: async () => {
      if (!$trans_lang_data.isSuccess) return;
      await delay(500);
      await query_client.invalidateQueries({ queryKey: trans_en_data_query_key });
      $editing_status_on = false;
      // ^ reset the data
    }
  });
  const cancel_edit_func = () => {
    if (edited_translations_indexes.size + added_translations_indexes.length === 0) {
      $cancel_edit_data.mutate();
      return;
    }
    const added_indexes = added_translations_indexes.map((index) => index);
    const edited_indexes = Array.from(edited_translations_indexes).map((index) => index);
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

<div class="flex space-x-4">
  {#if $editing_status_on}
    <SlideToggle
      name="edit_lang"
      active="bg-primary-500"
      class="hover:text-gray-500 dark:hover:text-gray-400"
      bind:checked={edit_language_typer_status}
      size="sm"
    >
      <Icon src={BsKeyboard} class="text-4xl" />
    </SlideToggle>
    {#if edit_language_typer_status}
      <select
        transition:scale
        bind:value={sanskrit_mode}
        class="select m-0 w-28 text-clip px-1 py-1 text-sm"
      >
        <option value={1}>rAm ➔ {sanskrit_mode_texts[0]}</option>
        <option value={0}>rAm ➔ {sanskrit_mode_texts[1]}</option>
      </select>
    {/if}
  {/if}
  {#if copied_text_status}
    <span
      class="fixed bottom-2 right-2 z-50 cursor-default select-none font-bold text-green-700 dark:text-green-300"
    >
      <Icon src={BsClipboard2Check} />
      Copied to Clipboard
    </span>
  {/if}
</div>
{#if $editing_status_on}
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
{/if}
<div
  class={cl_join(
    'h-[85vh] overflow-scroll rounded-xl border-2 border-gray-400 p-0 dark:border-gray-600',
    $trans_en_data.isSuccess && 'h-[90vh]',
    $trans_lang_data.isSuccess && 'h-[95vh]',
    $editing_status_on && 'h-[100vh]'
  )}
>
  {#if !$sarga_data.isLoading}
    <div transition:fade={{ duration: 250 }} class="space-y-[0.2rem]">
      {#each transliterated_sarga_data as shloka_lines, i (i)}
        {@const line_split = shloka_lines.split('\n')}
        <!-- with 0 and -1 index -->
        {@const trans_index = transliterated_sarga_data.length - 1 === i ? -1 : i}
        <div class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
          {#if i !== 0 && i !== transliterated_sarga_data.length - 1}
            <span
              class="inline-block select-none align-top text-[0.75rem] leading-[1.5rem] text-gray-500 dark:text-gray-300"
              >{i}</span
            >
          {/if}
          <div class="mt-0 space-y-1">
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
                  copy_text_to_clipboard(
                    get_possibily_not_undefined($trans_en_data.data.get(trans_index))
                  );
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
                          sanskrit_mode
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
                  copy_text_to_clipboard(
                    get_possibily_not_undefined($trans_lang_data.data?.get(trans_index))
                  );
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
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .font {
    font-family: 'Nirmala UI', sans-serif;
  }
</style>
