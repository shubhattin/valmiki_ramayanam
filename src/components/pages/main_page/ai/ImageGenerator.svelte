<script lang="ts">
  import { rAmAyaNam_map } from '@state/main_page/data';
  import { kANDa_selected, sarga_selected } from '@state/main_page/main_state';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { writable } from 'svelte/store';
  import base_prompts from './base_prompt.yaml';

  $: kANDa_info = rAmAyaNam_map[$kANDa_selected - 1];
  $: sarga_info = kANDa_info.sarga_data[$sarga_selected - 1];
  $: shloka_count = sarga_info.shloka_count_extracted;

  $: if ($sarga_selected) {
    $shloka_numb = 1;
  }
  let shloka_numb = writable(1);

  let base_user_prompt = writable<string>(base_prompts[0].content);

  let additional_prompt_info = writable('');
  $: $additional_prompt_info =
    `The Shloka will be from Sarga ${sarga_info.index} named ${sarga_info.name_normal}, Kanda ${kANDa_info.index} ` +
    `named ${kANDa_info.name_normal} from Ancient Indian Epic(itihAsa) vAlmIkIrAmAyaNam`;
  $: base_prompts[0].content = $base_user_prompt + $additional_prompt_info;
</script>

<div class="inline-block space-x-1">
  <button
    class="btn m-0 p-0"
    disabled={$shloka_numb === 0}
    on:click={() => {
      if ($shloka_numb !== -1) $shloka_numb -= 1;
      else $shloka_numb = shloka_count;
    }}
  >
    <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
  </button>
  <select class="select inline-block w-14 p-1 text-sm" bind:value={$shloka_numb}>
    <option value={0}>0</option>
    {#each Array(shloka_count) as _, index}
      <option value={index + 1}>{index + 1}</option>
    {/each}
    <option value={-1}>-1</option>
  </select>
  <button
    class="btn m-0 p-0"
    on:click={() => {
      if ($shloka_numb !== shloka_count) $shloka_numb += 1;
      else $shloka_numb = -1;
    }}
    disabled={$shloka_numb === -1}
  >
    <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
  </button>
</div>
<label class="space-x-1">
  <span class="font-bold">Base Prompt</span>
  <textarea
    class="textarea h-24 px-1 py-0 text-sm"
    spellcheck="false"
    bind:value={$base_user_prompt}
  ></textarea>
  <span class="text-xs">{$additional_prompt_info}</span>
</label>
