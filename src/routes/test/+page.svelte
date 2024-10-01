<script lang="ts">
  import { client } from '@api/client';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { user_info } from '@state/main_page/user';
  import { ensure_auth_access_status, get_id_token_info } from '@tools/auth_tools';
  import base_prompts from './base_prompt.yaml';

  onMount(async () => {
    if (browser) await ensure_auth_access_status();
    try {
      $user_info = get_id_token_info().user;
    } catch {}
  });

  const prompt_mut = client.ai.get_image_prompt.mutation({
    async onSuccess({ image_prompt }) {
      $image_mut.mutateAsync({
        image_prompt
      });
    }
  });
  const image_mut = client.ai.get_generated_image.mutation();

  let input: string = `तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ।
नारदं परिपप्रच्छ वाल्मीकिर्मुनिपुङ्गवम् ॥१-१-१॥
Maharishi Valmiki, the great ascetic, asked Narada, who is engaged in the Vedas, penance, and studies, who is the best of the eloquent orators, thus...`;

  const create_image = async () => {
    await $prompt_mut.mutateAsync({
      messages: [
        ...(base_prompts as {
          role: 'user' | 'assistant';
          content: string;
        }[]),
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
    <div>
      {#if !$image_mut.isPending && $image_mut.isSuccess}
        <img
          src={$image_mut.data[0].url}
          alt={$image_mut.data[0].revised_prompt}
          title={$image_mut.data[0].revised_prompt}
        />
      {/if}
    </div>
  {/if}
</div>
