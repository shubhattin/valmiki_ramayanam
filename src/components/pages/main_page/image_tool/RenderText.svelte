<script lang="ts">
  import { load_font, FONT_NAMES } from '@tools/font_tools';
  import {
    shloka_texts,
    canvas,
    image_sarga_data,
    image_shloka,
    image_script,
    get_units,
    image_trans_data,
    trans_text,
    image_lang,
    image_kANDa,
    image_sarga
  } from './state';
  import * as fabric from 'fabric';
  import { lipi_parivartak_async } from '@tools/converter';
  import { BASE_SCRIPT } from '@state/main_page/main_state';

  export let mounted: boolean;

  const render_all_texts = async () => {
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
    $image_script &&
    $image_lang &&
    (async () => {
      $image_shloka;
      // ^ accessing its value to trigger upadte on change
      await render_all_texts();
    })();
</script>
