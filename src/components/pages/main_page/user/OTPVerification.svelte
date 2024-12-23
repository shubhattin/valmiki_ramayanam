<script lang="ts">
  import { client_q } from '~/api/client';

  let { on_verified }: { on_verified?: () => void } = $props();

  let otp = $state('');

  const verify_email_otp_mut = client_q.user.verify_user_email.mutation();

  const handle_submit = async (e: Event) => {
    e.preventDefault();
    if (otp.length !== 4) {
      await $verify_email_otp_mut.mutateAsync({ otp: otp });
      on_verified && on_verified();
    }
  };
</script>

<div class="space-y-1">
  <div class="text-lg font-bold">Email OTP Verification</div>
  <form onsubmit={handle_submit} class="space-y-2">
    <label class="space-x-2">
      <spab class="font-semibold">OTP</spab>
      <input
        required
        name="otp"
        bind:value={otp}
        type="number"
        class="input variant-form-material w-24"
      />
    </label>
    <button
      disabled={$verify_email_otp_mut.isPending}
      class="btn bg-primary-600 font-semibold text-white dark:bg-primary-600">Verify</button
    >
  </form>
</div>
