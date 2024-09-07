<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { popup, getModalStore } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { TrOutlineLogin2 } from 'svelte-icons-pack/tr';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { LuSettings, LuUserPlus } from 'svelte-icons-pack/lu';
  import { get_id_token_info } from '@tools/auth_tools';
  import { RiUserFacesAdminLine } from 'svelte-icons-pack/ri';
  import { BiLock, BiLogOut } from 'svelte-icons-pack/bi';
  import { deleteAuthCookies } from '@tools/auth_tools';
  import Modal from '@components/Modal.svelte';
  import Authenticate from '@components/pages/main_page/user/Authenticate.svelte';
  import { writable } from 'svelte/store';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';
  import NewUser from './NewUser.svelte';
  import ManageUser from './ManageUser.svelte';
  import UpdatePassword from './UpdatePassword.svelte';
  import { LanguageIcon } from '@components/icons';
  import { user_info, user_allowed_langs } from '@state/main_page/user';
  import { editing_status_on } from '@state/main_page/main_state';

  const modalStore = getModalStore();

  let pass_enterer_status = writable(false);
  let user_input_elmnt_login = writable<HTMLInputElement>(null!);

  let user_create_modal_status = writable(false);
  let name_input_elmnt_new_user = writable<HTMLInputElement>(null!);

  let update_password_modal_status = writable(false);

  let manage_user_modal_status = writable(false);

  const log_out = () => {
    const modal: ModalSettings = {
      type: 'confirm',
      title: 'Are you Sure to Log Out ?',
      response: (resp: boolean) => {
        if (!resp) return;
        deleteAuthCookies();
        $user_info = null;
      }
    };
    modalStore.trigger(modal);
  };
</script>

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
  {#if $user_info}
    <div class="select-none space-y-2 p-1">
      <div class="text-center text-base font-bold">
        {#if $user_info.user_type === 'admin'}
          <Icon class="-mt-1 text-2xl" src={RiUserFacesAdminLine} />
        {:else}
          <Icon class="-mt-1 text-2xl" src={AiOutlineUser} />
        {/if}{$user_info.user_name}
        <span class="text-sm text-gray-500 dark:text-gray-400">({$user_info.user_id})</span>
      </div>
      <div class="space-x-4">
        {#if $user_info.user_type === 'admin'}
          <button
            disabled={$editing_status_on}
            on:click={() => ($manage_user_modal_status = true)}
            class="btn space-x-2 rounded-md bg-primary-800 pb-1 pl-1 pr-2 pt-1 font-bold text-white"
          >
            <Icon class="text-2xl" src={LuSettings} />
            <span>Settings</span>
          </button>
        {/if}
        <button
          disabled={$editing_status_on}
          on:click={log_out}
          class="variant-filled-error btn m-0 rounded-md pb-1 pl-1 pr-2 pt-0 font-bold"
        >
          <Icon class="text-2xl" src={BiLogOut} />
          <span>Logout</span>
        </button>
      </div>
      <button
        disabled={$editing_status_on}
        on:click={() => ($update_password_modal_status = true)}
        class="btn m-0 rounded-md bg-secondary-800 pb-1 pl-1 pr-2 pt-0 font-bold text-white dark:bg-secondary-700"
      >
        <Icon class="text-2xl" src={BiLock} />
        <span>Update Password</span>
      </button>
      {#if $user_info.user_type !== 'admin' && ($user_allowed_langs.data ?? []).length > 0}
        <div>
          <Icon class="text-xl" src={LanguageIcon} /> :
          <span class="text-sm text-gray-500 dark:text-gray-300">
            {($user_allowed_langs.data ?? []).join(', ')}
          </span>
        </div>
      {/if}
    </div>
  {:else}
    <div class="space-y-2">
      <button
        on:click={() => {
          $pass_enterer_status = true;
          setTimeout(() => {
            $user_input_elmnt_login.focus();
          }, 500);
        }}
        class="group flex w-full space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon
          src={TrOutlineLogin2}
          class="-ml-1 -mt-1 text-3xl group-hover:text-gray-600 dark:group-hover:text-stone-400"
        />
        <span>Login</span>
      </button>
      <button
        on:click={() => {
          $user_create_modal_status = true;
          setTimeout(() => {
            $user_input_elmnt_login.focus();
          }, 500);
        }}
        class="group flex w-full space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon
          src={LuUserPlus}
          class="text-2xl group-hover:text-gray-600 dark:group-hover:text-stone-400"
        />
        <span>Signup</span>
      </button>
    </div>
  {/if}
</div>
<Modal modal_open={pass_enterer_status}>
  <div class="p-2">
    <Authenticate
      is_verified={writable(false)}
      show_always={true}
      user_input_element={user_input_elmnt_login}
      on_verify={(verified) => {
        if (verified) {
          $pass_enterer_status = false;
          $user_info = get_id_token_info().user;
        }
      }}
    />
  </div>
</Modal>
<Modal modal_open={user_create_modal_status} close_on_click_outside={false}>
  <div class="p-2">
    <NewUser
      name_input_element={name_input_elmnt_new_user}
      on_verify={() => {
        $user_create_modal_status = false;
      }}
    />
  </div>
</Modal>
<Modal modal_open={manage_user_modal_status} close_on_click_outside={false}>
  <div class="p-2">
    <ManageUser />
  </div>
</Modal>
<Modal modal_open={update_password_modal_status}>
  <UpdatePassword on_done={() => ($update_password_modal_status = false)} />
</Modal>
