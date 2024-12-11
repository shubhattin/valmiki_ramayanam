<script lang="ts">
  import { rAmAyaNam_map, sarga_data, trans_en_data } from '~/state/main_page/data';
  import {
    BASE_SCRIPT,
    kANDa_selected,
    sarga_selected,
    TEXT_MODEL_LIST
  } from '~/state/main_page/main_state';
  import Icon from '~/tools/Icon.svelte';
  import { TiArrowBackOutline, TiArrowForwardOutline } from 'svelte-icons-pack/ti';
  import { writable } from 'svelte/store';
  import image_tool_prompts from './image_tool_prompts.yaml';
  import { SlideToggle, ProgressRadial } from '@skeletonlabs/skeleton';
  import { client } from '~/api/client';
  import { lipi_parivartak } from '~/tools/converter';
  import { copy_text_to_clipboard, format_string_text, get_permutations } from '~/tools/kry';
  import { onDestroy, onMount, untrack } from 'svelte';
  import { loadLocalConfig } from '../load_local_config';
  import { BsDownload, BsCopy } from 'svelte-icons-pack/bs';
  import {
    download_external_file_in_browser,
    download_file_in_browser
  } from '~/tools/download_file_browser';
  import { cl_join } from '~/tools/cl_join';
  import { LuCopy } from 'svelte-icons-pack/lu';
  import { OiCopy16, OiStopwatch16 } from 'svelte-icons-pack/oi';
  import { BsClipboard2Check } from 'svelte-icons-pack/bs';
  import { createQuery } from '@tanstack/svelte-query';
  import { ai_sample_data } from './ai_sample_data';
  import { delay } from '~/tools/delay';
  import pretty_ms from 'pretty-ms';
  import ms from 'ms';

  let base_prompts = image_tool_prompts as {
    main_prompt: {
      role: 'user' | 'assistant';
      content: string;
    }[];
    additional_prompt_info: string;
  };
  let kANDa_info = $derived(rAmAyaNam_map[$kANDa_selected - 1]);
  let sarga_info = $derived(kANDa_info.sarga_data[$sarga_selected - 1]);
  let shloka_count = $derived(sarga_info.shloka_count_extracted);

  let selected_text_model: keyof typeof TEXT_MODEL_LIST = $state('gpt-4o');

  onMount(async () => {
    if (import.meta.env.DEV) {
      const conf = await loadLocalConfig();
      if (conf.use_ai_sample_data) load_ai_sample_data = true;
    }
  });

  $effect(() => {
    if ($sarga_selected) {
      $shloka_numb = 1;
    }
  });
  let shloka_numb = writable(1);
  let base_user_prompt = writable<string>(base_prompts.main_prompt[0].content);
  let auto_gen_image = writable(false);
  let shloka_text_prompt = writable('');
  let image_prompt = writable('');
  let load_ai_sample_data = $state(false);
  let image_prompt_request_error = $state(false);

  let show_prompt_time_status = $state(false);
  let show_image_time_status = $state(false);

  onDestroy(() => {
    show_prompt_time_status = false;
    show_image_time_status = false;
    // ^ may be not needed
  });

  $effect(() => {
    if (show_prompt_time_status) {
      const t_id = setTimeout(() => (show_prompt_time_status = false), 10 * 1000);
      return () => clearTimeout(t_id);
    }
  });
  $effect(() => {
    if (show_image_time_status) {
      const t_id = setTimeout(() => (show_image_time_status = false), 10 * 1000);
      return () => clearTimeout(t_id);
    }
  });

  type image_models_type = Parameters<
    typeof client.ai.get_generated_images.mutate
  >[0]['image_model'];
  let image_model: image_models_type = $state('dall-e-3');
  const IMAGE_MODELS: Record<image_models_type, [string, string, number]> = {
    'dall-e-3': ['DALL-E 3', '$0.04 (₹3.4) / image', 15],
    'sd3-core': ['SD3 Core', '$0.03 (₹2.5) / image', 16]
    // sdxl: ['SDXL', '$0.002 (₹0.17) / image'],
    // 'dall-e-2': ['DALL-E 2', '$0.02 (₹1.68) / image']
  };

  let additional_prompt_info = $derived(
    format_string_text(base_prompts.additional_prompt_info, {
      sarga_index: sarga_info.index,
      sarga_name_normal: sarga_info.name_normal,
      kANDa_index: kANDa_info.index,
      kANDa_name_normal: kANDa_info.name_normal
    })
  );

  $effect(() => {
    !$trans_en_data.isFetching &&
      $trans_en_data.isSuccess &&
      !$sarga_data.isFetching &&
      $sarga_data.isSuccess &&
      (async () => {
        const shloka_text = $sarga_data.data![$shloka_numb];
        const shloka_text_normal = await lipi_parivartak(shloka_text, BASE_SCRIPT, 'Normal');
        let prompt = shloka_text + '\n' + shloka_text_normal;
        const trans_en_all = $trans_en_data.data!;
        if (trans_en_all.has($shloka_numb)) prompt += '\n\n' + trans_en_all.get($shloka_numb);
        $shloka_text_prompt = prompt;
      })();
  });

  $effect(() => {
    // reset image prompt text on change of kanda, sarga or shloka
    $kANDa_selected;
    $sarga_selected;
    $shloka_numb;
    $image_prompt = '';
  });

  const NUMBER_OF_IMAGES = 1;
  let image_gen_time_taken = $state(0);

  let image_gen_interval_obj: ReturnType<typeof setInterval> = null!;
  // ^ Also update grid-cols-<num> in image rendering
  const generate_image = async () => {
    image_gen_time_taken = 0;
    image_gen_interval_obj = setInterval(() => {
      image_gen_time_taken++;
      if (image_gen_time_taken === IMAGE_MODELS[image_model][2]) {
        clearInterval(image_gen_interval_obj);
        return;
      }
    }, 1000);
    await $image_q.refetch();
  };

  const image_prompt_q = $derived(
    createQuery({
      queryKey: ['shloka_text_prompt', $sarga_selected, $kANDa_selected, $shloka_numb],
      queryFn: async () => {
        show_prompt_time_status = false;
        auto_image_generated = false;
        if (import.meta.env.DEV && load_ai_sample_data) {
          await delay(1000);
          return { image_prompt: ai_sample_data.sample_text_prompt, time_taken: 0 };
        }
        return await client.ai.get_image_prompt.mutate({
          messages: [
            {
              role: 'user',
              content: base_prompts.main_prompt[0].content + additional_prompt_info
            },
            {
              role: 'assistant',
              content: base_prompts.main_prompt[1].content
            },
            { role: 'user', content: $shloka_text_prompt }
          ],
          model: selected_text_model
        });
      },
      enabled: false,
      placeholderData: undefined,
      staleTime: ms('30mins')
    })
  );
  let auto_image_generated = false;
  $effect(() => {
    if (
      !$image_prompt_q.isFetching &&
      $image_prompt_q.isSuccess &&
      $image_prompt_q.data.image_prompt
    )
      untrack(() => {
        $image_prompt = $image_prompt_q.data.image_prompt!;
        if (!auto_image_generated && $auto_gen_image) {
          generate_image();
          auto_image_generated = true;
        }
        image_prompt_request_error = false;
        show_prompt_time_status = true;
      });
    else image_prompt_request_error = true;
  });

  const image_q = $derived(
    createQuery({
      queryKey: ['shloka_image', $kANDa_selected, $sarga_selected, $shloka_numb],
      queryFn: async () => {
        show_image_time_status = false;
        if (import.meta.env.DEV && load_ai_sample_data) {
          await delay(2000);
          const list: {
            url: string;
            created: number;
            prompt: string;
            file_format: 'png';
            model: 'dall-e-3';
            out_format: 'url';
          }[] = [];
          const permutation = get_permutations([1, 4], 1)[0];
          for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
            const image_index = permutation[i] - 1;
            list.push({
              url: ai_sample_data.sample_images[image_index],
              created: new Date().getTime(),
              prompt: `Sample Image ${image_index + 1}`,
              file_format: 'png', // although its webp
              model: 'dall-e-3',
              out_format: 'url'
            });
          }
          return { images: list, time_taken: 0 };
        }
        return await client.ai.get_generated_images.mutate({
          image_prompt: $image_prompt,
          number_of_images: NUMBER_OF_IMAGES,
          image_model
        });
      },
      enabled: false,
      placeholderData: undefined,
      staleTime: ms('30mins')
    })
  );
  $effect(() => {
    if (!$image_q.isFetching && $image_q.isSuccess) {
      show_image_time_status = true;
      if (image_gen_interval_obj)
        untrack(() => {
          // clear interval
          clearInterval(image_gen_interval_obj);
          image_gen_interval_obj = null!;
          image_gen_time_taken = 0;
        });
    }
  });
  type image_data_type = Awaited<
    ReturnType<typeof client.ai.get_generated_images.mutate>
  >['images'][0];

  const download_image = (image: image_data_type) => {
    if (!image) return;
    const file_name = `Image ${$sarga_selected}-${$kANDa_selected} Shloka No. ${$shloka_numb}`;
    if (load_ai_sample_data) download_file_in_browser(image.url, `${file_name}.webp`);
    else if (image.out_format == 'url')
      download_external_file_in_browser(image.url, `${file_name}.png`);
    else if (image.out_format == 'b64_json')
      download_file_in_browser(image.url, `${file_name}.png`);
  };

  let copied_text_status = $state(false);
  $effect(() => {
    copied_text_status && setTimeout(() => (copied_text_status = false), 1400);
  });
  const copy_text_with_indicator = (text: string) => {
    copy_text_to_clipboard(text);
    copied_text_status = true;
  };
