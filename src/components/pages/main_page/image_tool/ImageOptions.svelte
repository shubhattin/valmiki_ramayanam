<script lang="ts">
  import { get_kANDa_names, get_sarga_names, rAmAyaNam_map } from '@state/main_page/data';
  import {
    image_kANDa,
    image_lang,
    image_sarga,
    image_script,
    image_shloka,
    scaling_factor,
    canvas,
    image_sarga_data,
    image_trans_data,
    set_background_image_type,
    shaded_background_image_status,
    background_image,
    IMAGE_DIMENSIONS,
    get_units,
    shloka_texts,
    trans_text
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
  import { get, writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { SlideToggle, popup } from '@skeletonlabs/skeleton';

  let mounted = writable(false);
  onMount(() => {
    $mounted = true;
    return () => {
      $mounted = false;
    };
  });

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

  $: if ($image_kANDa && get(mounted)) {
    // ^ accessing writable's value without $ wont trigger it on change
    $image_sarga = 1;
    $image_shloka = 1;
  }

  $: if ($image_sarga) {
    $image_shloka = 1;
    // reset after change
  }

  $: sarga_loading = $image_sarga_data.isFetching || !$image_sarga_data.isSuccess;

  const remove_background_image = async () => {
    $canvas.getObjects().forEach((obj) => {
      if (obj.type === 'image') $canvas.remove(obj);
    });
    $canvas.requestRenderAll();
  };
  const add_background_image = async () => {
    $canvas.add($background_image);
    $canvas.sendObjectToBack($background_image);
    $canvas.requestRenderAll();
  };
  const download_image_as_png = async (remove_background: boolean) => {
    if (remove_background) await remove_background_image();
    else if ($shaded_background_image_status) await set_background_image_type(false);

    const URL = $canvas.toDataURL({
      format: 'png',
      multiplier: 1 / $scaling_factor
    });
    download_file_in_browser(
      URL,
      `${$image_kANDa}-${$image_sarga} Shloka No. ${$image_shloka}.png`
    );
    if (remove_background) add_background_image();
    else if ($shaded_background_image_status)
      await set_background_image_type($shaded_background_image_status);
  };
  const download_image_as_svg = async () => {
    await remove_background_image();
    const svg_text = $canvas.toSVG({
      width: `${IMAGE_DIMENSIONS[0]}`,
      height: `${IMAGE_DIMENSIONS[1]}`,
      viewBox: {
        x: 0,
        y: 0,
        width: get_units(IMAGE_DIMENSIONS[0]),
        height: get_units(IMAGE_DIMENSIONS[1])
      }
    });
    const blob = new Blob([svg_text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    download_file_in_browser(
      url,
      `${$image_kANDa}-${$image_sarga} Shloka No. ${$image_shloka}.svg`
    );
    add_background_image();
  };
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
      disabled={sarga_loading}
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
        disabled={$image_sarga === 1 || sarga_loading}
        on:click={() => ($image_sarga -= 1)}
      >
        <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
      </button>
      <Select
        class={`${get_text_font($viewing_script)} select inline-block w-40 p-1 text-sm`}
        zodType={z.coerce.number().int()}
        disabled={sarga_loading}
        bind:value={$image_sarga}
        options={sarga_names.map((name, index) => ({
          value: index + 1,
          text: `${index + 1} ${name}`
        }))}
      />
      <button
        class="btn m-0 p-0"
        on:click={() => ($image_sarga += 1)}
        disabled={$image_sarga === rAmAyaNam_map[$image_kANDa - 1].sarga_count || sarga_loading}
      >
        <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
      </button>
    </div>
  </div>
  <div class="flex space-x-2 text-sm">
    <div class="inline-block space-x-1">
      <button
        class="btn m-0 p-0"
        disabled={$image_shloka === 0}
        on:click={() => {
          if ($image_shloka !== -1) $image_shloka -= 1;
          else $image_shloka = shloka_count;
        }}
      >
        <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
      </button>
      <select
        class={`${get_text_font($viewing_script)} select inline-block w-14 p-1 text-sm`}
        bind:value={$image_shloka}
      >
        <option value={0}>0</option>
        {#each Array(shloka_count) as _, index}
          <option value={index + 1}>{index + 1}</option>
        {/each}
        <option value={-1}>-1</option>
      </select>
      <button
        class="btn m-0 p-0"
        on:click={() => {
          if ($image_shloka !== shloka_count) $image_shloka += 1;
          else $image_shloka = -1;
        }}
        disabled={$image_shloka === -1}
      >
        <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
      </button>
    </div>
    <label class="inline-block space-x-1">
      <Icon src={LanguageIcon} class="text-xl" />
      <select
        class="select inline-block w-24 p-1 text-sm"
        bind:value={$image_lang}
        disabled={$image_trans_data.isFetching || !$image_trans_data.isSuccess}
      >
        <option value="English">English</option>
        {#each LANG_LIST as lang (lang)}
          <option value={lang}>{lang}</option>
        {/each}
      </select>
    </label>
    <button
      use:popup={{
        event: 'click',
        target: 'image_download',
        placement: 'bottom'
      }}
      on:dblclick={() => download_image_as_png(true)}
      class="btn inline-flex rounded-lg p-1 text-sm"
    >
      <Icon src={BsDownload} class="-mt-1 mr-1 text-2xl" />
    </button>
    <div class="card z-50 space-x-2 rounded-md p-1 shadow-xl" data-popup="image_download">
      <button
        on:click={() => download_image_as_svg()}
        class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        SVG
      </button>
      <button
        on:click={() => download_image_as_png(true)}
        class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        PNG
      </button>
      <button
        on:click={() => download_image_as_png(false)}
        class="btn rounded-md p-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        PNG (with background)
      </button>
    </div>
    <span class="inline-flex flex-col">
      <SlideToggle
        name="from_text_type"
        active="bg-primary-500"
        class="mt-1 hover:text-gray-500 dark:hover:text-gray-400"
        bind:checked={$shaded_background_image_status}
        size="sm"
      >
        <!-- <Icon src={BsKeyboard} class="text-4xl" /> -->
      </SlideToggle>
    </span>
  </div>
{/if}
