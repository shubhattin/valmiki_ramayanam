<script>
  import { onMount } from 'svelte';
  import { pwa_state } from '~/state/main.svelte';
  import { browser } from '$app/environment';

  onMount(() => {
    if (
      import.meta.env.PROD &&
      import.meta.env.VITE_POSTHOG_ID &&
      import.meta.env.VITE_SITE_URL &&
      browser
    ) {
      import('posthog-js').then((posthog) => {
        posthog.default.init(import.meta.env.VITE_POSTHOG_ID, {
          api_host: `${import.meta.env.VITE_SITE_URL}/ingest`,
          person_profiles: 'identified_only',
          ui_host: 'https://us.posthog.com'
        });
      });
    }
  });
</script>
