<script lang="ts">
  import Icon from '~/tools/Icon.svelte';
  import { getModalStore, popup } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { TrOutlineLogin2 } from 'svelte-icons-pack/tr';
  import { LuSettings, LuUserPlus } from 'svelte-icons-pack/lu';
  import { get_id_token_info } from '~/tools/auth_tools';
  import { RiUserFacesAdminLine } from 'svelte-icons-pack/ri';
  import { BiLock, BiLogOut } from 'svelte-icons-pack/bi';
  import { deleteAuthCookies } from '~/tools/auth_tools';
  import Modal from '~/components/Modal.svelte';
  import Authenticate from '~/components/pages/main_page/user/Authenticate.svelte';
  import { writable } from 'svelte/store';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';
  import NewUser from './NewUser.svelte';
  import ManageUser from './ManageUser.svelte';
  import UpdatePassword from './UpdatePassword.svelte';
  import { LanguageIcon } from '~/components/icons';
  import { user_info, user_allowed_langs } from '~/state/main_page/user';
  import { editing_status_on } from '~/state/main_page/main_state';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { client, client_q } from '~/api/client';
  import { OiSync16 } from 'svelte-icons-pack/oi';
  import OtpVerification from './OTPVerification.svelte';
  import CorrectEmail from './CorrectEmail.svelte';
  import { createQuery } from '@tanstack/svelte-query';

  const modalStore = getModalStore();

  let pass_enterer_status = writable(false);
  let user_input_elmnt_login = writable<HTMLInputElement>(null!);

  let user_create_modal_status = writable(false);
  let name_input_elmnt_new_user = writable<HTMLInputElement>(null!);

  let email_verify_modal_status = writable(false);
  let email_correct_modal_status = writable(false);

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

  const trigger_translations_update = async () => {
    const modal: ModalSettings = {
      type: 'confirm',
      title: 'Are you sure to Sync Database Translations to Main Repository ?',
      body: 'This will commit the translations stored in the database to the main repository.',
      response: (resp: boolean) => {
        if (!resp) return;
        client.translations.trigger_translations_update.mutate().then((success) => {
          success &&
            setTimeout(() => {
              window.open(
                'https://github.com/shubhattin/valmiki_ramayanam/actions/workflows/commit_trans.yml',
                '_blank'
              );
            }, 1500);
        });
      }
    };
    modalStore.trigger(modal);
  };

  const user_verified_info = createQuery({
    queryKey: ['user_info', 'get_user_verified_status'],
    queryFn: async () => {
      return await client.user_info.get_user_verified_status.query();
    },
    enabled: $user_info?.user_type !== 'admin'
  });

  const open_otp_verification_modal = async () => {
    await client.user.email_verification.send_user_email_verify_otp.query();
    $email_verify_modal_status = true;
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
  <Icon
    class="text-2xl hover:text-gray-600 sm:text-3xl dark:hover:text-gray-400"
    src={VscAccount}
  />
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
            onclick={() => ($manage_user_modal_status = true)}
            class="btn space-x-2 rounded-md bg-primary-800 pb-1 pl-1 pr-2 pt-1 font-bold text-white"
          >
            <Icon class="text-2xl" src={LuSettings} />
            <span>Settings</span>
          </button>
        {/if}
        <button
          disabled={$editing_status_on}
          onclick={log_out}
          class="variant-filled-error btn m-0 rounded-md pb-1 pl-1 pr-2 pt-0 text-sm font-bold sm:text-base"
        >
          <Icon class="text-2xl" src={BiLogOut} />
          <span>Logout</span>
        </button>
      </div>
      <button
        disabled={$editing_status_on}
        onclick={() => ($update_password_modal_status = true)}
        class="btn m-0 rounded-md bg-secondary-800 pb-1 pl-1 pr-2 pt-0 text-sm font-bold text-white sm:text-base dark:bg-secondary-700"
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
      {#if $user_info.user_type === 'admin'}
        <button
          onclick={trigger_translations_update}
          disabled={$editing_status_on}
          class="btn m-0 block rounded-md bg-primary-900 px-1 py-0 font-bold text-white dark:bg-primary-900"
        >
          <Icon src={OiSync16} class="my-1 mb-1 text-xl" />
          <span class="text-sm">Sync Translations from DB</span>
        </button>
      {/if}
      {#if $user_info.user_type !== 'admin' && !$user_verified_info.isFetching && $user_verified_info.isSuccess}
        {#if !$user_verified_info.data.user_approved}
          {#if !$user_verified_info.data.email_verified}
            <div class="text-sm text-warning-600 dark:text-warning-400">
              Your Email is not Verified.
              <button
                onclick={open_otp_verification_modal}
                class="btn rounded-lg bg-primary-600 px-1 py-0 font-bold text-white">Verify</button
              >
              <button
                onclick={() => ($email_correct_modal_status = true)}
                class="btn ml-1 rounded-lg bg-secondary-600 px-1 py-0 text-sm font-bold text-white"
                >Correct Email</button
              >
            </div>
          {/if}
          <div class="text-sm text-error-600 dark:text-error-400">
            Your account is not approved by the Admin.
          </div>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="space-y-2">
      <button
        onclick={() => {
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
        onclick={() => {
          $user_create_modal_status = true;
          setTimeout(() => {
            $name_input_elmnt_new_user.focus();
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
<Modal bind:modal_open={$pass_enterer_status} close_on_click_outside={false}>
  <div class="p-2">
    <Authenticate
      is_verified={false}
      show_always={true}
      bind:user_input_element={$user_input_elmnt_login}
      bind:pass_input_modal_open={$pass_enterer_status}
      on_verify={(verified) => {
        if (verified) {
          $pass_enterer_status = false;
          $user_info = get_id_token_info().user;
        }
      }}
    />
  </div>
</Modal>
<Modal bind:modal_open={$user_create_modal_status} close_on_click_outside={false}>
  <div class="p-2">
    <NewUser
      bind:name_input_element={$name_input_elmnt_new_user}
      on_verify={() => {
        $user_create_modal_status = false;
      }}
    />
  </div>
</Modal>
<Modal bind:modal_open={$manage_user_modal_status} close_on_click_outside={false}>
  <div class="p-2">
    <ManageUser />
  </div>
</Modal>
<Modal bind:modal_open={$update_password_modal_status}>
  <UpdatePassword on_done={() => ($update_password_modal_status = false)} />
</Modal>
<Modal bind:modal_open={$email_verify_modal_status}>
  <OtpVerification
    id={$user_info!.id}
    on_verified={() => {
      $email_verify_modal_status = false;
    }}
  />
</Modal>
<Modal bind:modal_open={$email_correct_modal_status} close_on_click_outside={false}>
  <CorrectEmail on_done={() => ($email_correct_modal_status = false)} />
</Modal>
