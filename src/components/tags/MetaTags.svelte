<script lang="ts">
  export let title: string;
  export let description: string | null = null;
</script>

<svelte:head>
  <meta
    property="og:image"
    content="https://cdn.jsdelivr.net/gh/shubhattin/valmiki_ramayanam@latest/static/img/Project_Banner.jpg"
  />
  <meta property="og:image:width" content="501.4" />
  <meta property="og:image:height" content="229.32" />
  <title>{title}</title>
  <meta property="og:title" content={title} />
  <meta property="og:site_name" content={title} />
  {#if description}
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
  {/if}
</svelte:head>
