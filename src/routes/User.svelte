<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { popup, getModalStore } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { TrOutlineLogin2 } from 'svelte-icons-pack/tr';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import { onMount } from 'svelte';
  import { get_id_token_info, ID_TOKEN_INFO_SCHEMA } from '@tools/auth_tools';
  import { z } from 'zod';
  import { RiUserFacesAdminLine } from 'svelte-icons-pack/ri';
  import { BiLogOut } from 'svelte-icons-pack/bi';
  import { deleteAuthCookies } from '@tools/auth_tools';
  import Modal from '@components/Modal.svelte';
  import Authenticate from '@components/Authenticate.svelte';
  import { writable } from 'svelte/store';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';

  const modalStore = getModalStore();

  let user_info: z.infer<typeof ID_TOKEN_INFO_SCHEMA> | null = null;
  onMount(() => {
    try {
      user_info = get_id_token_info().user;
    } catch {}
  });

  let pass_enterer_status = writable(false);
  let user_input_elmnt = writable<HTMLInputElement>(null!);

  const log_out = () => {
    const modal: ModalSettings = {
      type: 'confirm',
      title: 'Are you Sure to Log Out ?',
      response: (resp: boolean) => {
        if (!resp) return;
        deleteAuthCookies();
        user_info = null;
      }
    };
    modalStore.trigger(modal);
  };
</script>

<Modal modal_open={pass_enterer_status}>
  <div class="p-2">
    <Authenticate
      is_verified={writable(false)}
      show_always={true}
      user_input_element={user_input_elmnt}
      on_verify={(verified) => {
        if (verified) {
          $pass_enterer_status = false;
          user_info = get_id_token_info().user;
        }
      }}
    />
  </div>
</Modal>
<button
  class="btn m-2 p-0"
  use:popup={{
    event: 'click',
    target: 'user_info',
    placement: 'left-start'
  }}
>
  <Icon class="hover:text-gray-6200 text-3xl dark:hover:text-gray-400" src={VscAccount} />
</button>
<div class="card z-40 px-1 py-2 shadow-2xl" data-popup="user_info">
  {#if user_info}
    <div class="select-none space-y-2 p-1">
      <div class="text-base font-bold">
        {#if user_info.user_type === 'admin'}
          <Icon class="-mt-1 text-2xl" src={RiUserFacesAdminLine} />
        {:else}
          <Icon class="-mt-1 text-2xl" src={AiOutlineUser} />
        {/if}{user_info.user_name}
        <span class="text-sm text-gray-500 dark:text-gray-400">({user_info.user_id})</span>
      </div>
      <button
        on:click={log_out}
        class="variant-filled-error btn m-0 rounded-md pb-1 pl-1 pr-2 pt-0 font-bold"
      >
        <Icon class="text-2xl" src={BiLogOut} />
        <span>Logout</span>
      </button>
    </div>
  {:else}
    <div class="space-y-2">
      <button
        on:click={() => {
          $pass_enterer_status = true;
        }}
        class="text-md flex w-full space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon src={TrOutlineLogin2} class="-ml-1 -mt-1 text-3xl" />
        <span>Login</span>
      </button>
      <button
        class="text-md flex w-full space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon src={LuUserPlus} class="text-2xl" />
        <span>Signup</span>
      </button>
    </div>
  {/if}
</div>
