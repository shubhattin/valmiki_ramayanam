<script lang="ts">
  import { rAmAyaNam_map, sarga_data, trans_en_data } from '@state/main_page/data';
  import { BASE_SCRIPT, kANDa_selected, sarga_selected } from '@state/main_page/main_state';
  import Icon from '@tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { writable } from 'svelte/store';
  import base_prompts from './base_prompt.yaml';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { client_q, type client } from '@api/client';
  import { lipi_parivartak_async } from '@tools/converter';
  import { get_possibily_not_undefined } from '@tools/kry';
  import { onMount } from 'svelte';
  import { loadLocalConfig } from '../load_local_config';
  import { BsDownload } from 'svelte-icons-pack/bs';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { cl_join } from '@tools/cl_join';

  $: kANDa_info = rAmAyaNam_map[$kANDa_selected - 1];
  $: sarga_info = kANDa_info.sarga_data[$sarga_selected - 1];
  $: shloka_count = sarga_info.shloka_count_extracted;

  onMount(async () => {
    if (import.meta.env.DEV) {
      const conf = await loadLocalConfig();
      if (conf.use_ai_sample_data) load_ai_sample_data = true;
    }
  });

  $: if ($sarga_selected) {
    $shloka_numb = 1;
  }
  let shloka_numb = writable(1);
  let base_user_prompt = writable<string>(base_prompts[0].content);
  let auto_gen_image = writable(true);
  let additional_prompt_info = writable('');
  let shloka_text_prompt = writable('');
  let image_prompt = writable('');
  let load_ai_sample_data = false;
  let image_prompt_request_error = false;

  $: $additional_prompt_info =
    `The Shloka will be from Sarga ${sarga_info.index} named ${sarga_info.name_normal}, Kanda ${kANDa_info.index} ` +
    `named ${kANDa_info.name_normal} from Ancient Indian Epic(itihAsa) vAlmIkIrAmAyaNam.`;
  $: base_prompts[0].content = $base_user_prompt + $additional_prompt_info;

  $: !$trans_en_data.isFetching &&
    $trans_en_data.isSuccess &&
    !$sarga_data.isFetching &&
    $sarga_data.isSuccess &&
    (async () => {
      const shloka_text = $sarga_data.data![$shloka_numb];
      const shloka_text_normal = await lipi_parivartak_async(shloka_text, BASE_SCRIPT, 'Normal');
      let prompt = shloka_text + '\n' + shloka_text_normal;

      const trans_en_all = $trans_en_data.data!;
      if (trans_en_all.has($shloka_numb)) prompt += '\n\n' + trans_en_all.get($shloka_numb);
      $shloka_text_prompt = prompt;
    })();

  const generate_image_prompt = async () => {
    await $image_prompt_mut.mutateAsync({
      messages: [
        ...(base_prompts as {
          role: 'user' | 'assistant';
          content: string;
        }[]),
        {
          role: 'user',
          content: $shloka_text_prompt
        }
      ],
      use_sample_data: load_ai_sample_data
    });
  };
  const NUMBER_OF_IMAGES = 2;
  // ^ Also update grid-cols-<num> in image rendering
  const generate_image = async () => {
    await $image_mut.mutateAsync({
      image_prompt: $image_prompt,
      number_of_images: NUMBER_OF_IMAGES,
      use_sample_data: load_ai_sample_data
    });
  };
  const image_prompt_mut = client_q.ai.get_image_prompt.mutation({
    async onSuccess({ image_prompt }) {
      if (image_prompt) {
        $image_prompt = image_prompt;
        if ($auto_gen_image) generate_image();
        image_prompt_request_error = false;
      } else {
        image_prompt_request_error = true;
      }
    }
  });
  const image_mut = client_q.ai.get_generated_images.mutation({
    onSuccess(data) {
      $image_data = data;
    }
  });
  let image_data = writable<Awaited<ReturnType<typeof client.ai.get_generated_images.mutate>>>([]);
</script>

