<script lang="ts">
  import { AppBar, popup } from '@skeletonlabs/skeleton';
  import type { PopupSettings } from '@skeletonlabs/skeleton';
  import ThemeChanger from './ThemeChanger.svelte';
  import Icon from '~/tools/Icon.svelte';
  import { SiGithub } from 'svelte-icons-pack/si';
  import { SiConvertio } from './icons';
  import { AiOutlineMenu } from 'svelte-icons-pack/ai';
  import { YoutubeIcon } from '~/components/icons';
  import { page } from '$app/stores';
  import { PAGE_TITLES } from '~/state/page_titles';

  type Props = {
    start?: import('svelte').Snippet;
    headline?: import('svelte').Snippet;
    end?: import('svelte').Snippet;
  };

  let { start, headline, end }: Props = $props();

  let route_id = $derived($page.route.id as keyof typeof PAGE_TITLES);

  const app_menu_popup: PopupSettings = {
    event: 'click',
    target: 'app_bar_menu',
    placement: 'left-end',
    closeQuery: '.will-close'
  };
</script>

<AppBar>
  {#snippet lead()}
    {@render start?.()}
    <!-- {#if page_url !== '/'}
        <a class="mr-2 text-xl" href="/" title="श्रीरामायणम्">
          <Icon
            src={BiArrowBack}
            class="-mt-1 mr-1 text-2xl hover:fill-blue-600 dark:hover:fill-sky-500"
          />
        </a>
      {/if} -->
    {@render headline?.()}
    {#if route_id in PAGE_TITLES}
      <span class={PAGE_TITLES[route_id as keyof typeof PAGE_TITLES][1]}>
        {PAGE_TITLES[route_id as keyof typeof PAGE_TITLES][0]}
      </span>
    {/if}
  {/snippet}
  <!-- <svelte:fragment slot="headline">
		<slot name="headline"><span></span></slot>
	</svelte:fragment> -->
  {#snippet trail()}
    {@render end?.()}
    <div class="space-x-2">
      {#if route_id !== '/convert'}
        <a class="text-xl" href="/convert" title="Lipi Parivartak">
          <Icon
            src={SiConvertio}
            class="text-2xl hover:fill-emerald-600 dark:hover:fill-zinc-400"
          />
        </a>
      {/if}
    </div>
    <button class="btn m-0 p-0" use:popup={app_menu_popup} title="App Menu">
      <Icon
        src={AiOutlineMenu}
        class="text-3xl hover:text-gray-500 active:text-blue-600 dark:hover:text-gray-400 dark:active:text-blue-400"
      />
    </button>
    <div class="card z-50 space-y-2 rounded-lg px-3 py-2 shadow-xl" data-popup="app_bar_menu">
      <a
        href="/convert"
        class="will-close group flex space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon
          src={SiConvertio}
          class="text-2xl group-hover:fill-emerald-600 dark:group-hover:fill-zinc-400"
        />
        <span>Lipi Parivartak</span>
      </a>
      <!-- <a
        href="/excel_tool"
        class="will-close flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon
          src={RiDocumentFileExcel2Line}
          class="-mt-1 text-xl text-green-600 dark:text-green-400"
        />
        <span>Excel File Transliterator</span>
      </a> -->
      <a
        href="https://www.youtube.com/c/thesanskritchannel"
        target="_blank"
        rel="noopener noreferrer"
        class="will-close flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon src={YoutubeIcon} class="mt-0 text-2xl text-[red]" />
        <span>The Sanskrit Channel</span>
      </a>
      <a
        href="https://github.com/shubhattin/valmiki_ramayanam"
        target="_blank"
        rel="noopener noreferrer"
        class="will-close group flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon
          src={SiGithub}
          class="-mt-1 mr-1 text-2xl group-hover:fill-indigo-700 dark:group-hover:fill-zinc-400"
        />
        <span>Project's Github Page</span>
      </a>
      <div class="wont-close flex space-x-3 rounded-md px-2 py-1">
        <span class="mt-1">Set Theme</span>
        <ThemeChanger />
      </div>
    </div>
  {/snippet}
</AppBar>
