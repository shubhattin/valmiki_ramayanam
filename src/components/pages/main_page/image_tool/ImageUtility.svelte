<script lang="ts">
  import { rAmAyaNam_map } from '@state/main_page/data';
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
  import { viewing_script, BASE_SCRIPT } from '@state/main_page/main_state';
  import { LANG_LIST, SCRIPT_LIST } from '@tools/lang_list';
  import { FONT_NAMES, get_text_font, load_font } from '@tools/font_tools';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { LanguageIcon } from '@components/icons';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { BsDownload } from 'svelte-icons-pack/bs';
  import { SlideToggle, popup } from '@skeletonlabs/skeleton';
  import JSZip from 'jszip';
  import * as fabric from 'fabric';
  import { lipi_parivartak_async } from '@tools/converter';
  import { dataURLToBlob } from '@tools/kry';

  export let mounted: boolean;

  $: kANDa_info = rAmAyaNam_map[$image_kANDa - 1];
  $: shloka_count = kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted;

  const render_all_texts = async ($image_shloka: number, $image_script: string) => {
    // load necessary fonts
    await load_font(FONT_NAMES.INDIC_FONT_NAME);
    await load_font(FONT_NAMES.ADOBE_DEVANGARI);

    // remove all previous texts
    $canvas.getObjects().forEach((obj) => {
      if (!obj || obj.type === 'image') return;
      $canvas.remove(obj);
    });

    // shloka
    $shloka_texts = [];
    const shloka_data =
      $image_sarga_data.data![
        $image_shloka !== -1 ? $image_shloka : $image_sarga_data.data!.length - 1
      ];
    const shloka_lines = shloka_data.split('\n');

    const START_LEFT_DEV = 600;
    const START_TOP_DEV = 190;
    const START_LEFT_NORMAL = 620;
    const START_TOP_NORMAL = 270;

    for (let i = 0; i < shloka_lines.length; i++) {
      const script_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, $image_script);
      const text_main = new fabric.Text(script_text, {
        textAlign: 'center',
        left: get_units(START_LEFT_DEV),
        top: get_units(START_TOP_DEV + i * 180),
        fill: '#4f3200',
        fontFamily: FONT_NAMES.INDIC_FONT_NAME,
        fontSize: get_units(68),
        lockRotation: true,
        fontWeight: 700
      });
      $shloka_texts.push(text_main);
      const transliterated_text = await lipi_parivartak_async(
        shloka_lines[i],
        BASE_SCRIPT,
        'Normal'
      );
      const text_eng = new fabric.Text(transliterated_text, {
        textAlign: 'center',
        left: get_units(START_LEFT_NORMAL),
        top: get_units(START_TOP_NORMAL + i * 180),
        fill: '#352700',
        fontFamily: FONT_NAMES.ADOBE_DEVANGARI,
        fontSize: get_units(50),
        lockRotation: true
      });
      $shloka_texts.push(text_eng);
      if (i === 1) break;
    }
    $canvas.add(...$shloka_texts);

    // trans
    const trans_data = $image_trans_data.data!;
    $trans_text = null!;
    if (trans_data.has($image_shloka)) {
      const trans_text = trans_data.get($image_shloka)!;
      $trans_text = new fabric.Textbox(trans_text, {
        textAlign: 'right',
        left: get_units(610),
        top: get_units(650),
        fill: '#352700',
        fontFamily: FONT_NAMES.ADOBE_DEVANGARI,
        fontSize: get_units(58),
        lockRotation: true,
        width: get_units(1200)
      });
    }
    if ($trans_text) $canvas.add($trans_text);
    $canvas.requestRenderAll();
  };

  $: mounted &&
    !$image_sarga_data.isFetching &&
    $image_sarga_data.isSuccess &&
    !$image_trans_data.isFetching &&
    $image_trans_data.isSuccess &&
    $image_sarga &&
    $image_kANDa &&
    $image_lang &&
    (async () => {
      await render_all_texts($image_shloka, $image_script);
    })();

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
  const download_image_as_png = async (
    remove_background: boolean,
    download = true,
    shloka_num: number | null = null
  ) => {
    if (remove_background) await remove_background_image();
    else if ($shaded_background_image_status) await set_background_image_type(false);

    const url = $canvas.toDataURL({
      format: 'png',
      multiplier: 1 / $scaling_factor
    });
    const name = `${$image_kANDa}-${$image_sarga} Shloka No. ${shloka_num ?? $image_shloka}.png`;
    if (download) download_file_in_browser(url, name);
    if (remove_background) add_background_image();
    else if ($shaded_background_image_status)
      await set_background_image_type($shaded_background_image_status);
    return {
      url,
      name
    };
  };
  const download_image_as_svg = async (download = true, shloka_num: number | null = null) => {
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
    const name = `${$image_kANDa}-${$image_sarga} Shloka No. ${shloka_num ?? $image_shloka}.svg`;
    if (download) {
      const svg_url = URL.createObjectURL(blob);
      download_file_in_browser(svg_url, name);
    }
    add_background_image();
    return {
      blob,
      name
    };
  };

  const download_png_zip = async () => {
    const zip = new JSZip();
    for (let i = -1; i <= shloka_count; i++) {
      await render_all_texts(i, $image_script);
      const { url, name } = await download_image_as_png(true, false, i);
      const blob = dataURLToBlob(url);
      zip.file(name, blob);
    }
    await render_all_texts($image_shloka, $image_script);
    const zip_blob = await zip.generateAsync({ type: 'blob' });
    download_file_in_browser(
      URL.createObjectURL(zip_blob),
      `${$image_kANDa}-${$image_sarga} PNG files.zip`
    );
    // ^ restore the original state
  };
  const download_svg_zip = async () => {
    const zip = new JSZip();
    for (let i = -1; i <= shloka_count; i++) {
      await render_all_texts(i, $image_script);
      const { blob, name } = await download_image_as_svg(false, i);
      zip.file(name, blob);
    }
    await render_all_texts($image_shloka, $image_script);
    const zip_blob = await zip.generateAsync({ type: 'blob' });
    download_file_in_browser(
      URL.createObjectURL(zip_blob),
      `${$image_kANDa}-${$image_sarga} SVG files.zip`
    );
    // ^ restore the original state
  };
</script>

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
  <div class="card z-50 space-y-0 rounded-md p-1 shadow-xl" data-popup="image_download">
    <div class="flex items-center justify-center space-x-2">
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
    <div class="flex items-center justify-center space-x-2">
      <button
        on:click={() => download_png_zip()}
        class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        PNG Zip
      </button>
      <button
        on:click={() => download_svg_zip()}
        class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        SVG Zip
      </button>
    </div>
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
