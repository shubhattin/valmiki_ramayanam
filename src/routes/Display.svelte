<script lang="ts">
  import { lipi_parivartak } from '@tools/converter';
  import Icon from '@tools/Icon.svelte';
  import { get_possibily_not_undefined, copy_text_to_clipboard } from '@tools/kry';
  import { RiSystemAddLargeLine } from 'svelte-icons-pack/ri';
  import { type Writable } from 'svelte/store';
  import { fade, scale, slide } from 'svelte/transition';
  import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { FiSave } from 'svelte-icons-pack/fi';
  import { BsKeyboard } from 'svelte-icons-pack/bs';
  import { cl_join } from '@tools/cl_join';
  import LipiLekhikA from '@tools/converter';
  import { client } from '@api/client';

  const modal_store = getModalStore();

  export let sarga_data: string[];
  export let loaded_viewing_script: string;
  export let BASE_SCRIPT: string;
  export let loaded_en_trans_data: boolean;
  export let trans_en_data: Map<number, string>;
  export let loaded_lang_trans_data: boolean;
  export let editing_status_on: Writable<boolean>;
  export let trans_lang_data: Writable<Map<number, string>>;
  export let sarga_loading: boolean;
  export let sarga_selected: Writable<number>;
  export let kANDa_selected: Writable<number>;
  export let trans_lang: Writable<string>;

  let edit_language_typer_status = false;
  let enable_copy_to_clipbaord = true;
  let copied_text_status = false;

  let added_translations_indexes: number[] = [];
  let edited_translations_indexes = new Set<number>();

  let transliterated_sarga_data = sarga_data;

  $: transliterated_sarga_data = sarga_data.map((shloka_lines) =>
    lipi_parivartak(shloka_lines, BASE_SCRIPT, loaded_viewing_script)
  );

  $: copied_text_status && setTimeout(() => (copied_text_status = false), 1400);

  const save_data = () => {
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
        (async () => {
          const added_texts = added_indexes.map((index) => $trans_lang_data.get(index)!);
          const edited_texts = edited_indexes.map((index) => $trans_lang_data.get(index)!);

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
            added_translations_indexes = [];
            edited_translations_indexes = new Set();
            $editing_status_on = false;
          }
        })();
      }
    };
    modal_store.trigger(modal_options);
  };
</script>

<div class="flex space-x-2">
  {#if $editing_status_on}
    <SlideToggle
      name="edit_lang"
      active="bg-primary-500"
      class="mt-1 hover:text-gray-500 dark:hover:text-gray-400"
      bind:checked={edit_language_typer_status}
      size="sm"
    >
      <Icon src={BsKeyboard} class="text-4xl" />
    </SlideToggle>
  {/if}
  <!-- <SlideToggle
    name="Copy to Clipboard"
    bind:checked={enable_copy_to_clipbaord}
    active="bg-primary-500"
    size="sm"
  >
    Doudle Click to Copy
  </SlideToggle>
  {/if}
  {#if copied_text_status}
    <span class="cursor-default select-none font-bold text-green-700 dark:text-green-300">
      <Icon src={BsClipboard2Check} />
      Copied to Clipboard
    </span>
  {/if} -->
</div>
{#if $editing_status_on}
  <button
    on:click={save_data}
    in:slide
    out:scale
    class="btn rounded-lg bg-primary-700 px-1 py-1 text-white dark:bg-primary-600"
  >
    <Icon src={FiSave} class="text-2xl" />
    <span>Save</span>
  </button>
{/if}
<div
  class={cl_join(
    'h-[85vh] overflow-scroll rounded-xl border-2 border-gray-400 p-0 dark:border-gray-600',
    loaded_en_trans_data && 'h-[90vh]',
    loaded_lang_trans_data && 'h-[95vh]',
    $editing_status_on && 'h-[100vh]'
  )}
>
  {#if !sarga_loading}
    <div transition:fade={{ duration: 250 }} class="space-y-2">
      {#each transliterated_sarga_data as shloka_lines, i (i)}
        {@const line_split = shloka_lines.split('\n')}
        <!-- with 0 and -1 index -->
        {@const trans_index = sarga_data.length - 1 === i ? -1 : i}
        <div class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
          {#if i !== 0 && i !== sarga_data.length - 1}
            <span class="inline-block align-top text-xs text-gray-500 dark:text-gray-300">{i}</span>
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
                <div>{line_shlk}</div>
              {/each}
            </div>
            {#if loaded_en_trans_data}
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                on:dblclick={() => {
                  if (!enable_copy_to_clipbaord) return;
                  copy_text_to_clipboard(
                    get_possibily_not_undefined(trans_en_data.get(trans_index))
                  );
                  copied_text_status = true;
                }}
                class="text-stone-500 dark:text-slate-400"
              >
                {#if trans_en_data.has(trans_index)}
                  <!-- Usually translations are single but still... -->
                  {#each get_possibily_not_undefined(trans_en_data.get(trans_index)).split('\n') as line_trans}
                    <div>{line_trans}</div>
                  {/each}
                {/if}
              </div>
            {/if}
            {#if $editing_status_on}
              <div transition:slide>
                {#if !$trans_lang_data.has(trans_index)}
                  <button
                    on:click={() => {
                      $trans_lang_data.set(trans_index, '');
                      added_translations_indexes.push(trans_index);
                      $trans_lang_data = $trans_lang_data;
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
                          $trans_lang === 'Hindi' ? 'Sanskrit' : $trans_lang,
                          true,
                          // @ts-ignore
                          (val) => {
                            $trans_lang_data.set(trans_index, val);
                          }
                        );
                      else {
                        $trans_lang_data.set(trans_index, e.currentTarget.value);
                      }
                      $trans_lang_data = $trans_lang_data;
                    }}
                    class="textarea h-16 w-full"
                    value={$trans_lang_data.get(trans_index)}
                  ></textarea>
                {/if}
              </div>
            {:else if loaded_lang_trans_data}
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                on:dblclick={() => {
                  if (!enable_copy_to_clipbaord) return;
                  copy_text_to_clipboard(
                    get_possibily_not_undefined($trans_lang_data.get(trans_index))
                  );
                  copied_text_status = true;
                }}
                class="text-yellow-700 dark:text-yellow-500"
              >
                {#if $trans_lang_data.has(trans_index)}
                  <!-- Usually translations are single but still... -->
                  {#each get_possibily_not_undefined($trans_lang_data.get(trans_index)).split('\n') as line_trans}
                    <div>{line_trans}</div>
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
