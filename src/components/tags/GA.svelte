<script lang="ts">
  const ID: string = import.meta.env.VITE_GA_ID;

  let html = $state(`
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', '${ID}');
      `);
</script>

<svelte:head>
  {#if ID}
    <script
      type="text/partytown"
      src={`https://www.googletagmanager.com/gtag/js?id=${ID}`}
    ></script>
    <script type="text/partytown" contenteditable="true" bind:textContent={html}></script>
  {/if}
</svelte:head>
