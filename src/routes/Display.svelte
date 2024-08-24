<script lang="ts">
  import { lipi_parivartak } from '@tools/converter';
  import Icon from '@tools/Icon.svelte';
  import { get_possibily_not_undefined, copy_text_to_clipboard } from '@tools/kry';
  import { RiSystemAddLargeLine } from 'svelte-icons-pack/ri';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import type { Writable } from 'svelte/store';
  import { fade, scale, slide } from 'svelte/transition';
  import ramayan_map_type from '@data/ramayan/ramayan_map.json';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { FiSave } from 'svelte-icons-pack/fi';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';

  export let sarga_data: string[];
  export let loaded_viewing_script: string;
  export let BASE_SCRIPT: string;
  export let loaded_en_trans_data: boolean;
  export let trans_en_data: Map<number, string>;
  export let loaded_lang_trans_data: boolean;
  export let editing_status_on: boolean;
  export let trans_lang_data: Map<number, string>;
  export let sarga_loading: boolean;
  export let sarga_selected: Writable<number>;
  export let kANDa: (typeof ramayan_map_type)[0];

  let enable_copy_to_clipbaord = true;
  let copied_text_status = false;

  $: copied_text_status && setTimeout(() => (copied_text_status = false), 1400);
</script>

<div class="space-x-3">
  {#if $sarga_selected !== 1}
    <button
      on:click={() => ($sarga_selected -= 1)}
      in:scale
      out:slide
      disabled={editing_status_on}
      class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
    >
      <Icon class="-mt-1 mr-1 text-xl" src={TiArrowBackOutline} />
      Previous
    </button>
  {/if}
  {#if $sarga_selected !== kANDa.sarga_data.length}
    <button
      on:click={() => ($sarga_selected += 1)}
      in:scale
      out:slide
      disabled={editing_status_on}
      class="btn rounded-lg bg-tertiary-700 px-2 py-1 font-bold text-white"
    >
      Next
      <Icon class="-mt-1 ml-1 text-xl" src={TiArrowForwardOutline} />
    </button>
  {/if}
</div>
<div class="flex space-x-4">
  <SlideToggle
    name="Copy to Clipboard"
    bind:checked={enable_copy_to_clipbaord}
    active="bg-primary-500"
    size="sm"
  >
    Doudle Click to Copy
  </SlideToggle>
  {#if copied_text_status}
    <span class="cursor-default select-none font-bold text-green-700 dark:text-green-300">
      <Icon src={BsClipboard2Check} />
      Copied to Clipboard
    </span>
  {/if}
</div>
{#if editing_status_on}
  <button
    in:slide
    out:scale
    class="btn rounded-lg bg-primary-700 px-1 py-1 text-white dark:bg-primary-600"
  >
    <Icon src={FiSave} class="text-2xl" />
    <span>Save</span>
  </button>
{/if}
<div class="h-[65vh] overflow-scroll rounded-xl border-2 border-gray-400 p-0 dark:border-gray-600">
  {#if !sarga_loading}
    <div transition:fade={{ duration: 250 }}>
      {#each sarga_data as shloka_lines, i}
        {@const line_transliterated = lipi_parivartak(
          shloka_lines,
          BASE_SCRIPT,
          loaded_viewing_script
        )}
        {@const line_split = line_transliterated.split('\n')}
        <div class="rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
          {#if i !== 0 && i !== sarga_data.length - 1}
            <span
              class="inline-block rounded-full text-center align-top text-xs text-gray-500 dark:text-gray-300"
              >{i}</span
            >
          {/if}
          <div class="ml-1 inline-block">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              on:dblclick={() => {
                copy_text_to_clipboard(line_transliterated);
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
                  if (i === sarga_data.length - 1)
                    copy_text_to_clipboard(get_possibily_not_undefined(trans_en_data.get(-1)));
                  else copy_text_to_clipboard(get_possibily_not_undefined(trans_en_data.get(i)));
                  copied_text_status = true;
                }}
                class="text-stone-500 dark:text-slate-300"
              >
                {#if trans_en_data.has(i)}
                  <!-- Usually translations are single but still... -->
                  {#each get_possibily_not_undefined(trans_en_data.get(i)).split('\n') as line_trans}
                    <div>{line_trans}</div>
                  {/each}
                {:else if i === sarga_data.length - 1 && trans_en_data.has(-1)}
                  <div>{trans_en_data.get(-1)}</div>
                {/if}
              </div>
            {/if}
            {#if editing_status_on}
              <div transition:slide>
                <button
                  class="btn m-0 rounded-md bg-surface-500 p-0 px-1 font-bold text-white dark:bg-surface-500"
                >
                  <Icon src={RiSystemAddLargeLine} />
                </button>
              </div>
            {:else if loaded_lang_trans_data}
              <div class="text-yellow-700 dark:text-yellow-500">
                {#if trans_lang_data.has(i)}
                  <!-- Usually translations are single but still... -->
                  {#each get_possibily_not_undefined(trans_lang_data.get(i)).split('\n') as line_trans}
                    <div>{line_trans}</div>
                  {/each}
                {:else if i === sarga_data.length - 1 && trans_lang_data.has(-1)}
                  <div>{trans_lang_data.get(-1)}</div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
