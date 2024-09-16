<script lang="ts">
  import { onMount } from 'svelte';
  import * as fabric from 'fabric';
  import {
    canvas,
    background_image,
    scaling_factor,
    get_units,
    shaded_background_image_status,
    set_background_image_type,
    IMAGE_DIMENSIONS
  } from './state';
  import ImageOptions from './ImageOptions.svelte';
  import RenderText from './RenderText.svelte';

  let canvas_element: HTMLCanvasElement;
  let mounted = false;

  function update_scaling_factor() {
    // we can improve the method of calculating the scaling factor later on
    const availableWidth = window.innerWidth * 0.8;
    const availableHeight = window.innerHeight * 0.799;
    const scale = [availableWidth / IMAGE_DIMENSIONS[0], availableHeight / IMAGE_DIMENSIONS[1]];
    let min_value = Math.min(...scale);
    $scaling_factor = min_value;
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
      width: get_units(IMAGE_DIMENSIONS[0]),
      height: get_units(IMAGE_DIMENSIONS[1]),
      backgroundColor: 'transparent'
    });
    const img = await fabric.util.loadImage('');
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

    $canvas.requestRenderAll();
  };

  const update_canvas_dimensions = () => {
    if (!$canvas || !mounted) return;
    // Update canvas dimensions
    $canvas.setWidth(get_units(IMAGE_DIMENSIONS[0]));
    $canvas.setHeight(get_units(IMAGE_DIMENSIONS[1]));
    const prev_scaling_factor = $background_image.scaleX;
    // Scale background image
    $background_image.scaleX = $scaling_factor;
    $background_image.scaleY = $scaling_factor;
    // Update positions and scales of text objects
    $canvas.getObjects().forEach((obj) => {
      if (!obj || obj.type === 'image') return;
      // not yet working for Textbox
      const base_top = obj.get('top') / prev_scaling_factor;
      const base_left = obj.get('left') / prev_scaling_factor;
      const base_font_size = obj.get('fontSize') / prev_scaling_factor;
      const options: Record<string, any> = {
        left: get_units(base_left),
        top: get_units(base_top),
        fontSize: get_units(base_font_size)
      };
      if (obj.type === 'textbox') {
        const base_width = obj.get('width') / prev_scaling_factor;
        options['width'] = get_units(base_width);
      }
      obj.set(options);
      obj.setCoords(); // Update object's corner positions
    });
    $canvas.requestRenderAll();
  };
  $: mounted && $scaling_factor && update_canvas_dimensions();
  $: mounted && set_background_image_type($shaded_background_image_status);
</script>

<div class="space-y-2">
  <ImageOptions />
</div>
<div class="mt-4 space-y-2">
  <canvas bind:this={canvas_element}></canvas>
</div>
<RenderText {mounted} />
