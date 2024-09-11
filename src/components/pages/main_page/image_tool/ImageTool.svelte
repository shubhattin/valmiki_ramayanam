<script lang="ts">
  import background_image from './background_vr.png';
  import { onMount } from 'svelte';
  import { Canvas } from 'fabric';

  let canvas_element: HTMLCanvasElement;
  let canvas: Canvas;

  const DIMENSIONS = [1920, 1080]; // Background image dimensions
  const SCALING_FACTOR = 0.4; // Scale factor for the background image
  onMount(async () => {
    console.log(canvas_element);
    canvas = new Canvas(canvas_element, {
      width: DIMENSIONS[0] * SCALING_FACTOR,
      height: DIMENSIONS[1] * SCALING_FACTOR,
      backgroundColor: 'white'
      // backgroundImage: background_image
    });
    canvas.renderAll();
  });
</script>

<!-- Canvas for rendering the background image and text -->
<canvas bind:this={canvas_element} class="h-[80vh] w-[70vw]"></canvas>
