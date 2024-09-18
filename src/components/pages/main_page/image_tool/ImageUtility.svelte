<script lang="ts">
  import { rAmAyaNam_map } from '@state/main_page/data';
  import {
    image_kANDa,
    image_lang,
    image_sarga,
    image_script,
    image_shloka,
    canvas,
    image_sarga_data,
    image_trans_data,
    shaded_background_image_status,
    get_units,
    shloka_texts,
    trans_text
  } from './state';
  import { shloka_configs } from './settings';
  import { viewing_script, BASE_SCRIPT } from '@state/main_page/main_state';
  import { LANG_LIST } from '@tools/lang_list';
  import { FONT_NAMES, get_text_font, load_font } from '@tools/font_tools';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { LanguageIcon } from '@components/icons';
  import { SlideToggle, popup } from '@skeletonlabs/skeleton';
  import * as fabric from 'fabric';
  import { lipi_parivartak_async } from '@tools/converter';
  import ImageDownloader from './ImageDownloader.svelte';

  export let mounted: boolean;

  $: kANDa_info = rAmAyaNam_map[$image_kANDa - 1];
  $: shloka_count = kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted;

  const draw_bounding_lines = async (shloka_type: number) => {
    const shloka_config = $shloka_configs[shloka_type as keyof typeof $shloka_configs];

    const bounds = shloka_config.bounding_coords;
    const LINE_COLOR = 'black';
    const LINE_WIDTH = 1.5;
    for (let coords of [
      [bounds.left, bounds.top, bounds.left, bounds.bottom],
      [bounds.right, bounds.top, bounds.right, bounds.bottom],
      [bounds.left, bounds.top, bounds.right, bounds.top],
      [bounds.left, bounds.bottom, bounds.right, bounds.bottom]
    ]) {
      $canvas.add(
        new fabric.Line(
          [get_units(coords[0]), get_units(coords[1]), get_units(coords[2]), get_units(coords[3])],
          {
            stroke: LINE_COLOR,
            strokeWidth: get_units(LINE_WIDTH),
            selectable: false,
            evented: false
          }
        )
      );
    }

    return shloka_config;
  };
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

    const shloka_type = 2;
    const shloka_config = await draw_bounding_lines(shloka_type);

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
        fontSize: get_units(shloka_config.main_text_font_size),
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
        fontSize: get_units(shloka_config.norm_text_font_size),
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
        fontSize: get_units(shloka_config.trans_text_font_size),
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
    $shloka_configs &&
    (async () => {
      await render_all_texts($image_shloka, $image_script);
    })();
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
  <ImageDownloader {render_all_texts} />
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