<div>
  <label class="block space-y-1">
    <span class="font-bold">Base Prompt</span>
    <textarea
      class="textarea h-24 px-1 py-0 text-sm"
      spellcheck="false"
      bind:value={$base_user_prompt}
    ></textarea>
  </label>
  <div class="break-words text-xs text-stone-500 dark:text-stone-400">
    {$additional_prompt_info}
  </div>
  <div class="text-xs text-slate-600 dark:text-slate-400">
    {#each $shloka_text_prompt.split('\n') as line}
      <div>
        {line === '' ? '\u200d' : line}
      </div>
    {/each}
  </div>
</div>
<div class="flex space-x-3">
  <span class="space-x-1">
    <button
      class="btn m-0 p-0"
      disabled={$shloka_numb === 0}
      on:click={() => {
        if ($shloka_numb !== -1) $shloka_numb -= 1;
        else $shloka_numb = shloka_count;
      }}
    >
      <Icon src={TiArrowBackOutline} class="-mt-1 text-lg" />
    </button>
    <select class="select inline-block w-14 p-1 text-sm" bind:value={$shloka_numb}>
      <option value={0}>0</option>
      {#each Array(shloka_count) as _, index}
        <option value={index + 1}>{index + 1}</option>
      {/each}
      <option value={-1}>-1</option>
    </select>
    <button
      class="btn m-0 p-0"
      on:click={() => {
        if ($shloka_numb !== shloka_count) $shloka_numb += 1;
        else $shloka_numb = -1;
      }}
      disabled={$shloka_numb === -1}
    >
      <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
    </button>
  </span>
  <button
    on:click={generate_image_prompt}
    disabled={$image_prompt_mut.isPending}
    class="btn rounded-md bg-surface-600 px-2 py-1 font-bold text-white dark:bg-surface-600"
  >
    Generate Image Prompt
  </button>
  <SlideToggle
    name="auto_image"
    size="sm"
    class="mt-1 outline-none"
    active="bg-primary-500"
    bind:checked={$auto_gen_image}>Auto Generate Image</SlideToggle
  >
</div>
{#if !$image_prompt_mut.isIdle}
  {#if $image_prompt_mut.isPending || !$image_prompt_mut.isSuccess}
    <div class="placeholder h-80 animate-pulse rounded-md"></div>
  {:else}
    <label class="space-y-2">
      <span class="font-bold">Image Prompt</span>
      <button
        disabled={$image_mut.isPending}
        on:click={generate_image}
        class="btn rounded-md bg-tertiary-800 px-1 py-0 font-bold text-white dark:bg-tertiary-700"
        >Generate Image</button
      >
      <textarea
        class={cl_join(
          'textarea h-36 px-1 py-0 text-sm',
          image_prompt_request_error && 'input-error'
        )}
        spellcheck="false"
        bind:value={$image_prompt}
      ></textarea>
    </label>
    {#if !$image_mut.isIdle}
      {#if $image_mut.isPending || !$image_mut.isSuccess}
        <div class="placeholder h-96 animate-pulse rounded-md"></div>
      {:else}
        <div>
          <section class="mb-10 grid grid-cols-2 gap-4">
            {#each get_possibily_not_undefined($image_mut.data) as image}
              {#if image}
                <div class="space-y-1">
                  <img
                    src={image.url}
                    alt={image.revised_prompt}
                    title={image.revised_prompt}
                    class="block rounded-md"
                  />
                  <div class="flex items-center justify-center space-x-3">
                    <button
                      on:click={() =>
                        download_file_in_browser(
                          image.url,
                          `Image ${$sarga_selected}-${$kANDa_selected} Shloka No. ${$shloka_numb}.png`
                        )}
                      class="btn rounded-md bg-surface-600 px-1 py-1 outline-none dark:bg-surface-500"
                    >
                      <Icon src={BsDownload} class="text-xl" />
                    </button>
                  </div>
                </div>
              {:else}
                error
              {/if}
            {/each}
          </section>
        </div>
      {/if}
    {/if}
  {/if}
{/if}
