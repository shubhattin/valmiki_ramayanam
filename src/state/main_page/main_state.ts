import { writable } from 'svelte/store';

export let kANDa_selected = writable(0);
export let sarga_selected = writable(0);

export const BASE_SCRIPT = 'Sanskrit';

export let viewing_script = writable<string>();
export let trans_lang = writable<string>();
export let view_translation_status = writable(false);

// Edit
export let editing_status_on = writable(false);
export let sanskrit_mode = writable<number>();

export let added_translations_indexes = writable<number[]>([]);
export let edited_translations_indexes = writable<Set<number>>(new Set());
export let edit_language_typer_status = writable<boolean>(true);
export let typing_assistance_modal_opened = writable(false);

export function get_text_font(lang: string) {
  if (['English', 'Normal'].includes(lang)) return '';
  return 'indic-font';
}
