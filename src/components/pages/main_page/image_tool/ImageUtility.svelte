<script lang="ts">
  import {
    image_kANDa,
    image_sarga,
    image_script,
    image_shloka,
    canvas,
    image_sarga_data,
    image_trans_data,
    get_units
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
  import { scale } from 'svelte/transition';

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
            stroke: 'hsl(215, 40%, 60%)',
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
            stroke: 'brown',
            strokeWidth: get_units(2),
            selectable: false,
            evented: false
          }
        )
      );
    }
    return shloka_config;
  };
  const render_all_texts = async ($image_shloka: number, $image_script: string) => {
    if (!browser) return $shloka_configs[2]; // just like has no meaning
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
    const CHAR_LIMIT = 45;

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
        //   if (line.length > CHAR_LIMIT) {
        //     const words = line.split(' ');
        //     let new_line = '';
        //     for (let j = 0; j < words.length; j++) {
        //       if (new_line.length + words[j].length > CHAR_LIMIT) {
        //         new_shloka_lines.push(new_line);
        //         new_line = words[j];
        //       } else {
        //         new_line += ' ' + words[j];
        //       }
        //     }
        //     new_shloka_lines.push(new_line);
        //   } else
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
    const WIDTH_ACTUAL = get_units(
      (shloka_config.bounding_coords.right - shloka_config.bounding_coords.left) * 1.0
    );
    const WIDTH = WIDTH_ACTUAL * 0.985;
    const HEIGHT_ACTUAL = get_units(
      (shloka_config.bounding_coords.bottom - shloka_config.bounding_coords.top) * 1.0
    );

    // shloka
    /**
     * This function will also set the left coordinate of the text.
     * left has to be set outside
     */
    const render_text = async (
      text: string,
      font_url: string,
      font_size: number,
      color: string,
      line_index: number,
      text_type: 'main' | 'normal'
    ) => {
      let text_path_scale = get_font_size_for_path(font_size);
      const text_group = new fabric.Group([], {
        lockRotation: true,
        lockMovementY: true
      });
      const words = text.split(' ');
      let left_cord = 0;
      const SPACE_WIDTH = 200;
      const render_word = async (word: string) => {
        if (word === '') return;
        const path = await get_text_svg_path(word, font_url);
        const text_path = new fabric.Path(path, {
          fill: color,
          lockRotation: true,
          lockMovementY: true,
          left: left_cord
          // do not add `top` in this
        });
        const width = text_path.width;
        left_cord += width + SPACE_WIDTH;
        text_group.add(text_path);
      };
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word === '') continue;
        if (line_index === shloka_lines.length - 1 && i === words.length - 1) {
          if (text_type === 'main') await render_word(word[0]); // only the pUrNa virAma
        } else await render_word(word);
      }
      let height = text_group.height * text_path_scale; // already scaled
      let width = text_group.width * text_path_scale; // already scaled
      if (WIDTH / width < 1) text_path_scale = (text_path_scale / width) * WIDTH;
      text_group.set({
        scaleX: text_path_scale,
        scaleY: text_path_scale
      });
      height = text_group.height * text_path_scale;
      width = text_group.width * text_path_scale;
      text_group.set({
        left:
          get_units(shloka_config.bounding_coords.left) +
          (WIDTH_ACTUAL - WIDTH) / 2 +
          (WIDTH - width) / 2
      });
      return [text_group, height, width] as [typeof text_group, number, number];
    };
    for (let i = 0; i < shloka_lines.length; i++) {
      const main_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, $image_script);
      const [text_main_group, height_main, width_main] = await render_text(
        main_text,
        get_font_url($image_script === 'Sanskrit' ? 'ADOBE_DEVANAGARI' : 'NIRMALA_UI', 'bold'),
        shloka_config.main_text_font_size,
        '#4f3200',
        i,
        'main'
      );
      const norm_text = await lipi_parivartak_async(shloka_lines[i], BASE_SCRIPT, 'Normal');
      const [text_norm_group, height_norm, width_norm] = await render_text(
        norm_text,
        get_font_url('ADOBE_DEVANAGARI', 'regular'),
        shloka_config.norm_text_font_size,
        '#352700',
        i,
        'normal'
      );
      const top_pos = get_units(
        shloka_config.reference_lines.top + i * shloka_config.reference_lines.spacing
      );
      text_norm_group.set({
        top: top_pos - (height_norm + get_units($SPACE_ABOVE_REFERENCE_LINE))
      });
      text_main_group.set({
        top:
          top_pos -
          (height_main +
            $SPACE_BETWEEN_MAIN_AND_NORM +
            (height_norm + get_units($SPACE_ABOVE_REFERENCE_LINE)))
      });
      $canvas.add(text_main_group);
      $canvas.add(text_norm_group);
      if (i === shloka_lines.length - 1) {
        const render_number_text = async (
          text: string,
          font_url: string,
          font_size: number,
          color: string,
          text_type: 'main' | 'normal'
        ) => {
          const text_number_scale = get_font_size_for_path(font_size);
          let final_text = text_type === 'normal' ? text : text.slice(1, text.length - 1);
          const text_number = new fabric.Path(await get_text_svg_path(final_text, font_url), {
            fill: color,
            scaleX: text_number_scale,
            scaleY: text_number_scale,
            lockRotation: true
          });
          const width = text_number.width * text_number_scale;
          const height = text_number.height * text_number_scale;
          text_number.set({
            left: get_units(shloka_config.bounding_coords.right - 8) - width
          });
          return [text_number, height, width] as [typeof text_number, number, number];
        };
        const [text_number_main, height_main, width_main] = await render_number_text(
          main_text.split(' ').at(-1)!,
          get_font_url('ADOBE_DEVANAGARI', 'bold'),
          40,
          'hsla(37, 80%, 25%, 0.8)',
          'main'
        );
        text_number_main.set({
          top: get_units(shloka_config.bounding_coords.top + 8)
        });
        $canvas.add(text_number_main);

        const [text_number_normal] = await render_number_text(
          norm_text.split(' ').at(-1)!,
          get_font_url('ADOBE_DEVANAGARI', 'bold'),
          35,
          'hsla(37, 90%, 30%, 0.9)',
          'normal'
        );
        text_number_normal.set({
          top: get_units(shloka_config.bounding_coords.top + 8 + 5) + height_main
        });
        $canvas.add(text_number_normal);
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
        fill: '#352700',
        fontFamily: FONT_FAMILY_NAME.ADOBE_DEVANAGARI,
        fontSize: get_units(shloka_config.trans_text_font_size),
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
    (async () => {
      await render_all_texts($image_shloka, $image_script);
    })();
</script>

<ImageOptions {render_all_texts} />
