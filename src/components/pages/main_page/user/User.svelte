<script lang="ts">
  import Icon from '~/tools/Icon.svelte';
  import { getModalStore, popup } from '@skeletonlabs/skeleton';
  import type { ModalSettings } from '@skeletonlabs/skeleton';
  import { TrOutlineLogin2 } from 'svelte-icons-pack/tr';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import { RiUserFacesAdminLine } from 'svelte-icons-pack/ri';
  import { BiLogOut } from 'svelte-icons-pack/bi';
  import Modal from '~/components/Modal.svelte';
  import { writable } from 'svelte/store';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';
  import { LanguageIcon } from '~/components/icons';
  import { editing_status_on } from '~/state/main_page/main_state';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { client } from '~/api/client';
  import { OiSync16 } from 'svelte-icons-pack/oi';
  import { signOut, useSession } from '~/lib/auth-client';
  import Login from '~/components/pages/main_page/user/Login.svelte';
  import Signup from './Signup.svelte';
  import { get_user_verified_info } from '~/state/main_page/user.svelte';

  const user_verified_info = $derived(get_user_verified_info());
  const modalStore = getModalStore();

  const session = useSession();

  let user_info = $derived($session.data?.user);

  let pass_enterer_status = writable(false);
  let user_input_elmnt_login = writable<HTMLInputElement>(null!);

  let user_create_modal_status = writable(false);
  let name_input_elmnt_new_user = writable<HTMLInputElement>(null!);

  const log_out = () => {
    const modal: ModalSettings = {
      type: 'confirm',
      title: 'Are you Sure to Log Out ?',
      response: (resp: boolean) => {
        if (!resp) return;
        signOut();
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
  {#if user_info}
    <div class="select-none space-y-2 p-1">
      <div class="text-center text-base font-bold">
        {#if user_info.role === 'admin'}
          <Icon class="-mt-1 text-2xl" src={RiUserFacesAdminLine} />
        {:else}
          <Icon class="-mt-1 text-2xl" src={AiOutlineUser} />
        {/if}{user_info.name}
      </div>
      <div class="space-x-4">
        <button
          disabled={$editing_status_on}
          onclick={log_out}
          class="variant-filled-error btn m-0 rounded-md pb-1 pl-1 pr-2 pt-0 text-sm font-bold sm:text-base"
        >
          <Icon class="text-2xl" src={BiLogOut} />
          <span>Logout</span>
        </button>
      </div>
      {#if user_info.role !== 'admin' && $user_verified_info.isSuccess}
        {@const langs = $user_verified_info.data.langugaes!}
        {#if langs.length > 0}
          <div>
            <Icon class="text-xl" src={LanguageIcon} /> :
            <span class="text-sm text-gray-500 dark:text-gray-300">
              {langs.map((l) => l.lang_name).join(', ')}
            </span>
          </div>
        {/if}
      {/if}
      {#if user_info.role === 'admin'}
        <button
          onclick={trigger_translations_update}
          disabled={$editing_status_on}
          class="btn m-0 block rounded-md bg-primary-900 px-1 py-0 font-bold text-white dark:bg-primary-900"
        >
          <Icon src={OiSync16} class="my-1 mb-1 text-xl" />
          <span class="text-sm">Sync Translations from DB</span>
        </button>
      {/if}
      {#if user_info.role !== 'admin' && !$user_verified_info.isFetching && $user_verified_info.isSuccess}
        {#if !$user_verified_info.data.is_approved}
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
<Modal bind:modal_open={$pass_enterer_status}>
  <div class="p-2">
    <Login />
  </div>
</Modal>
<Modal bind:modal_open={$user_create_modal_status}>
  <div class="p-2">
    <Signup />
  </div>
</Modal>
