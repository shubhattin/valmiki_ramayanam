<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { client } from '@api/client';
  import { getModalStore, popup } from '@skeletonlabs/skeleton';
  import { get_id_token_info } from '@tools/auth_tools';
  import { RiSystemAddLargeFill, RiSystemCloseLargeLine } from 'svelte-icons-pack/ri';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { delay } from '@tools/delay';
  import { LanguageIcon } from '@components/icons';
  import { FiEdit3 } from 'svelte-icons-pack/fi';
  import { LANG_LIST } from '@tools/lang_list';
  import { user_info } from '@state/user';

  const modal_store = getModalStore();

  const currrent_user_info = $user_info!;
  let users_info: Awaited<ReturnType<typeof client.user_info.get_all_users_info.query>> | null;
  let admin_users_index: number[] = [];
  let normal_users_index: number[] = [];
  let unverified_normal_users_index: number[] = [];
  let selected_langs_index: string[][] = [];

  onMount(() => {
    if (currrent_user_info.user_type === 'admin') fetch_user_info();
  });
  const fetch_user_info = async () => {
    if (!browser) return;
    users_info = null;
    admin_users_index = [];
    normal_users_index = [];
    unverified_normal_users_index = [];
    selected_langs_index = [];
    await delay(600);
    const info = await client.user_info.get_all_users_info.query();
    users_info = info;

    for (let i = 0; i < users_info.length; i++) {
      const user = users_info[i];
      if (user.user_type === 'admin') {
        admin_users_index.push(i);
      } else {
        if (!user.user_verification_requests) {
          normal_users_index.push(i);
          selected_langs_index.push(user.allowed_langs ? user.allowed_langs : []);
        } else unverified_normal_users_index.push(i);
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
          await client.auth.verify_unverified_user.mutate({ id: id });
          await fetch_user_info();
        })();
      }
    });
  };
  const remove_unverified_user = async (id: number, user_id: string) => {
    modal_store.trigger({
      type: 'confirm',
      title: `Are you sure to remove '${user_id}' user?`,
      response(r: boolean) {
        if (!r) return;
        (async () => {
          await client.auth.delete_unverified_user.mutate({ id: id });
          await fetch_user_info();
        })();
      }
    });
  };
  const add_allowed_langs = async (id: number, langs: string[]) => {
    await client.auth.add_user_allowed_langs.mutate({ id: id, langs: langs });
    await fetch_user_info();
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Manage User Settings</div>
<div class="mt-1 space-y-1">
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
      {#if normal_users_index.length !== 0}
        <div>
          <div class="text-lg font-bold underline">Users</div>
          {#each normal_users_index as index, i (users_info[index].user_id)}
            {@const user = users_info[index]}
            <div>
              <span class="font-bold">{user.user_name}</span>
              <span class="text text-sm text-gray-500 dark:text-gray-400">({user.user_id})</span>
              <span class="ml-1 text-xs">
                <Icon class="-mt-1 text-lg" src={LanguageIcon} />
                {#if user.allowed_langs}
                  {user.allowed_langs.join(', ')}
                {/if}
                <button
                  class="btn m-0 p-0"
                  use:popup={{
                    event: 'click',
                    target: 'langPopup-' + user.id,
                    placement: 'bottom'
                  }}
                >
                  <Icon src={FiEdit3} class="text-lg" />
                </button>
                <div
                  class="card z-[100] rounded-lg px-3 py-2 shadow-xl"
                  data-popup="langPopup-{user.id}"
                >
                  <div class="space-y-2">
                    <select class="select px-2 py-1" multiple bind:value={selected_langs_index[i]}>
                      {#each LANG_LIST as lang (lang)}
                        <option value={lang}>{lang}</option>
                      {/each}
                    </select>
                    <button
                      on:click={() => add_allowed_langs(user.id, selected_langs_index[i])}
                      class="variant-filled-primary btn rounded-md px-2 py-1 text-white"
                      >Update</button
                    >
                  </div>
                  <div class="bg-surface-100-800-token arrow" />
                </div>
              </span>
            </div>
          {/each}
        </div>
      {/if}
      {#if unverified_normal_users_index.length !== 0}
        <div>
          <div class="text-lg font-bold underline">Unverified Normal Users</div>
          <div class="space-y-1">
            {#each unverified_normal_users_index as index (users_info[index].user_id)}
              {@const user = users_info[index]}
              <div class="space-x-2">
                <span class="font-bold">{user.user_name}</span>
                <span class="text text-sm text-gray-500 dark:text-gray-400">({user.user_id})</span>
                <button
                  title="Verify User"
                  on:click={() => add_unverified_user(user.id, user.user_id)}
                  class="btn mx-1 inline-block p-0"
                >
                  <Icon src={RiSystemAddLargeFill} class="text-xl" />
                </button>
                <button
                  title="Remove User"
                  on:click={() => remove_unverified_user(user.id, user.user_id)}
                  class="btn mx-1 inline-block p-0"
                >
                  <Icon src={RiSystemCloseLargeLine} class="text-xl" />
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {:else}
      <section class="card w-full space-y-3">
        {#each Array.from({ length: 3 }) as _, i}
          <div class="space-y-2">
            <div class="placeholder animate-pulse" />
            <div class="grid grid-cols-3 gap-8">
              <div class="placeholder animate-pulse" />
              <div class="placeholder animate-pulse" />
              <div class="placeholder animate-pulse" />
            </div>
            <div class="grid grid-cols-4 gap-4">
              <div class="placeholder animate-pulse" />
              <div class="placeholder animate-pulse" />
              <div class="placeholder animate-pulse" />
              <div class="placeholder animate-pulse" />
            </div>
          </div>
        {/each}
      </section>
    {/if}
  {/if}
</div>
