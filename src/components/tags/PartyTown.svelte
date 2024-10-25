<script>
  import { onMount } from 'svelte';
  import { partytownSnippet } from '@builder.io/partytown/integration';

  let scriptEl = $state();
  onMount(() => {
    if (scriptEl) {
      scriptEl.textContent = partytownSnippet();
    }
  });
</script>

<svelte:head>
  {#if import.meta.env.PROD}
    <script>
      partytown = {
        forward: ['dataLayer.push']
      };
    </script>
    <script bind:this={scriptEl}></script>
  {/if}
</svelte:head>
