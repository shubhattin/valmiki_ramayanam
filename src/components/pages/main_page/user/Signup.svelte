<script lang="ts">
  import { signIn } from '~/lib/auth-client';
  import Icon from '~/tools/Icon.svelte';
  import { GoogleIcon } from '~/components/icons';
</script>

<div class="mt-4 flex items-center justify-center">
  <button
    onclick={async () => {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.href
      });
    }}
    class="variant-outline-secondary btn flex gap-2 rounded-lg font-semibold"
    ><Icon src={GoogleIcon} class="inline-block text-[1.25rem]" />Signup with Google</button
  >
</div>
