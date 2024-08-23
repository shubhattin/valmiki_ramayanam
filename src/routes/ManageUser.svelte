<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { client } from '@api/client';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import { get_id_token_info } from '@tools/auth_tools';
  import { RiSystemAddLargeFill, RiSystemCloseLargeLine } from 'svelte-icons-pack/ri';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  const modal_store = getModalStore();

  const currrent_user_info = get_id_token_info().user;
  let users_info: Awaited<ReturnType<typeof client.user_info.get_all_users_info.query>> | null;
  let admin_users_index: number[] = [];
  let normal_users_index: number[] = [];
  let unverified_normal_users_index: number[] = [];

  onMount(() => {
    if (currrent_user_info.user_type === 'admin') fetch_user_info();
  });
  const fetch_user_info = async () => {
    if (!browser) return;
    users_info = null;
    const info = await client.user_info.get_all_users_info.query();
    users_info = info;

    for (let i = 0; i < users_info.length; i++) {
      const user = users_info[i];
      if (user.user_type === 'admin') {
        admin_users_index.push(i);
      } else {
        if (!user.user_verification_requests) normal_users_index.push(i);
        else unverified_normal_users_index.push(i);
      }
    }
  };

  const add_unverified_user = async (id: number, user_id: string) => {
    modal_store.trigger({
      type: 'confirm',
      title: `Are you sure to verify '${user_id}' user?`,
      response(r: boolean) {
        if (!r) return;
        (async () => {
          await client.auth.verify_user.mutate({ id: id });
          users_info = null;
          admin_users_index = [];
          normal_users_index = [];
          unverified_normal_users_index = [];
          await fetch_user_info();
        })();
      }
    });
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Manage User Settings</div>
<div class="mt-3 space-y-1">
  <div class="space-x-2">
    <span class="font-bold">Name</span>
    <span>{currrent_user_info.user_name}</span>
  </div>
  <div class="space-x-2">
    <span class="font-bold">User ID</span>
    <span>{currrent_user_info.user_id}</span>
  </div>
  {#if currrent_user_info.user_type === 'admin'}
    {#if users_info}
      {#if admin_users_index.length !== 0}
        <div>
          <div class="text-lg font-bold underline">Admin Users</div>
          <div class="space-y-1">
            {#each admin_users_index as index (users_info[index].user_id)}
              {@const user = users_info[index]}
              <div>
                <span class="font-bold">{user.user_name}</span>
                <span class="text text-sm text-gray-500 dark:text-gray-400">({user.user_id})</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      {#if unverified_normal_users_index.length !== 0}
        <div>
          <div class="text-lg font-bold underline">Unverified Normal Users</div>
          <table class="table table-hover table-compact table-cell-fit">
            <thead>
              <th class="text-center">User ID</th>
              <th class="text-center">Name</th>
              <th class="text-center">Action</th>
            </thead>
            <tbody>
              {#each unverified_normal_users_index as index (users_info[index].user_id)}
                {@const user = users_info[index]}
                <tr>
                  <td class="text-center">{user.user_id}</td>
                  <td class="text-center">{user.user_name}</td>
                  <td>
                    <button
                      title="Verify User"
                      on:click={() => add_unverified_user(user.id, user.user_id)}
                      class="btn mx-1 inline-block p-0"
                    >
                      <Icon src={RiSystemAddLargeFill} class="text-xl" />
                    </button>
                    <button title="Remove User" class="btn mx-1 inline-block p-0">
                      <Icon src={RiSystemCloseLargeLine} class="text-xl" />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}
  {/if}
</div>
