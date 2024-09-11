<script lang="ts">
  import background_image from './background_vr.png';
  import { onMount } from 'svelte';
  import * as fabric from 'fabric';

  let canvas_element: HTMLCanvasElement;
  let canvas: fabric.Canvas;

  const DIMENSIONS = [1920, 1080]; // Background image dimensions
  let scaling_factor = 0; // Scale factor for the background image
  function updateScalingFactor() {
    // we can improve the method of calculating the scaling factor later on
    const availableWidth = window.innerWidth;
    scaling_factor = availableWidth / 2500;
  }

  onMount(() => {
    updateScalingFactor();
    window.addEventListener('resize', updateScalingFactor);
    const unsub_func = () => {
      window.removeEventListener('resize', updateScalingFactor);
    };
    paint_init_convas();
    return unsub_func;
  });
  const paint_init_convas = async () => {
    canvas = new fabric.Canvas(canvas_element, {
      width: DIMENSIONS[0] * scaling_factor,
      height: DIMENSIONS[1] * scaling_factor
      // backgroundImage: background_image
    });
    const img = await fabric.util.loadImage(background_image);
    const fabricImage = new fabric.Image(img, {
      originX: 'left',
      originY: 'top',
      scaleX: scaling_factor,
      scaleY: scaling_factor,
      // canvas.height / img.height -> basically provides us with scaling factor
      selectable: false,
      evented: false
    });

    // Add the image to the canvas
    canvas.add(fabricImage);
    canvas.renderAll();
  };
  $: canvas_element &&
    scaling_factor !== 0 &&
    (async () => {
      canvas.dispose();
      paint_init_convas();
      // this is a flickering effect but we will figure out a better way later on
    })();
</script>

<!-- Canvas for rendering the background image and text -->
<canvas bind:this={canvas_element} class="mt-4"></canvas>
