<script lang="ts">
  import { client_q } from '~/api/client';

  interface Props {
    on_done?: () => void;
  }

  let { on_done = null! }: Props = $props();

  let current_password = $state('');
  let new_password = $state('');

  let pass_wrong_status = $state(false);

  const update_password = client_q.auth.update_password.mutation({
    onSuccess(res) {
      if (!res.success) {
        pass_wrong_status = true;
        return;
      }
      pass_wrong_status = false;
      on_done();
    }
  });
  const update_password_func = async (e: Event) => {
    e.preventDefault();
    if (!current_password || !new_password) return;
    $update_password.mutate({
      current_password: current_password,
      new_password: new_password
    });
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Update Password</div>
<form onsubmit={update_password_func} class="mt-1 space-y-2.5 text-base">
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
    disabled={$update_password.isPending}
  >
    Update Password
  </button>
</form>
