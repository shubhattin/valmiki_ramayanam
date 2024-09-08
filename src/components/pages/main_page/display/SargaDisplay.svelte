<script lang="ts">
  import LipiLekhikA, { lipi_parivartak_async } from '@tools/converter';
  import { type Unsubscriber } from 'svelte/store';
  import { fade, slide } from 'svelte/transition';
  import { cl_join } from '@tools/cl_join';
  import { onDestroy } from 'svelte';
  import {
    editing_status_on,
    BASE_SCRIPT,
    viewing_script,
    trans_lang,
    sanskrit_mode,
    added_translations_indexes,
    edit_language_typer_status,
    edited_translations_indexes,
    typing_assistance_modal_opened
  } from '@state/main_page/main_state';
  import {
    sarga_data,
    trans_en_data,
    trans_lang_data,
    trans_lang_data_query_key
  } from '@state/main_page/data';
  import SaveEdit from './SaveEdit.svelte';
  import TypingAssistance from '../../../TypingAssistance.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { Icon } from 'svelte-icons-pack';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';
  import { copy_text_to_clipboard, get_possibily_not_undefined } from '@tools/kry';
  import { RiSystemAddLargeLine } from 'svelte-icons-pack/ri';

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
        {@const line_split = shloka_lines.split('\n')}
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
                        $added_translations_indexes.push(trans_index);
                      }}
                      class="btn m-0 rounded-md bg-surface-500 p-1 font-bold text-white dark:bg-surface-500"
                    >
                      <Icon src={RiSystemAddLargeLine} />
                    </button>
                  {:else}
                    <textarea
                      on:input={(e) => {
                        if (!$added_translations_indexes.includes(trans_index))
                          $edited_translations_indexes.add(trans_index);
                        if ($edit_language_typer_status)
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
        </div>
      {/each}
    </div>
  {/if}
</div>

<TypingAssistance sync_lang_script={trans_lang} modal_opended={typing_assistance_modal_opened} />
