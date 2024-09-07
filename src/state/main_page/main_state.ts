import { writable } from 'svelte/store';

export let kANDa_selected = writable(0);
export let sarga_selected = writable(0);

export let editing_status_on = writable(false);
export const BASE_SCRIPT = 'Sanskrit';

export let viewing_script = writable<string>();
export let trans_lang = writable<string>();

export let sanskrit_mode = writable<number>();
