import { writable } from 'svelte/store';

export const main_app_bar_info = writable<{
  title: string | null;
  className: string | null;
}>({
  title: null,
  className: null
});
