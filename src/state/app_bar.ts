import { writable } from 'svelte/store';

export const main_app_bar_info = writable<{
  className: string | null;
  title: string | null;
}>({
  className: null,
  title: null
});
