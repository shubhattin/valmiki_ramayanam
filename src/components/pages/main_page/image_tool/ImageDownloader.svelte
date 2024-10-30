<script lang="ts">
  import { rAmAyaNam_map } from '~/state/main_page/data';
  import {
    image_kANDa,
    image_sarga,
    image_script,
    image_shloka,
    scaling_factor,
    canvas,
    set_background_image_type,
    shaded_background_image_status,
    background_image,
    IMAGE_DIMENSIONS,
    get_units,
    image_lang,
    image_rendering_state
  } from './state';
  import { download_file_in_browser } from '~/tools/download_file_browser';
  import JSZip from 'jszip';
  import { dataURLToBlob } from '~/tools/kry';
  import { popup } from '@skeletonlabs/skeleton';
  import { BsDownload } from 'svelte-icons-pack/bs';
  import Icon from '~/tools/Icon.svelte';
  import { render_all_texts } from './render_text';

  let kANDa_info = $derived(rAmAyaNam_map[$image_kANDa - 1]);
  let shloka_count = $derived(kANDa_info.sarga_data[$image_sarga - 1].shloka_count_extracted);

  const remove_background_image = async () => {
    $canvas.getObjects().forEach((obj) => {
      if (obj.type === 'image') $canvas.remove(obj);
    });
    $canvas.requestRenderAll();
  };
  const add_background_image = async () => {
    $canvas.add($background_image);
    $canvas.sendObjectToBack($background_image);
    $canvas.requestRenderAll();
  };
  const hide_lines = async () => {
    $canvas.getObjects().forEach((obj) => {
      if (obj.type === 'line') obj.set('visible', false);
    });
    $canvas.requestRenderAll();
  };
  const show_lines = async () => {
    $canvas.getObjects().forEach((obj) => {
      if (obj.type === 'line') obj.set('visible', true);
    });
    $canvas.requestRenderAll();
  };
  const download_image_as_png = async (
    remove_background: boolean,
    download = true,
    shloka_num: number | null = null,
    restore = true
  ) => {
    await hide_lines();
    if (remove_background) await remove_background_image();
    else if ($shaded_background_image_status) await set_background_image_type(false);

    const url = $canvas.toDataURL({
      format: 'png',
      multiplier: 1 / $scaling_factor
    });
    const name = `${$image_kANDa}-${$image_sarga} Shloka No. ${shloka_num ?? $image_shloka}${remove_background ? '' : ' (with background)'}.png`;
    if (download) download_file_in_browser(url, name);
    if (remove_background) await add_background_image();
    else if ($shaded_background_image_status && restore)
      await set_background_image_type($shaded_background_image_status);
    await show_lines();
    return {
      url,
      name
    };
  };
  const download_image_as_svg = async (download = true, shloka_num: number | null = null) => {
    await remove_background_image();
    await hide_lines();
    const svg_text = $canvas.toSVG({
      width: `${IMAGE_DIMENSIONS[0]}`,
      height: `${IMAGE_DIMENSIONS[1]}`,
      viewBox: {
        x: 0,
        y: 0,
        width: get_units(IMAGE_DIMENSIONS[0]),
        height: get_units(IMAGE_DIMENSIONS[1])
      }
    });
    const blob = new Blob([svg_text], { type: 'image/svg+xml' });
    const name = `${$image_kANDa}-${$image_sarga} Shloka No. ${shloka_num ?? $image_shloka}.svg`;
    if (download) {
      const svg_url = URL.createObjectURL(blob);
      download_file_in_browser(svg_url, name);
    }
    add_background_image();
    await show_lines();
    return {
      blob,
      name
    };
  };

  const download_png_zip = async (remove_back: boolean) => {
    const zip = new JSZip();
    $image_rendering_state = true;
    for (let i = -1; i <= shloka_count; i++) {
      await render_all_texts(i, $image_script, $image_lang);
      const { url, name } = await download_image_as_png(remove_back, false, i, false);
      const blob = dataURLToBlob(url);
      zip.file(name, blob);
    }
    await render_all_texts($image_shloka, $image_script, $image_lang);
    $image_rendering_state = false;
    const zip_blob = await zip.generateAsync({ type: 'blob' });
    download_file_in_browser(
      URL.createObjectURL(zip_blob),
      `${$image_kANDa}-${$image_sarga} PNG files${remove_back ? '' : ' (with background)'}.zip`
    );
    await set_background_image_type($shaded_background_image_status);
    // ^ restore the original state
  };
  const download_svg_zip = async () => {
    const zip = new JSZip();
    $image_rendering_state = true;
    for (let i = -1; i <= shloka_count; i++) {
      await render_all_texts(i, $image_script, $image_lang);
      const { blob, name } = await download_image_as_svg(false, i);
      zip.file(name, blob);
    }
    await render_all_texts($image_shloka, $image_script, $image_lang);
    $image_rendering_state = false;
    const zip_blob = await zip.generateAsync({ type: 'blob' });
    download_file_in_browser(
      URL.createObjectURL(zip_blob),
      `${$image_kANDa}-${$image_sarga} SVG files.zip`
    );
    // ^ restore the original state
  };
</script>

<button
  use:popup={{
    event: 'click',
    target: 'image_download',
    placement: 'bottom'
  }}
  ondblclick={() => download_image_as_png(true)}
  class="btn inline-flex rounded-lg p-1 text-sm"
>
  <Icon src={BsDownload} class="-mt-1 mr-1 text-2xl" />
</button>
<div class="card z-50 space-y-0 rounded-md p-1 shadow-xl" data-popup="image_download">
  <div class="flex items-center justify-center space-x-2">
    <button
      onclick={() => download_image_as_svg()}
      class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      SVG
    </button>
    <button
      onclick={() => download_image_as_png(true)}
      class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      PNG
    </button>
    <button
      onclick={() => download_image_as_png(false)}
      class="btn rounded-md p-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      PNG (with background)
    </button>
  </div>
  <div class="flex items-center justify-center space-x-2">
    <button
      onclick={() => download_svg_zip()}
      class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      SVG Zip
    </button>
    <button
      onclick={() => download_png_zip(true)}
      class="btn rounded-md p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      PNG Zip
    </button>
    <button
      onclick={() => download_png_zip(false)}
      class="btn rounded-md p-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      PNG Zip (with background)
    </button>
  </div>
</div>
