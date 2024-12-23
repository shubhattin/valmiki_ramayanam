<script lang="ts">
  import { client, client_q } from '~/api/client';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { user_info } from '~/state/main_page/user';

  const query_client = useQueryClient();
  const modalStore = getModalStore();

  interface Props {
    on_done?: () => void;
  }

  let { on_done = null! }: Props = $props();

  let current_user_info = createQuery({
    queryKey: ['user_info', 'get_current_user_info'],
    queryFn: async () => {
      return await client.user_info.get_current_user_info.query();
    },
    enabled: $user_info?.user_type !== 'admin'
  });
  let new_email = $state('');
  let email_already_exists = $state(false);

  const correct_email_mut = client_q.user.correct_unverified_user_email.mutation({
    onSuccess(res) {
      email_already_exists = false;
      if (res.success) {
        query_client.invalidateQueries({
          queryKey: ['user_info', 'get_current_user_info']
        });
        on_done();
      } else {
        if (res.status_code === 'email_already_exists') email_already_exists = true;
      }
    }
  });
  const update_email_func = async (e: Event) => {
    e.preventDefault();
    if (!current_user_info || !new_email) return;
    modalStore.trigger({
      type: 'confirm',
      title: `Are you sure to update your email to ${new_email} ?`,
      response: (r: boolean) => {
        if (!r) return;
        $correct_email_mut.mutate({
          new_email: new_email
        });
      }
    });
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Correct Email</div>
<form onsubmit={update_email_func} class="mt-1 space-y-2.5 text-base">
  <label class="space-y-1">
    <div class="space-x-2 font-bold">
      <span>Current Email</span>
    </div>
    <input
      class={'input variant-form-material'}
      type="email"
      minlength={6}
      readonly
      placeholder="Current Email"
      value={$current_user_info.data?.user_email ?? ''}
      required
    />
  </label>
  <label class="space-y-1">
    <span class="space-x-2 font-bold">
      <span>New Email</span>
      {#if email_already_exists}
        <span class="text-red-600 dark:text-red-500">Email already exists</span>
      {/if}
    </span>
    <input
      name="email"
      class={'input variant-form-material'}
      type="email"
      minlength={6}
      placeholder="New Email"
      bind:value={new_email}
      required
    />
  </label>
  <button
    type="submit"
    class="btn rounded-lg bg-primary-700 px-2 py-1 font-bold text-white"
    disabled={$correct_email_mut.isPending}
  >
    Update Email
  </button>
</form>
