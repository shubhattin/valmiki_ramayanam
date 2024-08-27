<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log($page.params);
  });
</script>
