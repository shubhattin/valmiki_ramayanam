<script lang="ts">
  import { lipi_parivartak_async } from '~/tools/converter';
  import { type Unsubscriber } from 'svelte/store';
  import { fade, scale, slide } from 'svelte/transition';
  import { cl_join } from '~/tools/cl_join';
  import { onDestroy } from 'svelte';
  import {
    editing_status_on,
    BASE_SCRIPT,
    viewing_script,
    trans_lang,
    typing_assistance_modal_opened
  } from '~/state/main_page/main_state';
  import {
    sarga_data,
    trans_en_data,
    trans_lang_data,
    trans_lang_data_query_key
  } from '~/state/main_page/data';
  import SaveEdit from './SaveEdit.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';
  import Icon from '~/tools/Icon.svelte';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';
  import ShlokaDisplay from './ShlokaDisplay.svelte';
  import { copy_text_to_clipboard } from '~/tools/kry';
  import { OiCopy16 } from 'svelte-icons-pack/oi';

  const query_client = useQueryClient();
  const unsubscribers: Unsubscriber[] = [];

  let transliterated_sarga_data: string[] = [];
  $: Promise.all(
    ($sarga_data.data ?? []).map((shloka_lines) =>
      lipi_parivartak_async(shloka_lines, BASE_SCRIPT, $viewing_script)
    )
  ).then((data) => {
    transliterated_sarga_data = data;
  });

  onDestroy(() => {
    unsubscribers.forEach((unsub) => unsub());
  });

  async function update_trans_lang_data(index: number, text: string) {
    const new_data = new Map($trans_lang_data.data);
    new_data.set(index, text);
    await query_client.setQueryData($trans_lang_data_query_key, new_data);
  }
  // clipboard related
  let enable_copy_to_clipbaord = true;
  let copied_text_status = false;
  $: copied_text_status && setTimeout(() => (copied_text_status = false), 1400);
  const copy_text = (text: string) => {
    if (!enable_copy_to_clipbaord) return;
    copy_text_to_clipboard(text);
    copied_text_status = true;
  };

  let sarga_hovered = false;

  const copy_sarga = () => {
    copy_text(transliterated_sarga_data.join('\n\n'));
  };
</script>

{#if $editing_status_on}
  <SaveEdit />
{/if}
{#if copied_text_status}
  <div
    class="fixed bottom-2 right-2 z-50 cursor-default select-none font-bold text-green-700 dark:text-green-300"
  >
    <Icon src={BsClipboard2Check} />
    Copied to Clipboard
  </div>
{/if}
<div class="relative w-full">
  {#if sarga_hovered}
    <button
      transition:fade={{ duration: 150 }}
      title="Copy Sarga Text"
      on:click={copy_sarga}
      class={cl_join('btn absolute right-5 top-2 z-20 select-none p-0 outline-none')}
      on:mouseenter={() => (sarga_hovered = true)}
    >
      <Icon src={OiCopy16} class="text-lg" />
    </button>
  {/if}
</div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class={cl_join(
    'h-[85vh] overflow-scroll rounded-xl border-2 border-gray-400 p-0 dark:border-gray-600',
    $trans_en_data.isSuccess && 'h-[90vh]',
    $trans_lang_data.isSuccess && 'h-[95vh]',
    $editing_status_on && 'h-[100vh]'
  )}
  on:mouseenter={() => (sarga_hovered = true)}
  on:mouseleave={() => (sarga_hovered = false)}
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
            <ShlokaDisplay {trans_index} {shloka_lines} {update_trans_lang_data} {copy_text} />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if $typing_assistance_modal_opened}
  {#await import('~/components/TypingAssistance.svelte') then TypingAssistance}
    <TypingAssistance.default
      sync_lang_script={trans_lang}
      modal_opended={typing_assistance_modal_opened}
    />
  {/await}
{/if}
