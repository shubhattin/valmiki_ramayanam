<script lang="ts">
  import Icon from '~/tools/Icon.svelte';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { SCRIPT_LIST, type script_list_type } from '~/tools/lang_list';
  import LipiLekhikA, { load_parivartak_lang_data, lipi_parivartak_async } from '~/tools/converter';
  import { FaCircleUp, FaCircleDown } from 'svelte-icons-pack/fa';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { BsKeyboard } from 'svelte-icons-pack/bs';
  import MetaTags from '~/components/tags/MetaTags.svelte';
  import { OiCopy16 } from 'svelte-icons-pack/oi';
  import { BiHelpCircle } from 'svelte-icons-pack/bi';
  import TypingAssistance from '~/components/TypingAssistance.svelte';
  import { get_font_family_and_size } from '~/tools/font_tools';
  import { PAGE_TITLES } from '~/state/page_titles';

  let from_lang = writable<script_list_type>('Devanagari');
  let to_lang = writable<script_list_type>('Telugu');

  let from_text = writable('');
  let to_text = writable('');

  let from_text_type_enabled = true;
  let to_text_type_enabled = true;

  $: {
    load_parivartak_lang_data($from_lang);
    load_parivartak_lang_data($to_lang);
  }

  async function convert_text(
    source_text: string,
    target: Writable<string>,
    source_lang: string,
    target_lang: string
  ) {
    target.set(await lipi_parivartak_async(source_text, source_lang, target_lang));
  }
  const copy_text_to_clipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [TITLE] = PAGE_TITLES['/convert'];
  const PAGE_INFO = {
    title: TITLE,
    description: 'A Indian Script Transliteration Utility'
  };

  let typing_assistance_modal_opened = writable(false);

  $: from_text_font_info = get_font_family_and_size($from_lang);
  $: to_text_font_info = get_font_family_and_size($to_lang);
</script>

<MetaTags title={PAGE_INFO.title} description={PAGE_INFO.description} />

<div class="mt-4">
  <div class="space-y-2">
    <div class="flex space-x-4">
      <select class="select w-40" bind:value={$from_lang}>
        {#each SCRIPT_LIST as lang (lang)}
          <option value={lang}>{lang}</option>
        {/each}
      </select>
      <button
        title="Copy Text"
        class="btn m-0 select-none p-0 outline-none dark:hover:text-gray-400"
        on:click={() => copy_text_to_clipboard($from_text)}
      >
        <Icon src={OiCopy16} class="text-xl" />
      </button>
      <SlideToggle
        name="from_text_type"
        active="bg-primary-500"
        class="mt-1 hover:text-gray-500 dark:hover:text-gray-400"
        bind:checked={from_text_type_enabled}
        size="sm"
      >
        <Icon src={BsKeyboard} class="text-4xl" />
      </SlideToggle>
    </div>
    <textarea
      class="textarea h-56"
      placeholder={`Enter text in ${$from_lang}`}
      bind:value={$from_text}
      style:font-size={`${from_text_font_info.size}rem`}
      style:font-family={from_text_font_info.family}
      on:input={(e) => {
        if (from_text_type_enabled)
          // @ts-ignore
          LipiLekhikA.mukhya(e.target, e.data, $from_lang, true, (val) => {
            $from_text = val;
          });
        else $from_text = e.currentTarget.value;
      }}
    ></textarea>
  </div>
  <div class="my-3 flex justify-center space-x-3">
    <button
      class="btn m-0 p-0"
      on:click={() => convert_text($to_text, from_text, $to_lang, $from_lang)}
      ><Icon
        src={FaCircleUp}
        class="text-3xl hover:text-gray-500 dark:hover:text-gray-400"
      /></button
    >
    <button
      class="btn m-0 p-0"
      on:click={() => convert_text($from_text, to_text, $from_lang, $to_lang)}
      ><Icon
        src={FaCircleDown}
        class="text-3xl hover:text-gray-500 dark:hover:text-gray-400"
      /></button
    >
    <button
      class="btn rounded-md p-0 text-sm"
      title={'Language Typing Assistance'}
      on:click={() => ($typing_assistance_modal_opened = true)}
    >
      <Icon src={BiHelpCircle} class="text-4xl text-sky-500 dark:text-sky-400" />
    </button>
  </div>
  <div class="space-y-2">
    <div class="flex space-x-4">
      <select class="select w-40" bind:value={$to_lang}>
        {#each SCRIPT_LIST as lang (lang)}
          <option value={lang}>{lang}</option>
        {/each}
      </select>
      <button
        title="Copy Text"
        class="btn m-0 select-none p-0 outline-none dark:hover:text-gray-400"
        on:click={() => copy_text_to_clipboard($to_text)}
      >
        <Icon src={OiCopy16} class="text-xl" />
      </button>
      <SlideToggle
        name="to_text_type"
        active="bg-primary-500"
        class="mt-1 hover:text-gray-500 dark:hover:text-gray-400"
        bind:checked={to_text_type_enabled}
        size="sm"
      >
        <Icon src={BsKeyboard} class="text-4xl" />
      </SlideToggle>
    </div>
    <textarea
      bind:value={$to_text}
      class="textarea h-56"
      style:font-size={`${to_text_font_info.size}rem`}
      style:font-family={to_text_font_info.family}
      placeholder={`Enter text in ${$to_lang}`}
      on:input={(e) => {
        if (to_text_type_enabled)
          // @ts-ignore
          LipiLekhikA.mukhya(e.target, e.data, $to_lang, true, (val) => {
            $to_text = val;
          });
        else $to_text = e.currentTarget.value;
      }}
    ></textarea>
  </div>
</div>
<TypingAssistance modal_opended={typing_assistance_modal_opened} sync_lang_script={from_lang} />
