<script lang="ts">
  import background_image from './background_vr.png';
  import { onMount } from 'svelte';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import * as fabric from 'fabric';
  import { writable } from 'svelte/store';

  let canvas_element: HTMLCanvasElement;
  let canvas = writable<fabric.Canvas>();

  const DIMENSIONS = [1920, 1080]; // Background image dimensions
  let scaling_factor = writable<number>(0); // Scale factor for the background image

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
      // backgroundImage: background_image
    });
    const img = await fabric.util.loadImage(background_image);
    const fabricImage = new fabric.Image(img, {
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
    $canvas.add(fabricImage);

    const rect = new fabric.Rect({
      left: get_units(100),
      top: get_units(100),
      fill: 'red',
      width: get_units(400),
      height: get_units(200)
    });
    $canvas.add(rect);
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

<button
  on:click={() => {
    const URL = $canvas.toDataURL({
      format: 'jpeg',
      quality: 1,
      multiplier: 1 / $scaling_factor
    });
    download_file_in_browser(URL, 'image.jpeg');
  }}>Down</button
>
<div class="mt-4 space-y-2">
  <canvas bind:this={canvas_element}></canvas>
</div>
