<script lang="ts">
  import { z } from 'zod';
  import { client_q } from '~/api/client';
  import { cl_join } from '~/tools/cl_join';

  let { on_done }: { on_done?: () => void } = $props();

  let username_or_email = $state('');
  let incorrect_id_status = $state(false);
  let id_input_element = $state<HTMLInputElement>(null!);

  let otp = $state<number>(null!);
  let new_password = $state('');
  let wrong_otp_status = $state(false);
  let otp_input_element = $state<HTMLInputElement>(null!);

  const get_reset_otp_mut = client_q.auth.reset_password.send_reset_password_otp.mutation({
    onSuccess(res) {
      incorrect_id_status = false;
      if (!res.success) {
        incorrect_id_status = true;
        username_or_email = '';
        id_input_element.focus();
        $get_reset_otp_mut.reset();
      }
    }
  });

  const reset_password_mut = client_q.auth.reset_password.reset_password_via_otp.mutation({
    onSuccess(res) {
      wrong_otp_status = false;
      if (!res.success) {
        wrong_otp_status = true;
        otp = null!;
        otp_input_element.focus();
        setTimeout(() => (wrong_otp_status = false), 1000);
      } else {
        on_done && on_done();
      }
    }
  });

  const handle_submit = async (e: Event) => {
    e.preventDefault();
    if (!$get_reset_otp_mut.isSuccess) {
      if (username_or_email === '') return;
      await $get_reset_otp_mut.mutateAsync({
        username_or_email: username_or_email
      });
    } else if ($get_reset_otp_mut.data.success) {
      if (otp === null || otp.toString().length !== 4 || new_password === '') return;
      await $reset_password_mut.mutateAsync({
        id: $get_reset_otp_mut.data.user_id,
        otp: otp.toString(),
        new_password: new_password
      });
    }
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Reset Password</div>
<form onsubmit={handle_submit} class="mt-1 space-y-2.5 text-base">
  <label class="space-y-1">
    <div class="font-bold">
      <span>Username/Email</span>
      {#if incorrect_id_status}
        <span class="ml-2 text-red-600 dark:text-red-500">Incorrect Username or Email</span>
      {/if}
    </div>
    <input
      name="username"
      class={'input variant-form-material'}
      type="text"
      minlength={3}
      placeholder="Username"
      bind:value={username_or_email}
      bind:this={id_input_element}
      required
      disabled={$get_reset_otp_mut.isSuccess}
    />
  </label>
  {#if !$get_reset_otp_mut.isSuccess}
    <button
      type="submit"
      class="btn rounded-lg bg-primary-700 px-2 py-1 font-bold text-white"
      disabled={$get_reset_otp_mut.isPending}
    >
      <span>Get OTP</span>
    </button>
  {:else if $get_reset_otp_mut.data.success}
    <div class="text-sm text-slate-500 dark:text-slate-400">
      OTP has been sent to {$get_reset_otp_mut.data.masked_email}
    </div>
    <label class="space-x-3">
      <span class="font-bold">OTP</span>
      <input
        name="otp"
        class={cl_join('input variant-form-material w-32', wrong_otp_status && 'input-error')}
        type="number"
        minlength={4}
        placeholder="Enter OTP"
        bind:value={otp}
        bind:this={otp_input_element}
        required
      />
    </label>
    <label class="space-y-1">
      <span class="font-bold">New Password</span>
      <input
        name="password"
        class={'input variant-form-material'}
        type="password"
        minlength={6}
        placeholder="New Password"
        bind:value={new_password}
        required
      />
    </label>
    <button
      type="submit"
      disabled={$reset_password_mut.isPending}
      class="btn rounded-lg bg-primary-700 px-2 py-1 font-bold text-white"
    >
      <span>Reset Password</span>
    </button>
  {/if}
</form>
