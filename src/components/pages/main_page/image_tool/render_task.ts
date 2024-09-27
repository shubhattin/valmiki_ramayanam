import { z } from 'zod';
import {
  get_units,
  image_lang,
  image_sarga_data,
  image_trans_data,
  main_text_font_configs,
  normal_text_font_config,
  trans_text_font_configs
} from './state';
import * as fabric from 'fabric';
import { get_text_svg_path } from '@tools/harfbuzz';
import {
  current_shloka_type,
  shloka_configs,
  SPACE_ABOVE_REFERENCE_LINE,
  SPACE_BETWEEN_MAIN_AND_NORM,
  TRANSLATION_BOUNDIND_COORDS,
  type shloka_type_config
} from './settings';
import { canvas } from './state';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import type { lang_list_extended_type, script_list_type } from '@tools/lang_list';
import { lipi_parivartak_async } from '@tools/converter';
import { get_font_url } from '@tools/font_tools';
import { BASE_SCRIPT } from '@state/main_page/main_state';

const render_text_args_schema = z.object({
  text: z.string(),
  font_url: z.string(),
  font_size: z.number(),
  font_scale: z.number(),
  color: z.string(),
  line_index: z.number().optional(),
  text_type: z.union([z.literal('main'), z.literal('normal')]).optional(),
  total_lines: z.number().optional(),
  left: z.number(),
  right: z.number(),
  top: z.number().optional().default(0),
  bottom: z.number().optional().default(0),
  width_usage_factor: z.number(),
  align: z.union([z.literal('left'), z.literal('right'), z.literal('center')]),
  multi_line_text: z.boolean().optional().default(false),
  lockMovementY: z.boolean().optional().default(true),
  lockMovementX: z.boolean().optional().default(true),
  lockScalingX: z.boolean().optional().default(true),
  lockScalingY: z.boolean().optional().default(true)
});

/**
 * This function will also set the left coordinate of the text.
 * left has to be set outside
 */
