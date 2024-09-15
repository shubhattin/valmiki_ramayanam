import { get, writable } from 'svelte/store';
import type * as fabric from 'fabric';
import { get_derived_query } from '@tools/query';
import { browser } from '$app/environment';
import { get_sarga_data, get_translations, QUERY_KEYS } from '@state/main_page/data';
import { createQuery } from '@tanstack/svelte-query';
import { queryClient } from '@state/query';
import background_image_url from './background_vr.png';
import background_image_template_url from './background_vr_template.jpg';

export let canvas = writable<fabric.Canvas>();
export let background_image = writable<fabric.FabricImage>();
export let shaded_background_image_status = writable(import.meta.env.DEV);
export let scaling_factor = writable<number>(0); // Scale factor for the background image
export let shloka_texts = writable<fabric.FabricText[]>();
export let trans_text = writable<fabric.Textbox>();

export const get_units = (value: number) => {
  return value * get(scaling_factor);
};

export async function set_background_image_type(shaded_image: boolean) {
  const $background_image = get(background_image);
  if (!$background_image) return;
  await $background_image.setSrc(
    shaded_image ? background_image_template_url : background_image_url
  );
  background_image.set($background_image);
  const $canvas = get(canvas);
  $canvas.requestRenderAll();
  canvas.set($canvas);
}

export let image_script = writable<string>('');
export let image_lang = writable<string>('English');
export let image_kANDa = writable<number>(0);
export let image_sarga = writable<number>(0);
// ^ kanda and sarga will be inherited from the main during mount
export let image_shloka = writable<number>(1);

export const image_sarga_data = get_derived_query(
  [image_kANDa, image_sarga],
  ([$image_kANDa, $image_sarga]) => {
    return createQuery(
      {
        queryKey: QUERY_KEYS.sarga_data($image_kANDa, $image_sarga),
        enabled: browser && $image_kANDa !== 0 && $image_sarga !== 0,
        placeholderData: [],
        queryFn: () => get_sarga_data($image_kANDa, $image_sarga)
      },
      queryClient
    );
  }
);
export const image_trans_data = get_derived_query(
  [image_kANDa, image_sarga, image_lang],
  ([$image_kANDa, $image_sarga, $image_lang]) => {
    return createQuery(
      {
        queryKey: QUERY_KEYS.trans_lang_data($image_lang, $image_kANDa, $image_sarga),
        enabled: browser && $image_kANDa !== 0 && $image_sarga !== 0,
        queryFn: () => get_translations($image_kANDa, $image_sarga, $image_lang)
      },
      queryClient
    );
  }
);
