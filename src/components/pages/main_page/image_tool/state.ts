import { writable } from 'svelte/store';
import type * as fabric from 'fabric';

export let canvas = writable<fabric.Canvas>();
export let background_image = writable<fabric.FabricImage>();

export let image_script = writable<string>('');
export let image_lang = writable<string>('');
export let image_kANDa = writable<number>(0);
export let image_sarga = writable<number>(0);
export let image_shloka = writable<number>(0);
