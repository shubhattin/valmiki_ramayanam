<script lang="ts">
  import background_image_url from './background_vr.png';
  import { onMount } from 'svelte';
  import * as fabric from 'fabric';
  import { canvas, background_image, scaling_factor } from './state';
  import ImageOptions from './ImageOptions.svelte';
  import { load_font } from '@tools/font_tools';

  let canvas_element: HTMLCanvasElement;

  const DIMENSIONS = [1920, 1080]; // Background image dimensions
  const INDIC_FONT_NAME = 'Nirmala UI';
  const ADOBE_DEVANGARI = 'AdobeDevanagari';

  const get_units = (value: number) => {
    return value * $scaling_factor;
  };

  function updateScalingFactor() {
    // we can improve the method of calculating the scaling factor later on
    const availableWidth = window.innerWidth;
    $scaling_factor = availableWidth / 2500;
  }

  let mounted = false;
  onMount(() => {
    updateScalingFactor();
    window.addEventListener('resize', updateScalingFactor);
    const unsub_func = () => {
      window.removeEventListener('resize', updateScalingFactor);
    };
    mounted = true;
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
    await load_font(INDIC_FONT_NAME);
    await load_font(ADOBE_DEVANGARI);
    const text = new fabric.Text('कॄदृष्ट्वा कॣ कॢ युद्ध्या द्यु द्य ऽ 1', {
      textAlign: 'center',
      left: get_units(400),
      top: get_units(600),
      fill: 'brown',
      fontFamily: INDIC_FONT_NAME,
      fontSize: get_units(100),
      lockRotation: true
    });
    $canvas.add(text);
    const text1 = new fabric.Text('कॄदृष्ट्वा कॣ कॢ युद्ध्या द्यु द्य ऽ 2', {
      textAlign: 'center',
      left: get_units(650),
      top: get_units(400),
      fill: 'brown',
      fontFamily: ADOBE_DEVANGARI,
      fontSize: get_units(100),
      lockRotation: true
    });
    $canvas.add(text1);
    $canvas.renderAll();
  };
  $: canvas_element &&
    $scaling_factor !== 0 &&
    (async () => {
      if ($canvas) $canvas.dispose();
      await paint_init_convas();
      // this is a flickering effect but we will figure out a better way later on
    })();
</script>

<div class="space-y-2">
  <ImageOptions />
</div>
<div class="mt-4 space-y-2">
  <canvas bind:this={canvas_element}></canvas>
</div>
