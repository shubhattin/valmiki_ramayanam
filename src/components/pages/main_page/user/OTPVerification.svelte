<script lang="ts">
  import { onMount } from 'svelte';
  import { client_q } from '~/api/client';
  import { cl_join } from '~/tools/cl_join';
  import { useQueryClient } from '@tanstack/svelte-query';

  const query_client = useQueryClient();

  let {
    on_verified,
    id,
    after_signup = false
  }: { on_verified?: () => void; id: number; after_signup?: boolean } = $props();

  let otp = $state<number>(null!);
  let invalid_otp = $state(false);
  let otp_input_element = $state<HTMLInputElement>(null!);

  onMount(() => {
    otp_input_element.focus();
  });

  const verify_email_otp_mut = client_q.user.verify_user_email.mutation({
    onSuccess(res) {
      if (res.verified) {
        on_verified && on_verified();
      } else {
        invalid_otp = true;
        otp = null!;
        otp_input_element && otp_input_element.focus();
        setTimeout(() => {
          invalid_otp = false;
        }, 1000);
        query_client.invalidateQueries({
          queryKey: [['user', 'get_user_verified_status'], { type: 'query' }]
        });
      }
    }
  });

  const handle_submit = async (e: Event) => {
    e.preventDefault();
    if (otp && otp.toString().length === 4) {
      await $verify_email_otp_mut.mutateAsync({ otp: otp.toString(), id });
    }
  };
</script>

<div class="space-y-1">
  <div class="text-lg font-bold">Email OTP Verification</div>
  <form onsubmit={handle_submit} class="space-y-2">
    <label class="space-x-2">
      <spab class="font-semibold">OTP</spab>
      <input
        bind:this={otp_input_element}
        required
        name="otp"
        bind:value={otp}
        type="number"
        placeholder="Enter OTP"
        class={cl_join('input variant-form-material w-28', invalid_otp && 'input-error')}
      />
    </label>
    <button
      disabled={$verify_email_otp_mut.isPending}
      class="btn rounded-lg bg-primary-600 px-2 py-1 font-semibold text-white dark:bg-primary-600"
      >Verify</button
    >
  </form>
  {#if after_signup}
    <div class="text-surface-100-800-token text-sm">
      You can also do this later on, click continue to do it later. Although it is a necessary step
      before you start contributing.
    </div>
  {/if}
</div>
