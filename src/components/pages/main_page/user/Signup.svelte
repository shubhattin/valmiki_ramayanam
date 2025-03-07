<script lang="ts">
  import { signIn } from '~/lib/auth-client';
  import Icon from '~/tools/Icon.svelte';
  import { GoogleIcon } from '~/components/icons';
  import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
  import { Turnstile } from 'svelte-turnstile';

  let callback = $state<{ token: string; preClearanceObtained: boolean } | null>(null);
</script>

<div class="mt-4 flex flex-col items-center justify-center">
  <button
    disabled={!callback}
    onclick={async () => {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
        fetchOptions: {
          headers: {
            'x-captcha-response': callback?.token!
          }
        }
      });
    }}
    class="variant-outline-primary btn flex gap-2 rounded-lg font-semibold"
    ><Icon src={GoogleIcon} class="inline-block text-[1.25rem]" />Signup with Google</button
  >
  <div class="mt-4">
    <Turnstile
      siteKey={PUBLIC_TURNSTILE_SITE_KEY}
      on:callback={async (event) => {
        if (event.detail) {
          callback = event.detail;
        }
      }}
    />
  </div>
</div>
