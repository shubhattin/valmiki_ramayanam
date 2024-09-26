import { z } from 'zod';
import { get_units } from './state';
import * as fabric from 'fabric';

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
  top: z.number().optional(),
  bottom: z.number().optional(),
  width_usage_factor: z.number(),
  align: z.union([z.literal('left'), z.literal('right'), z.literal('center')]),
  multi_line_text: z.boolean().optional(),
  lockMovementY: z.boolean().optional(),
  lockMovementX: z.boolean().optional(),
  lockScalingX: z.boolean().optional(),
  lockScalingY: z.boolean().optional()
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
    multi_line_text,
    lockMovementX,
    lockMovementY,
    lockScalingX,
    lockScalingY
  } = render_text_args_schema.parse(opts);

  // load wasm based library
  const { get_text_svg_path } = await import('@tools/harfbuzz');

  const get_font_size_for_path = (font_size: number) => {
    const PATH_SCALING_FACTOR = 1 / 15.125;
    return get_units((font_size / 65) * PATH_SCALING_FACTOR);
  };

  const right = get_units(opts.right);
  const left = get_units(opts.left);
  const top = get_units(opts.top ?? 0);
  const bottom = get_units(opts.bottom ?? 0);
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
    lockMovementY: lockMovementY ?? true,
    lockMovementX: lockMovementX ?? true,
    lockScalingX: lockScalingX ?? true,
    lockScalingY: lockScalingY ?? true
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    text_path_scale = get_font_size_for_path(font_size * font_scale);
    if (!multi_line_text) await render_line(line);
    else {
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
      for (let iter = 0; true; iter++) {
        await render_multiple_line();
        if (HEIGHT / text_group.height >= 1) {
          console.log('correct', text_path_scale, font_scale);
          break;
        } else {
          console.log('height exceeded', HEIGHT / text_group.height, text_path_scale);
          text_path_scale = get_font_size_for_path(
            font_size * (font_scale - (iter + 1) * FONT_SCALE_STEP)
          );
          console.log('new scale', text_path_scale);
          text_group.removeAll();
        }
      }
    }
  }
  return text_group;
};
