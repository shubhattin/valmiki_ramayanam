<script lang="ts">
  import { client } from '@api/client';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { user_info } from '@state/main_page/user';
  import { ensure_auth_access_status, get_id_token_info } from '@tools/auth_tools';

  onMount(async () => {
    if (browser) await ensure_auth_access_status();
    try {
      $user_info = get_id_token_info().user;
    } catch {}
  });

  const prompt_mut = client.ai.get_image_prompt.mutation({
    async onSuccess({ image_prompt }) {
      $image_mut.mutateAsync({
        image_prompt: image_prompt
      });
    }
  });
  const image_mut = client.ai.get_generated_image.mutation();

  const BASE_PROMPT = `I will be giving you Sanskrit shloka along with its English translation for Valmiki Ramayanam. Generate a text prompt which can be used to generate consistent looking images that encapsulate the essence of the translations(meaning). Make the images look real along with the background`;
  const BASE_REPLY = `To create consistent image prompts that encapsulate the essence of the translations from Valmiki Ramayanam, I will aim to generate a detailed, descriptive prompt based on the meaning and context of each shloka. These prompts will focus on the visual elements of the scene described in the translation, while keeping the artistic and cultural essence intact.

Feel free to provide the first shloka and translation when you're ready, and I'll start generating a suitable image prompt for it.`;
  let input: string = '';

  const create_image = async () => {
    await $prompt_mut.mutateAsync({
      messages: [
        {
          role: 'user',
          content: BASE_PROMPT
        },
        {
          role: 'assistant',
          content: BASE_REPLY
        },
        {
          role: 'user',
          content: input
        }
      ]
    });
  };
</script>

<div>
  <form on:submit|preventDefault={create_image}>
    <textarea class="textarea h-auto" bind:value={input} />
    <button
      class="btn rounded-md bg-primary-700 px-1 py-1 font-bold text-white dark:text-white"
      type="submit">Send</button
    >
  </form>
</div>
<div>
  {#if !$prompt_mut.isPending && $prompt_mut.isSuccess}
    <textarea class="textarea h-48">{$prompt_mut.data?.image_prompt}</textarea>
  {/if}
  <div>
    {#if !$image_mut.isPending && $image_mut.isSuccess}
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img src={$image_mut.data} alt="Generated Image" />
    {/if}
  </div>
</div>
