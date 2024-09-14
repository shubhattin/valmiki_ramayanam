<script lang="ts">
  import { get_kANDa_names, get_sarga_names, rAmAyaNam_map } from '@state/main_page/data';
  import {
    image_kANDa,
    image_lang,
    image_sarga,
    image_script,
    image_shloka,
    scaling_factor,
    canvas
  } from './state';
  import {
    sarga_selected,
    kANDa_selected,
    trans_lang,
    viewing_script
  } from '@state/main_page/main_state';
  import { LANG_LIST, SCRIPT_LIST } from '@tools/lang_list';
  import Select from '@components/Select.svelte';
  import { z } from 'zod';
  import { get_text_font } from '@tools/font_tools';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { LanguageIcon } from '@components/icons';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { BsDownload } from 'svelte-icons-pack/bs';

  // in our case we dont need to initialize inside of onMount
  $image_kANDa = $kANDa_selected;
  $image_sarga = $sarga_selected;
  $image_script = $viewing_script;
  if ($trans_lang !== '--') $image_lang = $trans_lang;

  let kANDa_names: string[] = [];
  $: get_kANDa_names($image_script).then((names) => (kANDa_names = names));
  let sarga_names: string[] = [];
  $: get_sarga_names($image_kANDa, $image_script).then((names) => (sarga_names = names));

  $: kANDa_info = rAmAyaNam_map[$image_kANDa - 1];
  $: shloka_count = kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted;

  $: if ($image_kANDa) {
    $image_sarga = 1;
    $image_shloka = 1;
    // reset after change
  }
</script>

{#if sarga_names.length !== 0 && kANDa_names.length !== 0}
  <div class="space-x-2 text-sm">
    <select class="select inline-block w-36 p-1 text-sm" bind:value={$image_script}>
      {#each SCRIPT_LIST as lang (lang)}
        <option value={lang}>{lang === 'Sanskrit' ? 'Devanagari' : lang}</option>
      {/each}
    </select>
    <Select
      class={`${get_text_font($image_lang)} select inline-block w-36 p-1 text-sm`}
      zodType={z.coerce.number().int()}
      bind:value={$image_kANDa}
      options={kANDa_names.map((name, index) => ({
        value: index + 1,
        text: `${index + 1} ${name}`
      }))}
    />
    <div class="inline-block space-x-1">
      <button
        class="btn m-0 p-0"
        disabled={$image_sarga === 1}
        on:click={() => ($image_sarga -= 1)}
      >
        <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
      </button>
      <Select
        class={`${get_text_font($viewing_script)} select inline-block w-40 p-1 text-sm`}
        zodType={z.coerce.number().int()}
        bind:value={$image_sarga}
        options={sarga_names.map((name, index) => ({
          value: index + 1,
          text: `${index + 1} ${name}`
        }))}
      />
      <button
        class="btn m-0 p-0"
        on:click={() => ($image_sarga += 1)}
        disabled={$image_sarga === rAmAyaNam_map[$image_kANDa - 1].sarga_count}
      >
        <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
      </button>
    </div>
  </div>
  <div class="space-x-2 text-sm">
    <div class="inline-block space-x-1">
      <button
        class="btn m-0 p-0"
        disabled={$image_shloka === -1}
        on:click={() => ($image_shloka -= 1)}
      >
        <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
      </button>
      <input class="input m-0 w-14 rounded-md px-1 py-0" type="number" bind:value={$image_shloka} />
      <!-- TODO: Add a comobox like selector -->
      <button
        class="btn m-0 p-0"
        on:click={() => ($image_shloka += 1)}
        disabled={$image_shloka === shloka_count}
      >
        <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
      </button>
    </div>
    <label class="inline-block space-x-1">
      <Icon src={LanguageIcon} class="text-xl" />
      <select class="select inline-block w-24 p-1 text-sm" bind:value={$image_lang}>
        <option value="English">English</option>
        {#each LANG_LIST as lang (lang)}
          <option value={lang}>{lang}</option>
        {/each}
      </select>
    </label>
    <button
      class="btn inline-flex rounded-lg px-2 py-1"
      on:click={() => {
        const URL = $canvas.toDataURL({
          format: 'jpeg',
          quality: 1,
          multiplier: 1 / $scaling_factor
        });
        download_file_in_browser(
          URL,
          `${$image_kANDa}-${$image_sarga} Shloka No. ${$image_shloka}.jpeg`
        );
      }}
    >
      <Icon src={BsDownload} class="-mt-1 mr-1 text-lg" />
      Download Image
    </button>
  </div>
{/if}
