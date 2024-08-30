<script lang="ts">
  import { client_raw } from '@api/client';

  export let on_done: () => void = null!;

  let current_password: string;
  let new_password: string;

  let pass_wrong_status = false;
  let updating_password_status = false;

  const update_password = async () => {
    if (!current_password || !new_password) return;
    updating_password_status = true;
    const res = await client_raw.auth.update_password.mutate({
      current_password: current_password,
      new_password: new_password
    });
    updating_password_status = false;
    if (!res.success) {
      pass_wrong_status = true;
      return;
    }
    pass_wrong_status = false;
    on_done();
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Update Password</div>
<form on:submit|preventDefault={update_password} class="mt-1 space-y-2.5 text-base">
  <label class="space-y-1">
    <div class="space-x-2 font-bold">
      <span>Current Password</span>
      {#if pass_wrong_status}
        <span class="ml-2 text-red-600 dark:text-red-500">Incorrect Password</span>
      {/if}
    </div>
    <input
      name="password"
      class={'input variant-form-material'}
      type="password"
      minlength={6}
      placeholder="Current Password"
      bind:value={current_password}
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
    class="btn rounded-lg bg-primary-700 px-2 py-1 font-bold text-white"
    disabled={updating_password_status}
  >
    Update Password
  </button>
</form>
