import type { lang_list_type, script_list_type } from '@tools/lang_list';
import { writable } from 'svelte/store';

export let kANDa_selected = writable(0);
export let sarga_selected = writable(0);

export const BASE_SCRIPT = 'Devanagari';

export let viewing_script = writable<script_list_type>(BASE_SCRIPT);
export let trans_lang = writable<lang_list_type | '--'>();
export let view_translation_status = writable(false);

// Edit
export let editing_status_on = writable(false);
export let sanskrit_mode = writable<number>();

export let added_translations_indexes = writable<number[]>([]);
export let edited_translations_indexes = writable<Set<number>>(new Set());
export let edit_language_typer_status = writable<boolean>(true);
export let typing_assistance_modal_opened = writable(false);

export let image_tool_opened = writable(false);
export let ai_tool_opened = writable(false);