</script>

{#if copied_text_status}
  <div
    class="fixed bottom-2 right-2 z-50 cursor-default select-none font-bold text-green-700 dark:text-green-300"
  >
    <Icon src={BsClipboard2Check} />
    Copied to Clipboard
  </div>
{/if}
<div class="space-x-3">
  <span class="space-x-1">
    <span class="font-semibold">Shloka No.</span>
    <button
      class="btn m-0 p-0"
      disabled={$shloka_numb === 0}
      onclick={() => {
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
      onclick={() => {
        if ($shloka_numb !== shloka_count) $shloka_numb += 1;
        else $shloka_numb = -1;
      }}
      disabled={$shloka_numb === -1}
    >
      <Icon src={TiArrowForwardOutline} class="-mt-1 text-lg" />
    </button>
  </span>
  <button
    onclick={async () => {
      await $image_prompt_q.refetch();
      // ^ this regetch is not a reliable alternative to onSuccess
    }}
    disabled={$image_prompt_q.isFetching}
    class="btn rounded-md bg-surface-600 px-2 py-1 font-bold text-white dark:bg-surface-600"
  >
    Generate Image Prompt
  </button>
  <select
    class="select ml-3 inline-block w-28 px-1 py-1 text-xs outline-none"
    bind:value={selected_text_model}
    title={TEXT_MODEL_LIST[selected_text_model][1]}
  >
    {#each Object.entries(TEXT_MODEL_LIST) as [key, value]}
      <option value={key} title={value[1]}>{value[0]}</option>
    {/each}
  </select>
  {#if show_prompt_time_status && $image_prompt_q.isSuccess && $image_prompt_q.data.image_prompt}
    <span class="ml-4 select-none text-xs text-stone-500 dark:text-stone-300">
      <Icon src={OiStopwatch16} class="text-base" />
      {pretty_ms($image_prompt_q.data.time_taken)}
    </span>
  {/if}
</div>
<div>
  <div class="block space-y-1.5">
    <div class="space-x-2">
      <span class="font-bold">Base Prompt</span>
      <button
        class="btn m-0 p-0 outline-none"
        onclick={() => copy_text_to_clipboard($base_user_prompt + additional_prompt_info)}
        title="Copy Base Prompt"
      >
        <Icon src={LuCopy} />
      </button>
      <button
        class="btn m-0 p-0 outline-none"
        title="Copy Full Prompt"
        onclick={() =>
          copy_text_to_clipboard(
            $base_user_prompt + additional_prompt_info + '\n\n\n' + $shloka_text_prompt
          )}
      >
        <Icon src={OiCopy16} class="text-[1.2rem]" />
      </button>
    </div>
    <textarea
      class="textarea h-24 px-1 py-0 text-sm"
      spellcheck="false"
      bind:value={$base_user_prompt}
    ></textarea>
  </div>
  <div class="break-words text-xs text-stone-500 dark:text-stone-400">
    {additional_prompt_info}
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="text-xs text-slate-600 dark:text-slate-400"
    ondblclick={() => copy_text_with_indicator($shloka_text_prompt)}
  >
    {#each $shloka_text_prompt.split('\n') as line}
      <div>
        {line === '' ? '\u200d' : line}
      </div>
    {/each}
  </div>
</div>
<div class="flex space-x-3">
  <select
    class="select w-24 px-1 py-1 text-sm"
    bind:value={image_model}
    title={IMAGE_MODELS[image_model][1]}
  >
    {#each Object.entries(IMAGE_MODELS) as option}
      <option class="text-sm" value={option[0]} title={option[1][1]}>{option[1][0]}</option>
    {/each}
  </select>
  <SlideToggle
    name="auto_image"
    size="sm"
    class="mt-1 outline-none"
    active="bg-primary-500"
    bind:checked={$auto_gen_image}>Auto Generate Image</SlideToggle
  >
</div>
{#if $image_prompt_q.data !== undefined || $image_prompt_q.isFetching}
  {#if $image_prompt_q.isFetching || !$image_prompt_q.isSuccess}
    <div class="placeholder h-80 animate-pulse rounded-md"></div>
  {:else}
    <div class="space-x-3">
      <span class="font-bold">Image Prompt</span>
      <button
        disabled={$image_q.isFetching}
        onclick={generate_image}
        class="btn rounded-md bg-tertiary-800 px-1 py-0 font-bold text-white dark:bg-tertiary-700"
        >Generate Image</button
      >
      <button
        class="btn m-0 p-0 outline-none"
        title="Copy Image Prompt"
        onclick={() => copy_text_to_clipboard($image_prompt)}
      >
        <Icon src={BsCopy} class="text-lg" />
      </button>
      {#if $image_q.isFetching}
        <ProgressRadial
          value={(image_gen_time_taken / IMAGE_MODELS[image_model][2]) * 100}
          stroke={100}
          width="w-6"
          class="-mb-2 inline-block"
          meter="stroke-primary-500"
          track="stroke-primary-500/30"
          strokeLinecap="butt"
        />
      {:else if show_image_time_status && $image_q.isSuccess}
        <span class="ml-4 select-none text-xs text-stone-500 dark:text-stone-300">
          <Icon src={OiStopwatch16} class="text-base" />
          {pretty_ms($image_q.data.time_taken)}
        </span>
      {/if}
    </div>
    <textarea
      class={cl_join(
        'textarea h-36 px-1 py-0 text-sm',
        image_prompt_request_error && 'input-error'
      )}
      spellcheck="false"
      bind:value={$image_prompt}
    ></textarea>
    {#if $image_q.data}
      {#if $image_q.isFetching || !$image_q.isSuccess}
        <div class="placeholder h-96 animate-pulse rounded-md"></div>
      {:else}
        <div>
          <section class="mb-10 grid grid-cols-2 gap-3">
            {#each $image_q.data.images as image}
              {#if image}
                <div class="space-y-1">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    title={image.prompt}
                    class="block rounded-md border-2 border-blue-600 dark:border-blue-800"
                    height={1024}
                    width={1024}
                  />
                  <div class="flex items-center justify-center space-x-3">
                    <button
                      onclick={() => download_image(image)}
                      class="btn rounded-md bg-surface-600 px-1 py-1 outline-none dark:bg-surface-500"
                    >
                      <Icon src={BsDownload} class="text-xl text-white" />
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
