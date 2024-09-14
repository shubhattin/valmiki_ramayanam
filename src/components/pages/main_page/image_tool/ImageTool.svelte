<script lang="ts">
  import background_image_url from './background_vr.png';
  import { onMount } from 'svelte';
  import * as fabric from 'fabric';
  import {
    canvas,
    background_image,
    scaling_factor,
    sarga_texts,
    trans_texts,
    image_sarga_data,
    image_trans_data
  } from './state';
  import ImageOptions from './ImageOptions.svelte';
  import { load_font } from '@tools/font_tools';

  let canvas_element: HTMLCanvasElement;
  let mounted = false;

  const DIMENSIONS = [1920, 1080]; // Background image dimensions
  const INDIC_FONT_NAME = 'Nirmala UI';
  const ADOBE_DEVANGARI = 'AdobeDevanagari';

  const get_units = (value: number) => {
    return value * $scaling_factor;
  };

  function update_scaling_factor() {
    // we can improve the method of calculating the scaling factor later on
    const availableWidth = window.innerWidth;
    $scaling_factor = availableWidth / 2500;
  }
  onMount(() => {
    update_scaling_factor();
    window.addEventListener('resize', update_scaling_factor);
    const unsub_func = () => {
      window.removeEventListener('resize', update_scaling_factor);
    };
    paint_init_convas().then(() => {
      mounted = true;
    });
    return unsub_func;
  });
  const paint_init_convas = async () => {
    $canvas = new fabric.Canvas(canvas_element, {
      width: get_units(DIMENSIONS[0]),
      height: get_units(DIMENSIONS[1])
    });
    const img = await fabric.util.loadImage(background_image_url);
    $background_image = new fabric.Image(img, {
      originX: 'left',
      originY: 'top',
      scaleX: $scaling_factor,
      scaleY: $scaling_factor,
      // (canvas.height / img.height) -> basically provides us with scaling factor
      selectable: false,
      evented: false,
      selection: false
    });
    // Add the image to the canvas
    $canvas.add($background_image);
    (await get_all_texts()).forEach((text) => {
      $canvas.add(text);
    });
    $canvas.renderAll();
  };

  const update_canvas_dimensions = () => {
    if (!$canvas || !mounted) return;
    // Update canvas dimensions
    $canvas.setWidth(get_units(DIMENSIONS[0]));
    $canvas.setHeight(get_units(DIMENSIONS[1]));
    const prev_scaling_factor = $background_image.scaleX;
    // Scale background image
    $background_image.scaleX = $scaling_factor;
    $background_image.scaleY = $scaling_factor;
    // Update positions and scales of text objects
    $canvas.getObjects('text').forEach((obj, index) => {
      const base_top = obj.get('top') / prev_scaling_factor;
      const base_left = obj.get('left') / prev_scaling_factor;
      const base_font_size = obj.get('fontSize') / prev_scaling_factor;
      obj.set({
        left: get_units(base_left),
        top: get_units(base_top),
        fontSize: get_units(base_font_size)
      });
      obj.setCoords(); // Update object's corner positions
    });
    $canvas.renderAll();
  };
  $: mounted && $scaling_factor && update_canvas_dimensions();

  const get_all_texts = async () => {
    const texts: fabric.FabricText[] = [];

    // load necessary fonts
    await load_font(INDIC_FONT_NAME);
    await load_font(ADOBE_DEVANGARI);

    $sarga_texts = new fabric.Text('', {
      textAlign: 'center',
      left: get_units(400),
      top: get_units(600),
      fill: 'brown',
      fontFamily: INDIC_FONT_NAME,
      fontSize: get_units(50),
      lockRotation: true
    });
    $trans_texts = new fabric.Text('', {
      textAlign: 'center',
      left: get_units(650),
      top: get_units(300),
      fill: 'brown',
      fontFamily: ADOBE_DEVANGARI,
      fontSize: get_units(120),
      lockRotation: true
    });
    texts.push($sarga_texts);
    texts.push($trans_texts);
    return texts;
  };

  $: mounted &&
    $image_sarga_data.length !== 0 &&
    (() => {
      $sarga_texts.set('text', $image_sarga_data[0].split('\n')[0]);
      $sarga_texts.setCoords();
      $canvas.renderAll();
    })();
</script>

<div class="space-y-2">
  <ImageOptions />
</div>
<div class="mt-4 space-y-2">
  <canvas bind:this={canvas_element}></canvas>
</div>
