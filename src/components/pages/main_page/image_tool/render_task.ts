import { z } from 'zod';
import { get_units } from './state';
import * as fabric from 'fabric';

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
  align: z.union([z.literal('left'), z.literal('right'), z.literal('center')]),
  multi_line_text: z.boolean().optional()
});
/**
 * This function will also set the left coordinate of the text.
 * left has to be set outside
 *
 * returns `[text_group, height, width]`
 */
export const render_text = async (opts: z.infer<typeof render_text_args_schema>) => {
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
    multi_line_text
  } = render_text_args_schema.parse(opts);

  // load wasm based library
  const { get_text_svg_path } = await import('@tools/harfbuzz');

  const get_font_size_for_path = (font_size: number) => {
    const PATH_SCALING_FACTOR = 1 / 15.125;
    return get_units((font_size / 65) * PATH_SCALING_FACTOR);
  };

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
  const text_group = new fabric.Group([], {
    lockRotation: true,
    lockMovementY: true,
    lockMovementX: true,
    lockScalingX: true,
    lockScalingY: true
  });
  const lines = text_used.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
    if (opts.top) text_path.set({ top: get_units(opts.top) });
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
    if (!multi_line_text) break;
  }
  return text_group;
};
