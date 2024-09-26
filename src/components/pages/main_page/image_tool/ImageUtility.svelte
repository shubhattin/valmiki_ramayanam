<script lang="ts">
  import {
    image_kANDa,
    image_sarga,
    image_script,
    image_shloka,
    canvas,
    image_sarga_data,
    image_trans_data,
    get_units,
    image_lang,
    normal_text_font_config,
    main_text_font_configs,
    trans_text_font_configs
  } from './state';
  import {
    current_shloka_type,
    shloka_configs,
    SPACE_ABOVE_REFERENCE_LINE,
    SPACE_BETWEEN_MAIN_AND_NORM,
    type shloka_type_config
  } from './settings';
  import { BASE_SCRIPT } from '@state/main_page/main_state';
  import { FONT_FAMILY_NAME, load_font, get_font_url } from '@tools/font_tools';
  import * as fabric from 'fabric';
  import { lipi_parivartak_async } from '@tools/converter';
  import { browser } from '$app/environment';
  import ImageOptions from './ImageOptions.svelte';
  import type { script_list_type } from '@tools/lang_list';
  import { render_text } from './render_task';

  export let mounted: boolean;

  const draw_bounding_and_reference_lines = async (shloka_config: shloka_type_config) => {
    const bounds = shloka_config.bounding_coords;
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
            stroke: 'hsla(215, 40%, 60%, 1)',
            strokeWidth: get_units(1.5),
            selectable: false,
            evented: false
          }
        )
      );
    // drawing shloka reference lines
    for (let top_i = 0; top_i < $current_shloka_type; top_i++) {
      const top = shloka_config.reference_lines.top + top_i * shloka_config.reference_lines.spacing;
      $canvas.add(
        new fabric.Line(
          [get_units(bounds.left), get_units(top), get_units(bounds.right), get_units(top)],
          {
            stroke: 'hsla(0, 59%, 41%, 1)',
            strokeWidth: get_units(2),
            selectable: false,
            evented: false
          }
        )
      );
    }
    return shloka_config;
  };
  const render_all_texts = async ($image_shloka: number, $image_script: script_list_type) => {
    if (!browser) return $shloka_configs[2]; // just like has no meaning

    const main_text_font_info = $main_text_font_configs[$image_script];
    const trans_text_font_info = $trans_text_font_configs[$image_lang];
    const norm_text_font_info = $normal_text_font_config;

    // load necessary fonts
    await load_font(FONT_FAMILY_NAME.ADOBE_DEVANAGARI);

    // remove all previous texts, textboxes and lines
    $canvas.getObjects().forEach((obj) => {
      if (!obj || obj.type === 'image') return;
      $canvas.remove(obj);
    });
    $canvas.discardActiveObject();

    // fetch shloka config
    const shloka_data =
      $image_sarga_data.data![
        $image_shloka !== -1 ? $image_shloka : $image_sarga_data.data!.length - 1
      ];

    const shloka_lines = (() => {
      if ($image_shloka === 0) {
        const words = shloka_data.split(' ');
        const break_point = 3;
        return [words.slice(0, break_point).join(' '), words.slice(break_point).join(' ')];
      } else if ($image_shloka === -1) {
        const words = shloka_data.split(' ');
        const break_point = 4;
        return [words.slice(0, break_point).join(' '), words.slice(break_point).join(' ')];
      }
      const line_split = shloka_data.split('\n');
      const new_shloka_lines: string[] = [];
      for (let i = 0; i < line_split.length; i++) {
        const line = line_split[i];
        // We are not splitiing words as it leading to inconsistent unexpected results
        new_shloka_lines.push(line);
      }
      return new_shloka_lines;
    })();
    $current_shloka_type = shloka_lines.length as keyof typeof $shloka_configs;
    const shloka_config = $shloka_configs[$current_shloka_type];

    await draw_bounding_and_reference_lines(shloka_config);

    // shloka

    for (let i = 0; i < shloka_lines.length; i++) {
      const main_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, $image_script);
      const text_main_group = await render_text({
        text: main_text,
        font_url: get_font_url(main_text_font_info.key, 'bold'),
        font_size: shloka_config.main_text_font_size * main_text_font_info.size,
        color: 'hsla(38, 100%, 15%, 1)',
        line_index: i,
        total_lines: shloka_lines.length,
        text_type: 'main',
        right: shloka_config.bounding_coords.right,
        left: shloka_config.bounding_coords.left,
        width_usage_factor: 0.985,
        align: 'center'
      });
      const norm_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, 'Normal');
      const text_norm_group = await render_text({
        text: norm_text,
        font_url: get_font_url(norm_text_font_info.key, 'regular'),
        font_size: shloka_config.norm_text_font_size * norm_text_font_info.size,
        color: 'hsla(44, 100%, 10%, 1)',
        line_index: i,
        total_lines: shloka_lines.length,
        text_type: 'normal',
        right: shloka_config.bounding_coords.right,
        left: shloka_config.bounding_coords.left,
        width_usage_factor: 0.985,
        align: 'center'
      });
      const top_pos = get_units(
        shloka_config.reference_lines.top + i * shloka_config.reference_lines.spacing
      );
      text_norm_group.set({
        top: top_pos - (text_norm_group.height + get_units($SPACE_ABOVE_REFERENCE_LINE))
      });
      text_main_group.set({
        top:
          top_pos -
          (text_main_group.height +
            $SPACE_BETWEEN_MAIN_AND_NORM +
            (text_norm_group.height + get_units($SPACE_ABOVE_REFERENCE_LINE)))
      });
      $canvas.add(text_main_group);
      $canvas.add(text_norm_group);
      if (i === shloka_lines.length - 1) {
        const number_main_text = main_text.split(' ').at(-1)!;
        const number_indicator_main = await render_text({
          text: number_main_text.substring(1, number_main_text.length - 1),
          font_url: get_font_url(main_text_font_info.key, 'bold'),
          font_size: 42 * main_text_font_info.size * 0.8,
          color: 'hsla(37, 80%, 25%, 0.8)',
          right: shloka_config.bounding_coords.right,
          left: shloka_config.bounding_coords.left,
          width_usage_factor: 0.985,
          align: 'right',
          top: shloka_config.bounding_coords.top + 8
        });
        $canvas.add(number_indicator_main);

        const number_indicator_norm = await render_text({
          text: norm_text.split(' ').at(-1)!,
          font_url: get_font_url('ROBOTO', 'bold'),
          font_size: 28 * norm_text_font_info.size * 0.98,
          color: 'hsla(37, 80%, 25%, 0.8)',
          right: shloka_config.bounding_coords.right,
          left: shloka_config.bounding_coords.left,
          width_usage_factor: 0.985,
          align: 'right'
        });
        // top has to be set outiside as itss a mix of scaled and non scaled values
        number_indicator_norm.set({
          top: number_indicator_main.top + get_units(5) + number_indicator_main.height
        });
        $canvas.add(number_indicator_norm);
      }
    }

    // trans
    const trans_data = $image_trans_data.data!;
    if (trans_data.has($image_shloka)) {
      const trans_text_data = trans_data.get($image_shloka)!;
      const trans_text = await render_text({
        // text: trans_text_data,
        text: 'Valmiki Greatest of all Sages\nGood',
        align: 'right',
        color: 'hsla(44, 100%, 10%, 1)',
        font_url: get_font_url(trans_text_font_info.key, 'regular'),
        font_size: shloka_config.trans_text_font_size * trans_text_font_info.size,
        left: 610,
        top: 650,
        width_usage_factor: 0.985,
        right: 610 + 1250
      });
      $canvas.add(trans_text);
    }
    $canvas.requestRenderAll();
    return shloka_config;
  };

  $: mounted &&
    !$image_sarga_data.isFetching &&
    $image_sarga_data.isSuccess &&
    !$image_trans_data.isFetching &&
    $image_trans_data.isSuccess &&
    $SPACE_ABOVE_REFERENCE_LINE &&
    $SPACE_BETWEEN_MAIN_AND_NORM &&
    $image_sarga &&
    $image_kANDa &&
    $shloka_configs &&
    $normal_text_font_config &&
    $trans_text_font_configs &&
    $main_text_font_configs &&
    (async () => {
      await render_all_texts($image_shloka, $image_script);
    })();
</script>

<ImageOptions {render_all_texts} />