const render_text = async (input: z.input<typeof render_text_args_schema>) => {
  const opts = render_text_args_schema.parse(input);
  const {
    text,
    font_url,
    font_size,
    color,
    line_index,
    text_type,
    width_usage_factor,
    align,
    total_lines,
    multi_line_text,
    lockMovementX,
    lockMovementY,
    lockScalingX,
    lockScalingY
  } = opts;

  const get_font_size_for_path = (font_size: number) => {
    const PATH_SCALING_FACTOR = 1 / 15.125;
    return get_units((font_size / 65) * PATH_SCALING_FACTOR);
  };

  const right = get_units(opts.right);
  const left = get_units(opts.left);
  const top = get_units(opts.top);
  const bottom = get_units(opts.bottom);
  let font_scale = opts.font_scale;

  const WIDTH_ACTUAL = right - left;
  const WIDTH = WIDTH_ACTUAL * width_usage_factor;
  const WIDTH_SPACING = (WIDTH_ACTUAL - WIDTH) / 2;
  const HEIGHT_ACTUAL = bottom - top;
  const HEIGHT = HEIGHT_ACTUAL;

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

  const FONT_SCALE_STEP = 0.05;
  let text_path_scale: number = 0;
  const text_group = new fabric.Group([], {
    lockRotation: true,
    lockMovementY: lockMovementY,
    lockMovementX: lockMovementX,
    lockScalingX: lockScalingX,
    lockScalingY: lockScalingY
  });
  const lines = text_used.split('\n');
  let prev_height = 0;
  const NEW_LINE_SPACING = font_size;
  // ^ currenyly works fine for our case

  const render_line = async (line: string) => {
    const text_path = new fabric.Path(await get_text_svg_path(line, font_url), {
      fill: color
    });
    let height = text_path.height * text_path_scale;
    let width = text_path.width * text_path_scale;
    if (WIDTH / width < 1) text_path_scale = (text_path_scale / width) * WIDTH;
    text_path.set({
      scaleX: text_path_scale,
      scaleY: text_path_scale
    });
    height = text_path.height * text_path_scale;
    width = text_path.width * text_path_scale;
    if (opts.top) text_path.set({ top: get_units(opts.top + prev_height) });
    if (align === 'center')
      text_path.set({
        left: left + WIDTH_SPACING + (WIDTH - width) / 2
      });
    else if (align === 'left')
      text_path.set({
        left: left + WIDTH_SPACING
      });
    else if (align === 'right')
      text_path.set({
        left: right - WIDTH_SPACING - width
      });
    text_group.add(text_path);
    if (!multi_line_text) return;
    // console.log(prev_height, height);
    prev_height += height + NEW_LINE_SPACING;
  };

  for (let iter = 0; true; iter++) {
    prev_height = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      text_path_scale = get_font_size_for_path(font_size * (font_scale - iter * FONT_SCALE_STEP));
      if (!multi_line_text) {
        await render_line(line);
        break;
      } else {
        const words = line.split(' ');
        const render_multiple_line = async () => {
          let allowed_words: string[] = [];
          for (let word_i = 0; word_i < words.length; word_i++) {
            const word = words[word_i];
            let current_word =
              allowed_words.join(' ') + (allowed_words.length !== 0 ? ' ' : '') + word;
            const text_path = new fabric.Path(await get_text_svg_path(current_word, font_url), {
              fill: color
            });
            let height = text_path.height * text_path_scale;
            let width = text_path.width * text_path_scale;
            if (WIDTH > width) allowed_words.push(word);
            else {
              await render_line(allowed_words.join(' '));
              // new line should be started as the current word is not fitting
              allowed_words = [word];
            }
          }
          // last group of allowed words will rendered after done here
          if (allowed_words.length !== 0) await render_line(allowed_words.join(' '));
        };
        await render_multiple_line();
      }
    }
    if (!multi_line_text) break;
    else {
      if (HEIGHT / text_group.height >= 1) {
        break;
      } else {
        text_group.removeAll();
      }
    }
  }
  return text_group;
};
const draw_bounding_and_reference_lines = async (shloka_config: shloka_type_config) => {
  const bounds = shloka_config.bounding_coords;
  const $canvas = get(canvas);
  const $current_shloka_type = get(current_shloka_type);
  for (let line_coord of [
    [
      // the main area bounding box
      // x1 y1 x2 y2
      [bounds.left, bounds.top, bounds.left, bounds.bottom], // left line
      [bounds.right, bounds.top, bounds.right, bounds.bottom], // top line
      [bounds.left, bounds.top, bounds.right, bounds.top], // right line
      [bounds.left, bounds.bottom, bounds.right, bounds.bottom] // bottom line
    ],
    [
      // translation area bounding box
      [
        TRANSLATION_BOUNDIND_COORDS.left,
        TRANSLATION_BOUNDIND_COORDS.top,
        TRANSLATION_BOUNDIND_COORDS.left,
        TRANSLATION_BOUNDIND_COORDS.bottom
      ], // left line
      [
        TRANSLATION_BOUNDIND_COORDS.right,
        TRANSLATION_BOUNDIND_COORDS.top,
        TRANSLATION_BOUNDIND_COORDS.right,
        TRANSLATION_BOUNDIND_COORDS.bottom
      ], // top line
      [
        TRANSLATION_BOUNDIND_COORDS.left,
        TRANSLATION_BOUNDIND_COORDS.top,
        TRANSLATION_BOUNDIND_COORDS.right,
        TRANSLATION_BOUNDIND_COORDS.top
      ], // right line
      [
        TRANSLATION_BOUNDIND_COORDS.left,
        TRANSLATION_BOUNDIND_COORDS.bottom,
        TRANSLATION_BOUNDIND_COORDS.right,
        TRANSLATION_BOUNDIND_COORDS.bottom
      ] // bottom line
    ]
  ])
    for (let line_pos of line_coord)
      $canvas.add(
        new fabric.Line(
          [
            get_units(line_pos[0]),
            get_units(line_pos[1]),
            get_units(line_pos[2]),
            get_units(line_pos[3])
          ],
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
  // canvas.set($canvas); // not needed
  return shloka_config;
};

/**
 * Renders all text for the particular `shloka>sarga>Kanda`
 */
export const render_all_texts = async (
  $image_shloka: number,
  $image_script: script_list_type,
  $image_lang: lang_list_extended_type
) => {
  const $canvas = get(canvas);
  const $shloka_configs = get(shloka_configs);
  const $main_text_font_configs = get(main_text_font_configs);
  const $image_sarga_data = get(image_sarga_data);
  const $trans_text_font_configs = get(trans_text_font_configs);
  const $normal_text_font_config = get(normal_text_font_config);
  const $SPACE_ABOVE_REFERENCE_LINE = get(SPACE_ABOVE_REFERENCE_LINE);
  const $SPACE_BETWEEN_MAIN_AND_NORM = get(SPACE_BETWEEN_MAIN_AND_NORM);
  const $image_trans_data = get(image_trans_data);

  if (!browser) return $shloka_configs[2]; // just like has no meaning

  const main_text_font_info = $main_text_font_configs[$image_script];
  const trans_text_font_info = $trans_text_font_configs[$image_lang];
  const norm_text_font_info = $normal_text_font_config;

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
  current_shloka_type.set(shloka_lines.length as keyof typeof $shloka_configs);
  const shloka_config = $shloka_configs[get(current_shloka_type)];

  await draw_bounding_and_reference_lines(shloka_config);

  // shloka

  for (let i = 0; i < shloka_lines.length; i++) {
    const main_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, $image_script);
    const text_main_group = await render_text({
      text: main_text,
      font_url: get_font_url(main_text_font_info.key, 'bold'),
      font_size: shloka_config.main_text_font_size,
      font_scale: main_text_font_info.size,
      color: 'hsla(38, 100%, 15%, 1)',
      line_index: i,
      total_lines: shloka_lines.length,
      text_type: 'main',
      ...shloka_config.bounding_coords,
      width_usage_factor: 0.985,
      align: 'center'
    });
    const norm_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, 'Normal');
    const text_norm_group = await render_text({
      text: norm_text,
      font_url: get_font_url(norm_text_font_info.key, 'regular'),
      font_size: shloka_config.norm_text_font_size,
      font_scale: norm_text_font_info.size,
      color: 'hsla(44, 100%, 10%, 1)',
      line_index: i,
      total_lines: shloka_lines.length,
      text_type: 'normal',
      ...shloka_config.bounding_coords,
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
        font_size: 42,
        font_scale: main_text_font_info.size * 0.8,
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
        font_size: 28,
        font_scale: norm_text_font_info.size * 0.98,
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
      text: trans_text_data,
      align: 'right',
      color: 'hsla(44, 100%, 10%, 1)',
      font_url: get_font_url(trans_text_font_info.key, 'regular'),
      font_size: shloka_config.trans_text_font_size,
      font_scale: trans_text_font_info.size,
      ...TRANSLATION_BOUNDIND_COORDS,
      width_usage_factor: 0.985,
      multi_line_text: true,
      lockScalingX: false,
      lockScalingY: false,
      lockMovementX: false,
      lockMovementY: false
    });
    $canvas.add(trans_text);
  }
  $canvas.requestRenderAll();
  return shloka_config;
};
