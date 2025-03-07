<script lang="ts">
  import Icon from '~/tools/Icon.svelte';
  import { TrOutlineLogin2 } from 'svelte-icons-pack/tr';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import { RiUserFacesAdminLine } from 'svelte-icons-pack/ri';
  import { BiLogOut } from 'svelte-icons-pack/bi';
  import { writable } from 'svelte/store';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';
  import { LanguageIcon } from '~/components/icons';
  import { editing_status_on } from '~/state/main_page/main_state';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { client } from '~/api/client';
  import { OiLinkExternal16, OiSync16 } from 'svelte-icons-pack/oi';
  import { signOut, useSession } from '~/lib/auth-client';
  import Login from '~/components/pages/main_page/user/Login.svelte';
  import Signup from './Signup.svelte';
  import { get_user_verified_info } from '~/state/main_page/user.svelte';
  import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import { Modal, Popover } from '@skeletonlabs/skeleton-svelte';

  const user_verified_info = $derived.by(get_user_verified_info);

  const session = useSession();

  let user_info = $derived($session.data?.user);

  let pass_enterer_status = writable(false);
  let user_input_elmnt_login = writable<HTMLInputElement>(null!);

  let user_create_modal_status = writable(false);
  let name_input_elmnt_new_user = writable<HTMLInputElement>(null!);

  const log_out = () => {
    signOut();
  };

  const trigger_translations_update = async () => {
    client.translations.trigger_translations_update.mutate().then((success) => {
      success &&
        setTimeout(() => {
          window.open(
            'https://github.com/shubhattin/valmiki_ramayanam/actions/workflows/commit_trans.yml',
            '_blank'
          );
        }, 1500);
    });
    // const modal: ModalSettings = {
    //   type: 'confirm',
    //   title: 'Are you sure to Sync Database Translations to Main Repository ?',
    //   body: 'This will commit the translations stored in the database to the main repository.',
    //   response: (resp: boolean) => {
    //     if (!resp) return;
    //   }
    // };
    // modalStore.trigger(modal);
  };
</script>

<Popover
  positioning={{ placement: 'left-start' }}
  arrow={false}
  contentBase={'card z-50 space-y-2 p-2 rounded-lg shadow-xl bg-zinc-100 dark:bg-surface-900'}
>
  {#snippet trigger()}
    <span class="btn m-2 p-0">
      <Icon
        class="text-2xl hover:text-gray-600 sm:text-3xl dark:hover:text-gray-400"
        src={VscAccount}
      />
    </span>
  {/snippet}
  {#snippet content()}
    {#if user_info}
      <div class="space-y-2 p-1 select-none">
        <div class="space-x-1.5 sm:space-x-2">
          <span class="text-center text-base font-bold">
            {#if user_info.role === 'admin'}
              <Icon class="-mt-1 text-2xl" src={RiUserFacesAdminLine} />
            {:else}
              <Icon class="-mt-1 text-2xl" src={AiOutlineUser} />
            {/if}
            {user_info.name}
          </span>
          <a
            class="btn m-0 p-0 hover:text-blue-600 dark:hover:text-blue-500"
            href={PUBLIC_BETTER_AUTH_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Account Settings"
          >
            <Icon src={OiLinkExternal16} class="text-xl" />
          </a>
        </div>
        <div class="space-x-4">
          <ConfirmModal
            popup_state={false}
            close_on_confirm={true}
            confirm_func={log_out}
            description="Are you Sure to Log Out ?"
          >
            <button
              disabled={$editing_status_on}
              class="preset-filled-error-500 btn m-0 rounded-md pt-0 pr-2 pb-1 pl-1 text-sm font-bold sm:text-base"
            >
              <Icon class="text-2xl" src={BiLogOut} />
              <span>Logout</span>
            </button>
          </ConfirmModal>
        </div>
        {#if user_info.role !== 'admin' && $user_verified_info.isSuccess}
          {#if user_info.is_approved}
            {@const langs = $user_verified_info.data.langugaes!}
            {#if langs && langs.length > 0}
              <div>
                <Icon class="text-xl" src={LanguageIcon} /> :
                <span class="text-sm text-gray-500 dark:text-gray-300">
                  {langs.map((l) => l.lang_name).join(', ')}
                </span>
              </div>
            {:else}
              <div class="text-warning-600 dark:text-warning-500 text-sm">
                No languages assigned
              </div>
            {/if}
          {:else}
            <div class="text-warning-600 dark:text-warning-500 text-sm">
              You account is not approved by Admin
            </div>
          {/if}
        {/if}
        {#if user_info.role === 'admin'}
          <ConfirmModal
            popup_state={false}
            close_on_confirm={true}
            confirm_func={trigger_translations_update}
            description="Are you sure to Sync Database Translations to Main Repository ?"
          >
            <button
              disabled={$editing_status_on}
              class="btn bg-primary-800 dark:bg-primary-900 m-0 block rounded-md px-1 py-0 font-bold text-white"
            >
              <Icon src={OiSync16} class="my-1 mb-1 text-xl" />
              <span class="text-sm">Sync Translations from DB</span>
            </button>
          </ConfirmModal>
        {/if}
      </div>
    {:else}
      <div class="space-y-1 sm:space-y-2">
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
            class="-mt-1 -ml-1 text-2xl group-hover:text-gray-600 sm:text-3xl dark:group-hover:text-stone-400"
          />
          <span class="text-sm sm:text-base">Login</span>
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
            class="text-xl group-hover:text-gray-600 sm:text-2xl dark:group-hover:text-stone-400"
          />
          <span class="text-sm sm:text-base">Signup</span>
        </button>
      </div>
    {/if}
  {/snippet}
</Popover>
<Modal
  contentBase={'card z-50 space-y-2 p-2 rounded-lg shadow-xl bg-zinc-100 dark:bg-surface-900'}
  open={$pass_enterer_status}
  onOpenChange={(e) => ($pass_enterer_status = e.open)}
>
  {#snippet content()}
    <div class="min-h-30 p-2">
      <Login />
    </div>
  {/snippet}
</Modal>
<Modal
  contentBase={'card z-50 space-y-2 p-2 rounded-lg shadow-xl bg-zinc-100 dark:bg-surface-900'}
  open={$user_create_modal_status}
  onOpenChange={(e) => ($user_create_modal_status = e.open)}
>
  {#snippet content()}
    <div class="min-h-30 p-2">
      <Signup />
    </div>
  {/snippet}
</Modal>
