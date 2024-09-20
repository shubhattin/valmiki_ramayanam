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
    IMAGE_DIMENSIONS,
    image_kANDa,
    image_sarga,
    image_script,
    image_lang,
    image_shloka,
    image_sarga_data
  } from './state';
  import ImageUtility from './ImageUtility.svelte';
  import { get, writable } from 'svelte/store';
  import {
    sarga_selected,
    kANDa_selected,
    viewing_script,
    trans_lang,
    get_script_for_lang
  } from '@state/main_page/main_state';
  import { get_kANDa_names, get_sarga_names, rAmAyaNam_map } from '@state/main_page/data';
  import Select from '@components/Select.svelte';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { get_text_font } from '@tools/font_tools';
  import { z } from 'zod';
  import { SCRIPT_LIST } from '@tools/lang_list';

  let mounted = writable(false);

  // in our case we dont need to initialize inside of onMount
  $image_kANDa = $kANDa_selected;
  $image_sarga = $sarga_selected;
  $image_script = $viewing_script;
  if ($trans_lang !== '--') $image_lang = $trans_lang;

  onMount(() => {
    update_scaling_factor();
    window.addEventListener('resize', update_scaling_factor);
    const unsub_func = () => {
      window.removeEventListener('resize', update_scaling_factor);
    };
    paint_init_convas().then(() => {
      $mounted = true;
    });
    return unsub_func;
  });

  let kANDa_names: string[] = [];
  $: get_kANDa_names($image_script).then((names) => (kANDa_names = names));
  let sarga_names: string[] = [];
  $: get_sarga_names($image_kANDa, $image_script).then((names) => (sarga_names = names));

  $: if ($image_kANDa && get(mounted)) {
    // ^ accessing writable's value without $ wont trigger it on change
    $image_sarga = 1;
    $image_shloka = 1;
  }
  $: $image_script = get_script_for_lang($image_lang);

  $: if ($image_sarga) {
    $image_shloka = 1;
    // reset after change
  }

  $: sarga_loading = $image_sarga_data.isFetching || !$image_sarga_data.isSuccess;

  let canvas_element: HTMLCanvasElement;

  function update_scaling_factor() {
    // we can improve the method of calculating the scaling factor later on
    const availableWidth = window.innerWidth * 0.8;
    const availableHeight = window.innerHeight * 0.799;
    const scale = [availableWidth / IMAGE_DIMENSIONS[0], availableHeight / IMAGE_DIMENSIONS[1]];
    let min_value = Math.min(...scale);
    $scaling_factor = min_value;
  }

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
      const type = obj.type;
      if (!obj || type === 'image') return;
      // not yet working for Textbox
      let options: Record<string, any> = {};
      if (['text', 'textbox'].includes(obj.type)) {
        const base_top = obj.get('top') / prev_scaling_factor;
        const base_left = obj.get('left') / prev_scaling_factor;
        const base_font_size = obj.get('fontSize') / prev_scaling_factor;
        options = {
          left: get_units(base_left),
          top: get_units(base_top),
          fontSize: get_units(base_font_size)
        };
        if (type === 'textbox') {
          const base_width = obj.get('width') / prev_scaling_factor;
          options['width'] = get_units(base_width);
        }
      } else if (type === 'line') {
        const base_x1 = obj.get('x1') / prev_scaling_factor;
        const base_y1 = obj.get('y1') / prev_scaling_factor;
        const base_x2 = obj.get('x2') / prev_scaling_factor;
        const base_y2 = obj.get('y2') / prev_scaling_factor;
        const stroke_width = obj.get('strokeWidth') / prev_scaling_factor;
        options = {
          x1: get_units(base_x1),
          y1: get_units(base_y1),
          x2: get_units(base_x2),
          y2: get_units(base_y2),
          strokeWidth: get_units(stroke_width)
        };
      } else if (type === 'path') {
        const base_left = obj.get('left') / prev_scaling_factor;
        const base_top = obj.get('top') / prev_scaling_factor;
        const base_scaleX = obj.get('scaleX') / prev_scaling_factor;
        const base_scaleY = obj.get('scaleY') / prev_scaling_factor;
        options = {
          left: get_units(base_left),
          top: get_units(base_top),
          scaleX: get_units(base_scaleX),
          scaleY: get_units(base_scaleY)
        };
      }
      obj.set(options);
      obj.setCoords(); // Update object's corner positions
    });
    $canvas.requestRenderAll();
  };
  $: $mounted && $scaling_factor && update_canvas_dimensions();
  $: $mounted && set_background_image_type($shaded_background_image_status);
</script>

<div class="space-y-2">
  <div class="space-x-2 text-sm">
    <select class="select inline-block w-36 p-1 text-sm" bind:value={$image_script}>
      {#each SCRIPT_LIST as lang (lang)}
        <option value={lang}>{lang === 'Sanskrit' ? 'Devanagari' : lang}</option>
      {/each}
    </select>
    <Select
      class={`${get_text_font($image_lang)} select inline-block w-36 p-1 text-sm`}
      disabled={sarga_loading}
      zodType={z.coerce.number().int()}
      bind:value={$image_kANDa}
      options={kANDa_names.map((name, index) => ({
        value: index + 1,
        text: `${index + 1} ${name}`
      }))}
    />
    <div class="inline-block space-x-1">
      <button
        class="btn m-0 p-0"
        disabled={$image_sarga === 1 || sarga_loading}
        on:click={() => ($image_sarga -= 1)}
      >
        <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
      </button>
      <Select
        class={`${get_text_font($viewing_script)} select inline-block w-40 p-1 text-sm`}
        zodType={z.coerce.number().int()}
        disabled={sarga_loading}
        bind:value={$image_sarga}
        options={sarga_names.map((name, index) => ({
          value: index + 1,
          text: `${index + 1} ${name}`
        }))}
      />
      <button
        class="btn m-0 p-0"
        on:click={() => ($image_sarga += 1)}
        disabled={$image_sarga === rAmAyaNam_map[$image_kANDa - 1].sarga_count || sarga_loading}
      >
        <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
      </button>
    </div>
  </div>
  <ImageUtility mounted={$mounted} />
</div>
<div class="mt-4 space-y-2">
  <canvas bind:this={canvas_element}></canvas>
</div>
