<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { cl_join } from '@tools/cl_join';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import Icon from '@tools/Icon.svelte';
  import { client } from '@api/client';
  import { delay } from '@tools/delay';
  import { number, z } from 'zod';
  import { get_id_token_info } from '@tools/auth_tools';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';
  import { RiUserFacesAdminLine } from 'svelte-icons-pack/ri';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

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
            {#each admin_users_index as index}
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
          <table class="table table-hover table-compact table-cell-fit">
            <thead>
              <th class="text-center">User ID</th>
              <th class="text-center">Name</th>
            </thead>
            <tbody>
              {#each unverified_normal_users_index as index}
                {@const user = users_info[index]}
                <tr>
                  <td class="text-center">{user.user_id}</td>
                  <td class="text-center">{user.user_name}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}
  {/if}
</div>
