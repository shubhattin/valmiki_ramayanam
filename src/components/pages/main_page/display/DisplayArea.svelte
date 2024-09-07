<script lang="ts">
  import { lipi_parivartak_async } from '@tools/converter';
  import Icon from '@tools/Icon.svelte';
  import { writable, type Unsubscriber, type Writable } from 'svelte/store';
  import { fade, scale, slide } from 'svelte/transition';
  import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { FiSave } from 'svelte-icons-pack/fi';
  import { BsKeyboard } from 'svelte-icons-pack/bs';
  import { cl_join } from '@tools/cl_join';
  import LipiLekhikA from '@tools/converter';
  import { client_raw } from '@api/client';
  import { browser } from '$app/environment';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { delay } from '@tools/delay';
  import { AiOutlineClose } from 'svelte-icons-pack/ai';
  import { onDestroy, onMount } from 'svelte';
  import { BiHelpCircle } from 'svelte-icons-pack/bi';
  import Modal from '@components/Modal.svelte';
  import { CgClose } from 'svelte-icons-pack/cg';
  import { ALL_LANG_SCRIPT_LIST } from '@tools/lang_list';
  import TextDisplay from './ShlokaDisplay.svelte';
  import {
    kANDa_selected,
    sarga_selected,
    editing_status_on,
    BASE_SCRIPT,
    viewing_script,
    trans_lang,
    sanskrit_mode,
    added_translations_indexes,
    edit_language_typer_status,
    edited_translations_indexes
  } from '@state/main_page/main_state';
  import {
    sarga_data,
    trans_en_data,
    trans_lang_data_query_key,
    trans_lang_data
  } from '@state/main_page/data';

  const query_client = useQueryClient();
  const modal_store = getModalStore();
  const unsubscribers: Unsubscriber[] = [];

  let transliterated_sarga_data: string[] = [];
  $: Promise.all(
    ($sarga_data.data ?? []).map((shloka_lines) =>
      lipi_parivartak_async(shloka_lines, BASE_SCRIPT, $viewing_script)
    )
  ).then((data) => {
    transliterated_sarga_data = data;
  });

  let typing_assistance_modal_opened = writable(false);
  $: typing_assistance_lang = $trans_lang;

  $: sanskrit_mode_texts = createQuery({
    queryKey: ['sanskrit_mode_texts'],
    enabled: browser && $editing_status_on && $trans_lang !== '--',
    queryFn: () =>
      Promise.all(
        ['राम्', 'राम'].map((text) => lipi_parivartak_async(text, BASE_SCRIPT, $trans_lang))
      ),
    placeholderData: ['राम्', 'राम']
  });
  onMount(() => {
    unsubscribers.push(
      sanskrit_mode_texts.subscribe(({ isFetching, isSuccess }) => {
        if (!$editing_status_on || isFetching || !isSuccess) return;
        const lng = LipiLekhikA.k.normalize($trans_lang);
        $sanskrit_mode = (LipiLekhikA.k.akSharAH as any)[lng].sa;
      })
    );
  });

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

  $: cancel_edit_data = createMutation({
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

  onDestroy(() => {
    unsubscribers.forEach((unsub) => unsub());
  });
  // const URLS = import.meta.glob('/src/tools/converter/resources/images/*.png', {
  //   eager: true,
  //   query: '?url'
  // });
</script>

<Modal modal_open={typing_assistance_modal_opened}>
  <div
    in:fade
    out:scale
    class="h-11/12 fixed left-2 top-2 z-10 block max-h-[94%] min-h-[87%] w-11/12 overflow-scroll rounded-lg border-2 border-blue-700 bg-[aliceblue] pl-2 pt-2 dark:border-blue-500 dark:bg-slate-800"
  >
    <div class="flex justify-between">
      <select class="select w-40" bind:value={typing_assistance_lang}>
        {#each ALL_LANG_SCRIPT_LIST as lang_script}
          <option value={lang_script}>{lang_script}</option>
        {/each}
      </select>
      <button
        on:click={() => {
          $typing_assistance_modal_opened = false;
        }}
      >
        <Icon
          src={CgClose}
          class="cursor-button text-4xl text-red-500 active:text-black dark:text-red-400 dark:active:text-white"
        />
      </button>
    </div>
    <div class="mt-4 space-y-4">
      <!-- <img
        class="h-3/4 max-h-[70-vh]"
        alt={typing_assistance_lang}
        src={URLS[`/src/tools/converter/resources/images/${typing_assistance_lang}.png`].default}
      /> -->
    </div>
  </div>
</Modal>
<div class="flex space-x-4">
  {#if $editing_status_on}
    <SlideToggle
      name="edit_lang"
      active="bg-primary-500"
      class="hover:text-gray-500 dark:hover:text-gray-400"
      bind:checked={$edit_language_typer_status}
      size="sm"
    >
      <Icon src={BsKeyboard} class="text-4xl" />
    </SlideToggle>
    {#if $edit_language_typer_status && $sanskrit_mode_texts.isSuccess && !$sanskrit_mode_texts.isFetching}
      <select
        transition:scale
        bind:value={$sanskrit_mode}
        class="select m-0 w-28 text-clip px-1 py-1 text-sm"
      >
        <option value={1}>rAm ➔ {$sanskrit_mode_texts.data[0]}</option>
        <option value={0}>rAm ➔ {$sanskrit_mode_texts.data[1]}</option>
      </select>
    {/if}
    <button
      class="btn rounded-md p-0 text-sm"
      title={'Language Typing Assistance'}
      on:click={() => ($typing_assistance_modal_opened = true)}
    >
      <Icon src={BiHelpCircle} class="mt-1 text-3xl text-sky-500 dark:text-sky-400" />
    </button>
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
  {#if !$sarga_data.isFetching}
    <div transition:fade={{ duration: 250 }} class="space-y-[0.15rem]">
      {#each transliterated_sarga_data as shloka_lines, i (i)}
        <!-- with 0 and -1 index -->
        {@const trans_index = transliterated_sarga_data.length - 1 === i ? -1 : i}
        <div class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
          <div class="flex space-x-2">
            {#if i !== 0 && i !== transliterated_sarga_data.length - 1}
              <div
                class="flex select-none items-center align-top text-[0.75rem] leading-[1.5rem] text-gray-500 dark:text-gray-300"
              >
                {i}
              </div>
            {/if}
            <div class="mt-0 w-full space-y-1">
              <TextDisplay
                {...{
                  shloka_lines,
                  trans_index
                }}
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
