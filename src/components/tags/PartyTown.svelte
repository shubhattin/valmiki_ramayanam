<script>
  import { partytownSnippet } from '@builder.io/partytown/integration';
</script>

<svelte:head>
  {#if import.meta.env.PROD}
    <script>
      partytown = {
        forward: ['dataLayer.push']
      };
    </script>
    {@html '<script>' + partytownSnippet() + '</script>'}
  {/if}
</svelte:head>
