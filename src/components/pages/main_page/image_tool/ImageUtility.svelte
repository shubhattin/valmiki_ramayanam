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
  import { z } from 'zod';

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

    // load wasm based library
    const { get_text_svg_path } = await import('@tools/harfbuzz');
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

    const get_font_size_for_path = (font_size: number) => {
      const PATH_SCALING_FACTOR = 1 / 15.125;
      return get_units((font_size / 65) * PATH_SCALING_FACTOR);
    };
    await draw_bounding_and_reference_lines(shloka_config);

    // shloka
    const render_text_args_schema = z.object({
      text: z.string(),
      font_url: z.string(),
      font_size: z.number(),
      color: z.string(),
      line_index: z.number().optional(),
      text_type: z.union([z.literal('main'), z.literal('normal')]).optional(),
      total_lines: z.number().optional(),
      left: z.number(),
      right: z.number(),
      top: z.number().optional(),
      width_usage_factor: z.number(),
      align: z.union([z.literal('left'), z.literal('right'), z.literal('center')])
    });
    /**
     * This function will also set the left coordinate of the text.
     * left has to be set outside
     *
     * returns `[text_group, height, width]`
     */
    const render_text = async (opts: z.infer<typeof render_text_args_schema>) => {
      const {
        text,
        font_url,
        font_size,
        color,
        line_index,
        text_type,
        width_usage_factor,
        align,
        total_lines
      } = render_text_args_schema.parse(opts);

      const right = get_units(opts.right);
      const left = get_units(opts.left);

      const WIDTH_ACTUAL = right - left;
      const WIDTH = WIDTH_ACTUAL * width_usage_factor;
      const WIDTH_SPACING = (WIDTH_ACTUAL - WIDTH) / 2;

      let text_used = '';
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word === '') continue;
        else if (
          line_index &&
          total_lines &&
          text_type &&
          i === words.length - 1 &&
          line_index === total_lines - 1
        ) {
          if (text_type === 'main') text_used += word[0];
          continue;
        }
        text_used += word + (i === words.length - 1 ? '' : ' ');
      }
      let text_path_scale = get_font_size_for_path(font_size);
      const text_group = new fabric.Path(await get_text_svg_path(text_used, font_url), {
        lockRotation: true,
        lockMovementY: true,
        fill: color
      });
      let height = text_group.height * text_path_scale;
      let width = text_group.width * text_path_scale;
      if (WIDTH / width < 1) text_path_scale = (text_path_scale / width) * WIDTH;
      text_group.set({
        scaleX: text_path_scale,
        scaleY: text_path_scale
      });
      height = text_group.height * text_path_scale;
      width = text_group.width * text_path_scale;
      if (opts.top) text_group.set({ top: get_units(opts.top) });
      if (align === 'center')
        text_group.set({
          left: left + WIDTH_SPACING + (WIDTH - width) / 2
        });
      else if (align === 'left')
        text_group.set({
          left: left + WIDTH_SPACING
        });
      else if (align === 'right')
        text_group.set({
          left: right - WIDTH_SPACING - width
        });
      return [text_group, height, width] as [typeof text_group, number, number];
    };

    for (let i = 0; i < shloka_lines.length; i++) {
      const main_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, $image_script);
      const [text_main, height_main, width_main] = await render_text({
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
      const [text_norm, height_norm, width_norm] = await render_text({
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
      text_norm.set({
        top: top_pos - (height_norm + get_units($SPACE_ABOVE_REFERENCE_LINE))
      });
      text_main.set({
        top:
          top_pos -
          (height_main +
            $SPACE_BETWEEN_MAIN_AND_NORM +
            (height_norm + get_units($SPACE_ABOVE_REFERENCE_LINE)))
      });
      $canvas.add(text_main);
      $canvas.add(text_norm);
      if (i === shloka_lines.length - 1) {
        const number_main_text = main_text.split(' ').at(-1)!;
        const [number_indicator_main, height_indicator_main] = await render_text({
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

        const [number_indicator_norm] = await render_text({
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
          top: number_indicator_main.top + get_units(5) + height_indicator_main
        });
        $canvas.add(number_indicator_norm);
      }
    }

    // trans
    const trans_data = $image_trans_data.data!;
    if (trans_data.has($image_shloka)) {
      const trans_text_data = trans_data.get($image_shloka)!;
      const trans_text = new fabric.Textbox(trans_text_data, {
        textAlign: 'right',
        left: get_units(610),
        top: get_units(650),
        fill: 'hsla(44, 100%, 10%, 1)',
        fontFamily: trans_text_font_info.family,
        fontSize: get_units(shloka_config.trans_text_font_size) * trans_text_font_info.size,
        lockRotation: true,
        width: get_units(1250)
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
