<script lang="ts">
  import { client } from '~/api/client';
  import {
    BASE_SCRIPT,
    editing_status_on,
    kANDa_selected,
    sarga_selected,
    trans_lang,
    added_translations_indexes
  } from '~/state/main_page/main_state';
  import {
    rAmAyaNam_map,
    sarga_data,
    trans_en_data,
    trans_lang_data,
    trans_lang_data_query_key
  } from '~/state/main_page/data';
  import { createMutation, useQueryClient } from '@tanstack/svelte-query';
  import { format_string_text } from '~/tools/kry';
  import trans_prompts from './translation_prompts.yaml';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import { lipi_parivartak } from '~/tools/converter';
  import { auth, runs } from '@trigger.dev/sdk/v3';

  const query_client = useQueryClient();
  const modal_store = getModalStore();

  let kANDa_info = $derived(rAmAyaNam_map[$kANDa_selected - 1]);
  let sarga_info = $derived(kANDa_info.sarga_data[$sarga_selected - 1]);
  let shloka_count = $derived(sarga_info.shloka_count_extracted);

  const translate_sarga_mut = createMutation({
    mutationFn: async (input: Parameters<typeof client.ai.translate_sarga.mutate>[0]) => {
      const { handle, output_type } = await client.ai.translate_sarga.mutate(input);
      auth.configure({
        accessToken: handle!.publicAccessToken
      });
      for await (const run of runs.subscribeToRun(handle!.id)) {
        if (run.status === 'COMPLETED') return run.output! as typeof output_type;
      }
    },
    async onSuccess(response) {
      response = response!;
      if (!response.success) return;
      const translations = response.translations;
      const new_data = new Map($trans_lang_data.data);
      translations.forEach((translation) => {
        if (new_data.has(translation.shloka_num)) return;
        new_data.set(translation.shloka_num, translation.text);
        $added_translations_indexes.push(translation.shloka_num);
      });
      $added_translations_indexes = $added_translations_indexes;
      await query_client.setQueryData($trans_lang_data_query_key, new_data);
    }
  });

  function translate_sarga_func() {
    modal_store.trigger({
      type: 'confirm',
      title: 'Are you sure to translate the sarga ?',
      body: `This will translate the untranslated shlokas to ${$trans_lang} which you can edit and then save.`,
      response(r: boolean) {
        if (!r) return;
        (async () => {
          // Sanskrit Shlokas + Transliteration + English Translation
          const texts = await Promise.all(
            $sarga_data.data!.map(async (shloka_lines, i) => {
              const normal_shloka = await lipi_parivartak(
                $sarga_data.data![i],
                BASE_SCRIPT,
                'Normal'
              );
              const trans_index = $sarga_data.data!.length - 1 === i ? -1 : i;
              let txt = `${shloka_lines}\n${normal_shloka}`;
              const lang_data = $trans_en_data.data;
              if (lang_data && lang_data.has(trans_index))
                txt += `\n\n${lang_data.get(trans_index)}`;
              return txt;
            })
          );
          const text = texts.join('\n\n\n');
          $translate_sarga_mut.mutateAsync({
            lang: $trans_lang,
            messages: [
              {
                role: 'user',
                content: format_string_text(trans_prompts.prompts[0].content, {
                  text,
                  lang: $trans_lang
                })
              }
            ]
          });
        })();
      }
    });
  }
</script>

<!-- All English Translations(atleast 70%) should be there and the language tranlations (Atleast one untransated) should not be there -->
<!-- Currently facing timeout issues in production -->
{#if $editing_status_on && $trans_lang !== '--' && ($trans_lang_data.data?.size ?? 0) < shloka_count + 2 && ($trans_en_data.data?.size ?? 0) >= shloka_count * 0.7}
  <button
    disabled={$translate_sarga_mut.isPending}
    onclick={translate_sarga_func}
    class="btn ml-3 rounded-lg bg-surface-700 px-1 py-1 text-white dark:bg-surface-600"
  >
    Translate Sarga
  </button>
{/if}
