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
    get_units
  } from './state';
  import {
    shloka_configs,
    SPACE_ABOVE_REFERENCE_LINE,
    SPACE_BETWEEN_MAIN_AND_NORM,
    type shloka_type_config
  } from './settings';
  import { viewing_script, BASE_SCRIPT } from '@state/main_page/main_state';
  import { LANG_LIST } from '@tools/lang_list';
  import { FONT_FAMILY_NAME, get_text_font, load_font, get_font_url } from '@tools/font_tools';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { LanguageIcon } from '@components/icons';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import * as fabric from 'fabric';
  import { lipi_parivartak_async } from '@tools/converter';
  import ImageDownloader from './ImageDownloader.svelte';
  import { browser } from '$app/environment';

  export let mounted: boolean;

  $: kANDa_info = rAmAyaNam_map[$image_kANDa - 1];
  $: shloka_count = kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted;

  const draw_bounding_and_reference_lines = async (shloka_config: shloka_type_config) => {
    const bounds = shloka_config.bounding_coords;
    const LINE_COLOR = 'black';
    const LINE_WIDTH = 1.5;
    for (let coords of [
      // x1 y1 x2 y2
      [bounds.left, bounds.top, bounds.left, bounds.bottom], // left line
      [bounds.right, bounds.top, bounds.right, bounds.bottom], // top line
      [bounds.left, bounds.top, bounds.right, bounds.top], // right line
      [bounds.left, bounds.bottom, bounds.right, bounds.bottom] // bottom line
    ])
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
    // drawing shloka reference lines
    for (let top of shloka_config.reference_lines_top)
      $canvas.add(
        new fabric.Line(
          [get_units(bounds.left), get_units(top), get_units(bounds.right), get_units(top)],
          {
            stroke: 'brown',
            strokeWidth: get_units(2),
            selectable: false,
            evented: false
          }
        )
      );

    return shloka_config;
  };
  const render_all_texts = async ($image_shloka: number, $image_script: string) => {
    const shloka_type = 2;
    const shloka_config = $shloka_configs[shloka_type as keyof typeof $shloka_configs];
    if (!browser) return shloka_config;
    // load wasm based library
    const { get_text_svg_path } = await import('@tools/harfbuzz');
    // load necessary fonts
    await load_font(FONT_FAMILY_NAME.ADOBE_DEVANGARI);

    // remove all previous texts, textboxes and lines
    $canvas.getObjects().forEach((obj) => {
      if (!obj || obj.type === 'image') return;
      $canvas.remove(obj);
    });
    const get_font_size_for_path = (font_size: number) => {
      const PATH_SCALING_FACTOR = 1 / 15.125;
      return get_units((font_size / 65) * PATH_SCALING_FACTOR);
    };
    await draw_bounding_and_reference_lines(shloka_config);
    const WIDTH_ACTUAL = get_units(
      (shloka_config.bounding_coords.right - shloka_config.bounding_coords.left) * 1.0
    );
    const WIDTH = WIDTH_ACTUAL * 0.98;
    const HEIGHT_ACUAL = get_units(
      (shloka_config.bounding_coords.bottom - shloka_config.bounding_coords.top) * 1.0
    );

    // shloka
    const shloka_data =
      $image_sarga_data.data![
        $image_shloka !== -1 ? $image_shloka : $image_sarga_data.data!.length - 1
      ];
    const shloka_lines = shloka_data.split('\n');

    for (let i = 0; i < shloka_lines.length; i++) {
      const main_text_path = await get_text_svg_path(
        await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, $image_script),
        get_font_url('NIRMALA_UI', 'bold')
      );
      let main_text_path_scale = get_font_size_for_path(shloka_config.main_text_font_size);
      const text_main = new fabric.Path(main_text_path, {
        fill: '#4f3200',
        lockRotation: true,
        lockMovementY: true
      });
      let height_main = text_main.height * main_text_path_scale; // already scaled
      let width_main = text_main.width * main_text_path_scale; // already scaled
      if (WIDTH / width_main < 1)
        main_text_path_scale = (main_text_path_scale / width_main) * WIDTH;
      text_main.set({
        scaleX: main_text_path_scale,
        scaleY: main_text_path_scale
      });
      height_main = text_main.height * main_text_path_scale;
      width_main = text_main.width * main_text_path_scale;

      const transliterated_text = await get_text_svg_path(
        await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, 'Normal'),
        get_font_url('ADOBE_DEVANGARI', 'regular')
      );
      let norm_text_path_scale = get_font_size_for_path(shloka_config.norm_text_font_size);
      const text_norm = new fabric.Path(transliterated_text, {
        fill: '#352700',
        lockRotation: true,
        lockMovementY: true
      });
      let height_norm = text_norm.height * norm_text_path_scale; // already scale
      let width_norm = text_norm.width * norm_text_path_scale; // already scaled
      if (WIDTH / width_norm < 1)
        norm_text_path_scale = (norm_text_path_scale / width_norm) * WIDTH;
      text_norm.set({
        scaleX: norm_text_path_scale,
        scaleY: norm_text_path_scale
      });
      height_norm = text_norm.height * norm_text_path_scale;
      width_norm = text_norm.width * norm_text_path_scale;
      text_norm.set({
        top:
          get_units(shloka_config.reference_lines_top[i]) -
          (height_norm + get_units(SPACE_ABOVE_REFERENCE_LINE)),
        left:
          get_units(shloka_config.bounding_coords.left) +
          (WIDTH_ACTUAL - WIDTH) / 2 +
          (WIDTH - width_norm) / 2
      });
      text_main.set({
        top:
          get_units(shloka_config.reference_lines_top[i]) -
          (height_main +
            SPACE_BETWEEN_MAIN_AND_NORM +
            (height_norm + get_units(SPACE_ABOVE_REFERENCE_LINE))),
        left:
          get_units(shloka_config.bounding_coords.left) +
          (WIDTH_ACTUAL - WIDTH) / 2 +
          (WIDTH - width_main) / 2
      });
      $canvas.add(text_main);
      $canvas.add(text_norm);
      if (i === 1) break;
    }

    // trans
    const trans_data = $image_trans_data.data!;
    let trans_text: any = null!;
    if (trans_data.has($image_shloka)) {
      const trans_text_data = trans_data.get($image_shloka)!;
      trans_text = new fabric.Textbox(trans_text_data, {
        textAlign: 'right',
        left: get_units(610),
        top: get_units(650),
        fill: '#352700',
        fontFamily: FONT_FAMILY_NAME.ADOBE_DEVANGARI,
        fontSize: get_units(shloka_config.trans_text_font_size),
        lockRotation: true,
        width: get_units(1200)
      });
    }
    if (trans_text) $canvas.add(trans_text);
    $canvas.requestRenderAll();
    return shloka_config;
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
