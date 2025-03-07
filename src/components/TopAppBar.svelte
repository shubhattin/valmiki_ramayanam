<script lang="ts">
  import { AppBar, Popover } from '@skeletonlabs/skeleton-svelte';
  import ThemeChanger from './ThemeChanger.svelte';
  import Icon from '~/tools/Icon.svelte';
  import { SiGithub } from 'svelte-icons-pack/si';
  import { ContributeIcon, SiConvertio } from './icons';
  import { AiOutlineMenu } from 'svelte-icons-pack/ai';
  import { YoutubeIcon } from '~/components/icons';
  import { page } from '$app/stores';
  import { PAGE_TITLES } from '~/state/page_titles';
  import { pwa_event_triggerer, pwa_install_event_fired } from '~/state/main';
  import { OiDownload24 } from 'svelte-icons-pack/oi';
  import { BiArrowBack } from 'svelte-icons-pack/bi';

  type Props = {
    start?: import('svelte').Snippet;
    headline?: import('svelte').Snippet;
    end?: import('svelte').Snippet;
  };

  let { start, headline, end }: Props = $props();

  let route_id = $derived($page.route.id as keyof typeof PAGE_TITLES);
  let support_modal_status = $state(false);

  let app_bar_popover_status = $state(false);

  const preload_component = () => import('~/components/pages/main_page/SupportOptions.svelte');
</script>

<AppBar>
  {#snippet lead()}
    {@render start?.()}
    {#if route_id !== '/(main)/[[kANDa]]/[[sarga]]'}
      <a class="mr-2 text-xl" href="/" title="श्रीरामायणम्">
        <Icon
          src={BiArrowBack}
          class="-mt-1 mr-1 text-2xl hover:fill-blue-600 dark:hover:fill-sky-500"
        />
      </a>
    {/if}
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
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
      onclick={() => {
        support_modal_status = true;
      }}
      onmouseover={preload_component}
      onfocus={preload_component}
      class="btn m-0 rounded-md px-1 py-1 font-semibold outline-hidden select-none hover:bg-gray-200 sm:px-2 dark:hover:bg-gray-700"
    >
      <Icon src={ContributeIcon} class="text-3xl" />
      <span class="hidden text-sm sm:inline">Support Our Projects</span>
    </span>
    {#if route_id !== '/convert'}
      <div class="space-x-2">
        <a class="text-xl" href="/convert" title="Lipi Parivartak">
          <Icon
            src={SiConvertio}
            class="text-2xl hover:fill-emerald-600 dark:hover:fill-zinc-400"
          />
        </a>
      </div>
    {/if}
    <Popover
      open={app_bar_popover_status}
      onOpenChange={(e) => (app_bar_popover_status = e.open)}
      positioning={{ placement: 'bottom' }}
      arrow={false}
      contentBase="card z-50 space-y-2 rounded-lg px-3 py-2 shadow-xl bg-surface-100-900"
      triggerBase="btn m-0 p-0 gap-0 outline-hidden select-none"
    >
      {#snippet trigger()}
        <Icon
          src={AiOutlineMenu}
          class="text-3xl hover:text-gray-500 active:text-blue-600 dark:hover:text-gray-400 dark:active:text-blue-400"
        />
      {/snippet}
      {#snippet content()}
        <a
          href="/convert"
          class="group flex space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Icon
            src={SiConvertio}
            class="text-2xl group-hover:fill-emerald-600 dark:group-hover:fill-zinc-400"
          />
          <span>Lipi Parivartak</span>
        </a>
        <!-- <a
        href="/excel_tool"
        class="flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
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
          class="flex space-x-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          onclick={() => (app_bar_popover_status = false)}
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
        {#if $pwa_install_event_fired}
          <button
            class="will-close gap-1 px-2 py-1 text-sm outline-hidden select-none"
            onclick={async () => {
              if ($pwa_install_event_fired) await $pwa_event_triggerer.prompt();
            }}
          >
            <Icon src={OiDownload24} class="-mt-1 text-base" />
            Install
          </button>
        {/if}
        <div class="wont-close flex space-x-3 rounded-md px-2 py-1">
          <span class="mt-1">Set Theme</span>
          <ThemeChanger />
        </div>
      {/snippet}
    </Popover>
  {/snippet}
</AppBar>

<!-- <Modal bind:modal_open={support_modal_status}>
  {#await preload_component() then SupportOptions}
    <SupportOptions.default />
  {/await}
</Modal> -->
