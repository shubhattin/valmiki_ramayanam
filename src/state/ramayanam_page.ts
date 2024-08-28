import { writable } from 'svelte/store';

export const kANDa_selected = writable(0);
export const sarga_selected = writable(0);
export const still_setting_kanda_sarga = writable(true);
// using it to prevent the page from setting 2 times
// the first when kANDa is set and the second when sarga is set

export const get_ramayanam_page_link = (kANDa: number, sarga: number | null = null) => {
  return `/${kANDa}${sarga ? `/${sarga}` : ''}`;
};
