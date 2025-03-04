<script lang="ts">
  import { client } from '~/api/client';
  import {
    editing_status_on,
    kANDa_selected,
    sarga_selected,
    trans_lang,
    added_translations_indexes,
    TEXT_MODEL_LIST
  } from '~/state/main_page/main_state';
  import {
    QUERY_KEYS,
    rAmAyaNam_map,
    sarga_data,
    trans_en_data,
    trans_lang_data,
    trans_lang_data_query_key
  } from '~/state/main_page/data';
  import { createMutation, useQueryClient } from '@tanstack/svelte-query';
  import { format_string_text } from '~/tools/kry';
  import trans_prompts from './translation_prompts.yaml';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { AIIcon } from '~/components/icons';
  import Icon from '~/tools/Icon.svelte';
  import { get_result_from_trigger_run_id } from '~/tools/trigger';
  import pretty_ms from 'pretty-ms';
  import { OiStopwatch16 } from 'svelte-icons-pack/oi';
  import { onDestroy } from 'svelte';
  import { LANG_LIST, LANG_LIST_IDS } from '~/tools/lang_list';

  const query_client = useQueryClient();
  const modal_store = getModalStore();

  let kANDa_info = $derived(rAmAyaNam_map[$kANDa_selected - 1]);
  let sarga_info = $derived(kANDa_info.sarga_data[$sarga_selected - 1]);
  let shloka_count = $derived(sarga_info.shloka_count_extracted);

  let show_time_status = $state(false);

  onDestroy(() => {
    show_time_status = false;
    // ^ may be not needed
  });

  $effect(() => {
    if (show_time_status) {
      const t_id = setTimeout(() => (show_time_status = false), 10 * 1000);
      return () => clearTimeout(t_id);
    }
  });

  let selected_model: keyof typeof TEXT_MODEL_LIST = $state('gpt-4o');

  const translate_sarga_mut = createMutation({
    mutationFn: async (
      input: Parameters<typeof client.ai.trigger_funcs.translate_sarga.mutate>[0]
    ) => {
      show_time_status = false;
      const { run_id, output_type } = await client.ai.trigger_funcs.translate_sarga.mutate(input);

      return await get_result_from_trigger_run_id<typeof output_type>(run_id!);
    },
    async onSuccess(response) {
      response = response!;
      if (!response.success) return;
      const translations = response.translations;

      const new_data = new Map($trans_lang !== 0 ? $trans_lang_data.data : $trans_en_data.data);
      translations.forEach((translation) => {
        if (new_data.has(translation.shloka_num)) return;
        new_data.set(translation.shloka_num, translation.text);
        $added_translations_indexes.push(translation.shloka_num);
      });
      $added_translations_indexes = $added_translations_indexes;
      if ($trans_lang !== 0) await query_client.setQueryData($trans_lang_data_query_key, new_data);
      else
        await query_client.setQueryData(
          QUERY_KEYS.trans_lang_data(1, $kANDa_selected, $sarga_selected),
          new_data
        );
      show_time_status = true;
    }
  });

  function translate_sarga_func() {
    const func = async () => {
      // Sanskrit Shlokas + Transliteration + English Translation
      const texts = await Promise.all(
        $sarga_data.data!.map(async (shloka_lines, i) => {
          // # Currently not adding transliteration as context as it seems to work fine without that as well.

          // const normal_shloka = await lipi_parivartak(
          //   $sarga_data.data![i],
          //   BASE_SCRIPT,
          //   'Normal'
          // );
          const trans_index = $sarga_data.data!.length - 1 === i ? -1 : i;
          let txt = `${shloka_lines}`;
          // let txt = `${shloka_lines}\n${normal_shloka}`;
          if ($trans_lang !== 0) {
            const lang_data = $trans_en_data.data;
            if (lang_data && lang_data.has(trans_index)) txt += `\n\n${lang_data.get(trans_index)}`;
          }
          return txt;
        })
      );
      const text = texts.join('\n\n\n');
      await $translate_sarga_mut.mutateAsync({
        lang_id: $trans_lang,
        model: selected_model,
        messages: [
          {
            role: 'user',
            content: format_string_text(
              $trans_lang !== 0
                ? trans_prompts.prompts[0].content
                : trans_prompts.prompts_english[0].content,
              {
                text,
                lang: $trans_lang !== 0 ? LANG_LIST[LANG_LIST_IDS.indexOf($trans_lang)] : 'English',
                sarga_name: sarga_info.name_normal,
                sarga_num: sarga_info.index,
                kANDa_name: kANDa_info.name_normal,
                kANDa_num: kANDa_info.index
              }
            )
          }
        ]
      });
    };
    modal_store.trigger({
      type: 'confirm',
      title: 'Are you sure to translate the sarga ?',
      body: `This will translate the untranslated shlokas to ${$trans_lang !== 0 ? LANG_LIST[LANG_LIST_IDS.indexOf($trans_lang)] : 'English'} which you can edit and then save.`,
      response(r: boolean) {
        if (!r) return;
        func();
      }
    });
  }

  let other_lang_allow_translate = $derived(
    $trans_lang !== 0 &&
      ($trans_lang_data.data?.size ?? 0) < shloka_count + 2 && // atleast 1 untranslated shlokas should be there
      ($trans_en_data.data?.size ?? 0) >= shloka_count * 0.7 // atleast 70% of the translations should be there
  );
  let english_allow_translate = $derived(
    $trans_lang === 0 && ($trans_en_data.data?.size ?? 0) !== shloka_count + 2
    // all english translations should not be there, anyway we wont be sending it as context to the API anyway
  );
</script>

{#if $editing_status_on && (other_lang_allow_translate || english_allow_translate)}
  <button
    disabled={$translate_sarga_mut.isPending}
    onclick={translate_sarga_func}
    class="btn ml-3 inline-block rounded-lg bg-surface-600 px-2 py-1 text-white dark:bg-surface-600"
  >
    <Icon src={AIIcon} class="-mt-1 mr-1 text-2xl" />
    Translate Sarga with AI
  </button>
  <select
    class="select ml-3 inline-block w-20 px-1 py-1 text-xs outline-none"
    bind:value={selected_model}
    title={TEXT_MODEL_LIST[selected_model][1]}
  >
    {#each Object.entries(TEXT_MODEL_LIST) as [key, value]}
      <option value={key} title={value[1]}>{value[0]}</option>
    {/each}
  </select>
{:else if $editing_status_on && $translate_sarga_mut.isSuccess && show_time_status}
  <span class="ml-4 select-none text-xs text-stone-500 dark:text-stone-300">
    <Icon src={OiStopwatch16} class="text-base" />
    {pretty_ms($translate_sarga_mut.data.time_taken)}
  </span>
{/if}
