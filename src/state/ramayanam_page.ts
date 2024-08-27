import { writable } from 'svelte/store';

export const kANDa_selected = writable(0);
export const sarga_selected = writable(0);

export const get_ramayanam_page_link = (kANDa: number, sarga: number | null = null) => {
  return `/${kANDa}${sarga ? `/${sarga}` : ''}`;
};
