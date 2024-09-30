<script lang="ts">
  import { useChat } from '@ai-sdk/svelte';

  const { input, handleSubmit, messages } = useChat();

  let latest_message: {
    role: 'user' | 'assistant';
    content: string;
  } = null!;
  $: latest_message = $messages[$messages.length - 1];
</script>

{#if latest_message?.role === 'assistant' && latest_message?.content}
  <div>
    <pre>{latest_message.content}</pre>
  </div>
{/if}
<div>
  <form on:submit={handleSubmit}>
    <textarea class="textarea" bind:value={$input} />
    <button
      class="btn rounded-md bg-primary-700 px-1 py-1 font-bold text-white dark:text-white"
      type="submit">Send</button
    >
  </form>
</div>
