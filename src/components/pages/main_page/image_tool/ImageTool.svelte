<script lang="ts">
  import background_image from './background_vr.png';
  import { onMount } from 'svelte';
  import * as fabric from 'fabric';

  let canvas_element: HTMLCanvasElement;
  let canvas: fabric.Canvas;

  const DIMENSIONS = [1920, 1080]; // Background image dimensions
  const SCALING_FACTOR = 0.4; // Scale factor for the background image
  onMount(async () => {
    canvas = new fabric.Canvas(canvas_element, {
      width: DIMENSIONS[0] * SCALING_FACTOR,
      height: DIMENSIONS[1] * SCALING_FACTOR
      // backgroundImage: background_image
    });
    const img = await fabric.util.loadImage(background_image);
    const fabricImage = new fabric.Image(img, {
      originX: 'left',
      originY: 'top',
      scaleX: SCALING_FACTOR,
      scaleY: SCALING_FACTOR,
      // scaleX: canvas.width / img.width!,
      // scaleY: canvas.height / img.height!,
      selectable: false,
      evented: false
    });
    console.log([canvas.width, canvas.height], [img.width, img.height]);
    console.log([canvas.width / img.width!, canvas.height / img.height!]);

    // Add the image to the canvas
    canvas.add(fabricImage);
    canvas.renderAll();
  });
</script>

<!-- Canvas for rendering the background image and text -->
<canvas bind:this={canvas_element} class="mt-4"></canvas>
