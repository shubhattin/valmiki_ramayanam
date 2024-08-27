<script>
  import { onMount } from 'svelte';
  import { partytownSnippet } from '@builder.io/partytown/integration';

  let scriptEl;
  onMount(() => {
    if (scriptEl) {
      scriptEl.textContent = partytownSnippet();
    }
  });
</script>

<svelte:head>
  <script>
    partytown = {
      forward: ['dataLayer.push']
    };
  </script>
  <script bind:this={scriptEl}></script>
</svelte:head>
