<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="mx-4 my-4 text-xl font-semibold">{$page.error?.message}</div>
